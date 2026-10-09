import { OrderStatus } from "../src/libs/enums/order.enum";
import MemberModel from "../src/schema/Member.model";
import OrderModel from "../src/schema/Order.model";
import { api, createProduct, mockToss, signupMember, tossOrderId } from "./helpers";

const newOrder = async (price = 120000) => {
  const owner = await signupMember();
  const product = await createProduct({ productPrice: price });
  const res = await api()
    .post("/order/create")
    .set(owner.auth)
    .send([{ productId: String(product._id), itemQuantity: 1, itemPrice: price }]);
  return { ...owner, order: res.body as { _id: string; orderTotal: number } };
};

const confirm = (auth: Record<string, string>, body: Record<string, unknown>) =>
  api().post("/order/confirm-payment").set(auth).send(body);

const validBody = (order: { _id: string; orderTotal: number }) => ({
  paymentKey: `pk_${order._id}`,
  orderId: tossOrderId(order._id),
  amount: order.orderTotal,
});

const statusOf = async (orderId: string) =>
  (await OrderModel.findById(orderId))?.orderStatus;

describe("POST /order/confirm-payment", () => {
  it("requires a logged-in member", async () => {
    const res = await api().post("/order/confirm-payment").send({});
    expect(res.status).toBe(401);
  });

  it("confirms with Toss, marks the order paid and gives a point", async () => {
    const { auth, member, order } = await newOrder();
    const toss = mockToss();

    const res = await confirm(auth, validBody(order));

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      orderStatus: OrderStatus.PROCESS,
      paymentKey: `pk_${order._id}`,
      paymentMethod: "카드",
    });
    expect(res.body.paidAt).toBeTruthy();
    expect((await MemberModel.findById(member._id))?.memberPoints).toBe(1);

    expect(toss).toHaveBeenCalledTimes(1);
    const [url, init] = toss.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(url).toBe("https://api.tosspayments.com/v1/payments/confirm");
    expect(headers.Authorization).toBe(
      "Basic " + Buffer.from("test_gsk_jest:").toString("base64"),
    );
    expect(headers["Idempotency-Key"]).toBe(`pk_${order._id}`);
    expect(JSON.parse(String(init?.body))).toEqual(validBody(order));
  });

  it("rejects an amount that differs from the order total without calling Toss", async () => {
    const { auth, order } = await newOrder();
    const toss = mockToss();

    const res = await confirm(auth, { ...validBody(order), amount: 1000 });

    expect(res.status).toBe(400);
    expect(toss).not.toHaveBeenCalled();
    expect(await statusOf(order._id)).toBe(OrderStatus.PAUSE);
  });

  it("does not let a member pay for someone else's order", async () => {
    const { order } = await newOrder();
    const other = await signupMember();
    const toss = mockToss();

    const res = await confirm(other.auth, validBody(order));

    expect(res.status).toBe(404);
    expect(toss).not.toHaveBeenCalled();
  });

  it.each([
    ["a malformed orderId", { orderId: "not-our-format" }],
    ["a missing paymentKey", { paymentKey: undefined }],
    ["a non-integer amount", { amount: "120000" }],
  ])("rejects %s with 400", async (_label, change) => {
    const { auth, order } = await newOrder();
    const toss = mockToss();

    const res = await confirm(auth, { ...validBody(order), ...change });

    expect(res.status).toBe(400);
    expect(toss).not.toHaveBeenCalled();
  });

  it("answers a reloaded success page without confirming twice", async () => {
    const { auth, member, order } = await newOrder();
    const toss = mockToss();

    await confirm(auth, validBody(order));
    const again = await confirm(auth, validBody(order));

    expect(again.status).toBe(200);
    expect(again.body.orderStatus).toBe(OrderStatus.PROCESS);
    expect(toss).toHaveBeenCalledTimes(1);
    expect((await MemberModel.findById(member._id))?.memberPoints).toBe(1);
  });

  it("refuses a cancelled order", async () => {
    const { auth, order } = await newOrder();
    await api()
      .post("/order/update")
      .set(auth)
      .send({ orderId: order._id, orderStatus: OrderStatus.DELETE });
    const toss = mockToss();

    const res = await confirm(auth, validBody(order));

    expect(res.status).toBe(400);
    expect(toss).not.toHaveBeenCalled();
  });

  it("keeps the order unpaid when Toss rejects the card, and a retry can pay it", async () => {
    const { auth, order } = await newOrder();
    mockToss({
      status: 400,
      body: { code: "REJECT_CARD_PAYMENT", message: "한도초과 혹은 잔액부족" },
    });

    const failed = await confirm(auth, validBody(order));
    expect(failed.status).toBe(400);
    expect(await statusOf(order._id)).toBe(OrderStatus.PAUSE);

    mockToss();
    const retry = await confirm(auth, {
      ...validBody(order),
      paymentKey: "pk_second_try",
      orderId: tossOrderId(order._id, "z9y8x7"),
    });
    expect(retry.status).toBe(200);
    expect(retry.body.orderStatus).toBe(OrderStatus.PROCESS);
  });

  it("answers 502 when Toss has a server error or cannot be reached", async () => {
    const { auth, order } = await newOrder();

    mockToss({ status: 500, body: { code: "PROVIDER_ERROR", message: "error" } });
    expect((await confirm(auth, validBody(order))).status).toBe(502);

    jest.restoreAllMocks();
    jest.spyOn(global, "fetch").mockRejectedValue(new TypeError("fetch failed"));
    expect((await confirm(auth, validBody(order))).status).toBe(502);

    expect(await statusOf(order._id)).toBe(OrderStatus.PAUSE);
  });

  it("looks the payment up when Toss says it was already processed", async () => {
    const { auth, order } = await newOrder();
    const toss = mockToss(
      { status: 400, body: { code: "ALREADY_PROCESSED_PAYMENT", message: "이미 처리된 결제" } },
      {
        body: {
          paymentKey: `pk_${order._id}`,
          orderId: tossOrderId(order._id),
          totalAmount: order.orderTotal,
          status: "DONE",
          method: "간편결제",
        },
      },
    );

    const res = await confirm(auth, validBody(order));

    expect(res.status).toBe(200);
    expect(res.body.paymentMethod).toBe("간편결제");
    expect(toss.mock.calls[1][0]).toBe(
      `https://api.tosspayments.com/v1/payments/pk_${order._id}`,
    );
  });

  it("does not mark the order paid if Toss reports a different amount", async () => {
    const { auth, order } = await newOrder();
    mockToss({
      body: {
        paymentKey: `pk_${order._id}`,
        orderId: tossOrderId(order._id),
        totalAmount: 1,
        status: "DONE",
      },
    });

    const res = await confirm(auth, validBody(order));

    expect(res.status).toBe(400);
    expect(await statusOf(order._id)).toBe(OrderStatus.PAUSE);
  });

  it("answers 503 when payments are not configured", async () => {
    const { auth, order } = await newOrder();
    const key = process.env.TOSS_SECRET_KEY;
    delete process.env.TOSS_SECRET_KEY;
    try {
      const res = await confirm(auth, validBody(order));
      expect(res.status).toBe(503);
    } finally {
      process.env.TOSS_SECRET_KEY = key;
    }
  });
});
