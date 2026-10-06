import { shapeIntoMongooseObjectId } from "../libs/config";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import {
  Order,
  OrderInquiry,
  OrderItemInput,
  OrderUpdateInput,
} from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";
import { isValidObjectId, ObjectId } from "mongoose";
import MemberService from "./Member.service";

const MAX_ITEM_QUANTITY = 100;

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
    const memberId = shapeIntoMongooseObjectId(member._id),
      orderId = shapeIntoMongooseObjectId(input.orderId),
      orderStatus = input.orderStatus;
    // findByIdAndUpdate object filterni qabul qilmaydi — mongoose undan faqat _id ni
    // olib, memberId ni jimgina tashlab yuborardi (ya'ni egalik tekshiruvi ishlamasdi)
    const result = await this.orderModel
      .findOneAndUpdate(
        {
          _id: orderId,
          memberId: memberId,
        },
        { orderStatus: orderStatus },
        { new: true },
      )
      .exec();

    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.UPDATE_FAILED);

    if (orderStatus === OrderStatus.PROCESS) {
      // ball qo'shish — bonus amal. Yiqilsa ham to'lov bekor bo'lmasligi kerak
      try {
        await this.memberService.addUserPoint(member, 1);
      } catch (err) {
        console.log("Warn, addUserPoint failed (order still PROCESS):", err);
      }
    }
    return result;
  }
}

export default OrderService;
