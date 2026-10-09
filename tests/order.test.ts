import { OrderStatus } from "../src/libs/enums/order.enum";
import { ProductStatus } from "../src/libs/enums/product.enum";
import MemberModel from "../src/schema/Member.model";
import { api, createProduct, payOrder, signupMember } from "./helpers";

const orderBody = (product: any, quantity = 1) => [
  { productId: String(product._id), itemQuantity: quantity, itemPrice: product.productPrice },
];

const createOrder = async (auth: Record<string, string>, body: object) =>
  api().post("/order/create").set(auth).send(body);

const myOrders = async (auth: Record<string, string>, orderStatus: OrderStatus) =>
  api().get("/order/all").set(auth).query({ page: 1, limit: 10, orderStatus });

const updateOrder = async (auth: Record<string, string>, orderId: string, orderStatus: OrderStatus) =>
  api().post("/order/update").set(auth).send({ orderId, orderStatus });

describe("orders", () => {
  it("require a logged-in member", async () => {
    const res = await api().post("/order/create").send([]);
    expect(res.status).toBe(401);
  });

  it("creates a paused order with the items' total", async () => {
    const { auth } = await signupMember();
    const product = await createProduct({ productPrice: 120000 });

    const res = await createOrder(auth, orderBody(product, 2));

    expect(res.status).toBe(201);
    expect(res.body.orderStatus).toBe(OrderStatus.PAUSE);
    expect(res.body.orderTotal).toBe(240000);
  });

  it("lists only the member's own orders", async () => {
    const alice = await signupMember();
    const bob = await signupMember();
    const product = await createProduct();
    await createOrder(alice.auth, orderBody(product));

    const aliceOrders = await myOrders(alice.auth, OrderStatus.PAUSE);
    const bobOrders = await myOrders(bob.auth, OrderStatus.PAUSE);

    expect(aliceOrders.body).toHaveLength(1);
    expect(aliceOrders.body[0].orderItems).toHaveLength(1);
    expect(bobOrders.body).toHaveLength(0);
  });

  // Regression: findByIdAndUpdate dropped the memberId filter, so any member
  // could change any order.
  it("cannot be changed by another member", async () => {
    const alice = await signupMember();
    const bob = await signupMember();
    const order = await createOrder(alice.auth, orderBody(await createProduct()));

    const res = await updateOrder(bob.auth, order.body._id, OrderStatus.DELETE);

    expect(res.status).toBe(404);
    const stillPaused = await myOrders(alice.auth, OrderStatus.PAUSE);
    expect(stillPaused.body).toHaveLength(1);
  });

  it("gives the member a point when the order is paid", async () => {
    const { auth, member } = await signupMember();
    const order = await createOrder(auth, orderBody(await createProduct()));

    const res = await payOrder(auth, order.body);

    expect(res.status).toBe(200);
    expect(res.body.orderStatus).toBe(OrderStatus.PROCESS);
    const stored = await MemberModel.findById(member._id);
    expect(stored?.memberPoints).toBe(1);
  });
});

describe("order creation input", () => {
  it("charges the price stored in the database, not the one sent by the client", async () => {
    const { auth } = await signupMember();
    const product = await createProduct({ productPrice: 200000 });

    const res = await createOrder(auth, [
      { productId: String(product._id), itemQuantity: 1, itemPrice: 1 },
    ]);

    expect(res.status).toBe(201);
    expect(res.body.orderTotal).toBe(200000);
  });

  it.each([0, -1, 1.5, 101, "2"])("rejects quantity %p", async (itemQuantity) => {
    const { auth } = await signupMember();
    const product = await createProduct();
    const res = await createOrder(auth, [
      { productId: String(product._id), itemQuantity, itemPrice: product.productPrice },
    ]);
    expect(res.status).toBe(400);
  });

  it("rejects an empty order", async () => {
    const { auth } = await signupMember();
    const res = await createOrder(auth, []);
    expect(res.status).toBe(400);
  });

  it("rejects products that are not on sale", async () => {
    const { auth } = await signupMember();
    const paused = await createProduct({ productStatus: ProductStatus.PAUSE });
    const res = await createOrder(auth, orderBody(paused));
    expect(res.status).toBe(400);
  });

  it("rejects unknown or malformed product ids", async () => {
    const { auth } = await signupMember();
    for (const productId of ["64b7f0c2a1b2c3d4e5f60718", "not-an-id"]) {
      const res = await createOrder(auth, [{ productId, itemQuantity: 1, itemPrice: 1 }]);
      expect(res.status).toBe(400);
    }
  });

  it("stores no order when the input is rejected", async () => {
    const { auth } = await signupMember();
    await createOrder(auth, [{ productId: "not-an-id", itemQuantity: 1, itemPrice: 1 }]);
    const res = await myOrders(auth, OrderStatus.PAUSE);
    expect(res.body).toHaveLength(0);
  });
});

describe("order status changes", () => {
  const newOrder = async () => {
    const owner = await signupMember();
    const order = await createOrder(owner.auth, orderBody(await createProduct()));
    return { ...owner, order: order.body, orderId: order.body._id as string };
  };

  it("follow PAUSE -> (payment) PROCESS -> FINISH -> DELETE", async () => {
    const { auth, order, orderId } = await newOrder();
    expect((await payOrder(auth, order)).status).toBe(200);
    for (const status of [OrderStatus.FINISH, OrderStatus.DELETE]) {
      const res = await updateOrder(auth, orderId, status);
      expect(res.status).toBe(201);
      expect(res.body.orderStatus).toBe(status);
    }
  });

  it("allow cancelling an unpaid order", async () => {
    const { auth, orderId } = await newOrder();
    const res = await updateOrder(auth, orderId, OrderStatus.DELETE);
    expect(res.status).toBe(201);
  });

  it("cannot skip payment", async () => {
    const { auth, orderId } = await newOrder();
    const res = await updateOrder(auth, orderId, OrderStatus.FINISH);
    expect(res.status).toBe(400);
  });

  it("cannot be marked as paid without a confirmed payment", async () => {
    const { auth, orderId } = await newOrder();
    const res = await updateOrder(auth, orderId, OrderStatus.PROCESS);
    expect(res.status).toBe(400);
  });

  it("cannot be paid again to collect more points", async () => {
    const { auth, member, order, orderId } = await newOrder();
    await payOrder(auth, order);

    const back = await updateOrder(auth, orderId, OrderStatus.PAUSE);
    const again = await updateOrder(auth, orderId, OrderStatus.PROCESS);

    expect(back.status).toBe(400);
    expect(again.status).toBe(400);
    const stored = await MemberModel.findById(member._id);
    expect(stored?.memberPoints).toBe(1);
  });

  it("rejects an unknown status", async () => {
    const { auth, orderId } = await newOrder();
    const res = await updateOrder(auth, orderId, "SHIPPED" as OrderStatus);
    expect(res.status).toBe(400);
  });

  it("returns 404 for a malformed order id", async () => {
    const { auth } = await signupMember();
    const res = await updateOrder(auth, "not-an-id", OrderStatus.PROCESS);
    expect(res.status).toBe(404);
  });
});

describe("GET /order/all paging", () => {
  it("uses default paging when page and limit are missing", async () => {
    const { auth } = await signupMember();
    await createOrder(auth, orderBody(await createProduct()));
    const res = await api().get("/order/all").set(auth).query({ orderStatus: OrderStatus.PAUSE });
    expect(res.body).toHaveLength(1);
  });
});
