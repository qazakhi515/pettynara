import request from "supertest";
import app from "../src/app";
import ProductModel from "../src/schema/Product.model";
import {
  ProductCollection,
  ProductStatus,
} from "../src/libs/enums/product.enum";

export const api = () => request(app);

let counter = 0;
const unique = () => `${Date.now()}${++counter}`;

export const memberInput = (overrides: Record<string, unknown> = {}) => {
  const id = unique();
  return {
    memberNick: `user${id}`,
    memberPhone: `010${id.slice(-8).padStart(8, "0")}`,
    memberPassword: "password123",
    ...overrides,
  };
};

/** Signs up a member through the API and returns it with its access token. */
export const signupMember = async (overrides: Record<string, unknown> = {}) => {
  const input = memberInput(overrides);
  const res = await api().post("/member/signup").send(input);
  if (res.status !== 201)
    throw new Error(`signup failed: ${res.status} ${JSON.stringify(res.body)}`);
  return {
    input,
    member: res.body.member,
    token: res.body.accessToken as string,
    auth: { Authorization: `Bearer ${res.body.accessToken}` },
  };
};

export const createProduct = async (overrides: Record<string, unknown> = {}) =>
  ProductModel.create({
    productName: `Product ${unique()}`,
    productCollection: ProductCollection.DOG,
    productPrice: 100000,
    productDesc: "A friendly puppy",
    productStatus: ProductStatus.PROCESS,
    ...overrides,
  });

/** All Set-Cookie headers of a response, joined into one string. */
export const cookiesOf = (res: request.Response): string =>
  ([] as string[]).concat(res.headers["set-cookie"] ?? []).join("; ");

type TossReply = { status?: number; body?: Record<string, unknown> };

/**
 * Stands in for the Toss Payments API. By default it approves whatever is
 * confirmed, echoing the request like Toss does; pass replies to script
 * errors. Returns the spy so tests can inspect the calls.
 */
export const mockToss = (...replies: TossReply[]) =>
  jest.spyOn(global, "fetch").mockImplementation(async (_url, init) => {
    const reply = replies.length > 1 ? replies.shift()! : replies[0];
    const sent = init?.body ? JSON.parse(String(init.body)) : {};
    const body = reply?.body ?? {
      paymentKey: sent.paymentKey,
      orderId: sent.orderId,
      totalAmount: sent.amount,
      status: "DONE",
      method: "카드",
      approvedAt: "2026-10-09T10:00:00+09:00",
    };
    return new Response(JSON.stringify(body), {
      status: reply?.status ?? 200,
      headers: { "Content-Type": "application/json" },
    });
  });

/** The orderId the web client sends to Toss for one of our orders. */
export const tossOrderId = (orderId: string, suffix = "a1b2c3") =>
  `${orderId}_${suffix}`;

/** Pays an order through /order/confirm-payment with Toss mocked. */
export const payOrder = async (
  auth: Record<string, string>,
  order: { _id: string; orderTotal: number },
) => {
  mockToss();
  return api()
    .post("/order/confirm-payment")
    .set(auth)
    .send({
      paymentKey: `pk_${order._id}`,
      orderId: tossOrderId(order._id),
      amount: order.orderTotal,
    });
};
