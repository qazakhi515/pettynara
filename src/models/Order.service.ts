import { shapeIntoMongooseObjectId } from "../libs/config";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
  PaymentConfirmInput,
} from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { isValidObjectId, ObjectId } from "mongoose";
import MemberService from "./Member.service";
import {
  confirmTossPayment,
  getTossPayment,
  isTossConfigured,
  TossApiError,
  TossPayment,
} from "../libs/utils/toss";

/**
 * The orderId sent to Toss: our order _id plus a suffix, so a buyer who closes
 * the payment window can try again with a fresh id for the same order. Toss
 * allows 6-64 characters of letters, digits, "-" and "_".
 */
const TOSS_ORDER_ID = /^([a-f0-9]{24})_[a-z0-9]{4,20}$/;

const MAX_ITEM_QUANTITY = 100;

/**
 * The status changes a member may make with updateOrder. PAUSE -> PROCESS is
 * the payment, so it is left out: only confirmPayment, after Toss Payments
 * approves the charge, can make it.
 */
const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PAUSE]: [OrderStatus.DELETE],
  [OrderStatus.PROCESS]: [OrderStatus.FINISH],
  [OrderStatus.FINISH]: [OrderStatus.DELETE],
  [OrderStatus.DELETE]: [],
};

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly productModel;
  private readonly memberService;
  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.productModel = ProductModel;
    this.memberService = new MemberService();
  }

  public async createOrder(
    member: Member,
    input: OrderItemInput[],
  ): Promise<Order> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const items = await this.priceOrderItems(input);
    const amount = items.reduce((accumulator: number, item: OrderItemInput) => {
      // iterate
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;
    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      console.log("orderId:", newOrder._id);
      await this.recordOrderItem(orderId, items);

      return newOrder;
    } catch (err) {
      console.log("Error, model:createOrder:", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  /**
   * Validates the basket sent by the client and prices it from the database.
   * The client only chooses products and quantities; trusting its itemPrice
   * let anyone order a product for any amount.
   */
  private async priceOrderItems(input: unknown): Promise<OrderItemInput[]> {
    const invalid = new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER_ITEMS);
    if (!Array.isArray(input) || input.length === 0) throw invalid;

    for (const item of input) {
      const quantity = item?.itemQuantity;
      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_ITEM_QUANTITY ||
        !isValidObjectId(item?.productId)
      )
        throw invalid;
    }

    const products = await this.productModel
      .find({
        _id: { $in: input.map((item) => String(item.productId)) },
        productStatus: ProductStatus.PROCESS,
      })
      .exec();
    const priceById = new Map<string, number>(
      products.map((p) => [String(p._id), p.productPrice]),
    );

    return input.map((item) => {
      const itemPrice = priceById.get(String(item.productId));
      if (itemPrice === undefined) throw invalid;
      return {
        productId: shapeIntoMongooseObjectId(String(item.productId)),
        itemQuantity: item.itemQuantity,
        itemPrice,
      };
    });
  }

  private async recordOrderItem(
    orderId: ObjectId,
    input: OrderItemInput[],
  ): Promise<void> {
    // void vaqti qiymat qaytarmaydi
    const promisedList = input.map(async (item: OrderItemInput) => {
      // pending  qilyopti
      // filter ishlatmimiz no orin , filter async bn ishlamaydi , promise ni tushinmaydi
      item.orderId = orderId;
      item.productId = shapeIntoMongooseObjectId(item.productId);
      return await this.orderItemModel.create(item);
    });
    console.log(promisedList);
    const orderItemState = await Promise.all(promisedList); // bunda pending larni bir qilib qaytarib beradi
    console.log("orderItemState", orderItemState);
  }

  public async getMyOrders(
    member: Member,
    inquriy: OrderInquiry,
  ): Promise<Order[]> {
    const memberId = shapeIntoMongooseObjectId(member._id);
    const matches = { memberId: memberId, orderStatus: inquriy.orderStatus };
    const result = await this.orderModel
      .aggregate([
        { $match: matches },
        { $sort: { updatedAt: -1 } }, // descent, ascent, 1 osish kamayish
        { $skip: (inquriy.page - 1) * inquriy.limit },
        { $limit: inquriy.limit }, // Order yaratadi Order1 Order2 Order3
        {
          $lookup: {
            localField: "_id", // Orderni _id si olin
            from: "orderItems", // Order items collection ga borib
            foreignField: "orderId", // OrderItems ni orderId si. ni olin order _id bn shuni solishtirib
            as: "orderItems", // order Items nomi bn save qiladi
          },
        },
        {
          $lookup: {
            // tepadagi order items ni ichiga kirish
            localField: "orderItems.productId",
            from: "products",
            foreignField: "_id",
            as: "productData",
          },
        },

        {
          $lookup: {
            // member ni nomini olish
            localField: "memberId",
            from: "members",
            foreignField: "_id",
            as: "memberData",
          },
        },
      ])
      .exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);
    return result;
  }
  public async updateOrder(
    member: Member,
    input: OrderUpdateInput,
  ): Promise<Order> {
    if (!isValidObjectId(input.orderId))
      throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(input.orderId),
      orderStatus = input.orderStatus;

    const current = await this.orderModel
      .findOne({ _id: orderId, memberId: memberId })
      .exec();
    if (!current) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

    // Without this check an order could go PROCESS -> PAUSE -> PROCESS again
    // and earn a point every time, or jump straight to FINISH unpaid.
    if (!ORDER_STATUS_FLOW[current.orderStatus as OrderStatus]?.includes(orderStatus))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_STATUS_CHANGE);

    // findByIdAndUpdate object filterni qabul qilmaydi — mongoose undan faqat _id ni
    // olib, memberId ni jimgina tashlab yuborardi (ya'ni egalik tekshiruvi ishlamasdi).
    // orderStatus in the filter makes two parallel "pay" requests succeed once.
    const result = await this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          memberId: memberId,
          orderStatus: current.orderStatus,
        },
        { orderStatus: orderStatus },
        { new: true },
      )
      .exec();

    if (!result)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_STATUS_CHANGE);

    return result;
  }

  /**
   * Finishes a Toss Payments checkout: the browser comes back to successUrl
   * with paymentKey, orderId and amount, and posts them here. Nothing is
   * charged until Toss confirms, so every check runs before that call.
   */
  public async confirmPayment(
    member: Member,
    input: PaymentConfirmInput,
  ): Promise<Order> {
    if (!isTossConfigured())
      throw new Errors(HttpCode.SERVICE_UNAVAILABLE, Message.PAYMENTS_DISABLED);

    const { paymentKey, orderId: tossOrderId, amount } = input ?? {};
    const match =
      typeof tossOrderId === "string" ? TOSS_ORDER_ID.exec(tossOrderId) : null;
    if (
      !match ||
      typeof paymentKey !== "string" ||
      paymentKey.length === 0 ||
      paymentKey.length > 200 ||
      !Number.isInteger(amount)
    )
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PAYMENT);

    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(match[1]);

    const order = await this.orderModel
      .findOne({ _id: orderId, memberId: memberId })
      .exec();
    if (!order) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUNG);

    // The success page can be reloaded; answer with the paid order again.
    if (order.orderStatus === OrderStatus.PROCESS && order.paymentKey === paymentKey)
      return order;
    if (order.orderStatus !== OrderStatus.PAUSE)
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_STATUS_CHANGE);

    // The amount comes from the browser. Checking it against the stored total
    // before confirming stops a buyer from paying less than the order costs.
    if (amount !== order.orderTotal)
      throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_AMOUNT_MISMATCH);

    const payment = await this.approveWithToss({
      paymentKey,
      orderId: tossOrderId,
      amount,
    });
    if (
      payment.status !== "DONE" ||
      payment.orderId !== tossOrderId ||
      payment.totalAmount !== order.orderTotal
    ) {
      console.log("Error, confirmPayment: unexpected Toss payment", payment);
      throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_FAILED);
    }

    // orderStatus in the filter makes a parallel confirm succeed only once.
    const paid = await this.orderModel
      .findOneAndUpdate(
        { _id: orderId, memberId: memberId, orderStatus: OrderStatus.PAUSE },
        {
          orderStatus: OrderStatus.PROCESS,
          paymentKey: payment.paymentKey,
          paymentMethod: payment.method,
          paidAt: payment.approvedAt ? new Date(payment.approvedAt) : new Date(),
        },
        { new: true },
      )
      .exec();
    if (!paid) {
      const current = await this.orderModel.findById(orderId).exec();
      if (current?.paymentKey === paymentKey) return current;
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_STATUS_CHANGE);
    }

    // ball qo'shish — bonus amal. Yiqilsa ham to'lov bekor bo'lmasligi kerak
    try {
      await this.memberService.addUserPoint(member, 1);
    } catch (err) {
      console.log("Warn, addUserPoint failed (order still PROCESS):", err);
    }
    return paid;
  }

  /** Calls the Toss confirm API and maps its failures to API errors. */
  private async approveWithToss(
    input: PaymentConfirmInput,
  ): Promise<TossPayment> {
    try {
      return await confirmTossPayment(input);
    } catch (err) {
      if (err instanceof TossApiError) {
        console.log("Error, Toss confirm:", err.status, err.code, err.message);
        // A retry after a lost response: the payment is already approved.
        if (err.code === "ALREADY_PROCESSED_PAYMENT")
          return await getTossPayment(input.paymentKey).catch(() => {
            throw new Errors(HttpCode.BAD_GATEWAY, Message.PAYMENT_PROVIDER_DOWN);
          });
        if (err.status >= 500)
          throw new Errors(HttpCode.BAD_GATEWAY, Message.PAYMENT_PROVIDER_DOWN);
        throw new Errors(HttpCode.BAD_REQUEST, Message.PAYMENT_FAILED);
      }
      console.log("Error, Toss confirm:", err);
      throw new Errors(HttpCode.BAD_GATEWAY, Message.PAYMENT_PROVIDER_DOWN);
    }
  }
}

export default OrderService;
