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
