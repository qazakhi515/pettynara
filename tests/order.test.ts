import { OrderStatus } from "../src/libs/enums/order.enum";
import MemberModel from "../src/schema/Member.model";
import { api, createProduct, signupMember } from "./helpers";

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

    const res = await updateOrder(auth, order.body._id, OrderStatus.PROCESS);

    expect(res.status).toBe(201);
    expect(res.body.orderStatus).toBe(OrderStatus.PROCESS);
    const stored = await MemberModel.findById(member._id);
    expect(stored?.memberPoints).toBe(1);
  });
});
