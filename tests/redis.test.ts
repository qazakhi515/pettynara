import request from "supertest";
import * as bcrypt from "bcryptjs";
import app from "../src/app";
import { getRedis } from "../src/libs/redis";
import { MemberType } from "../src/libs/enums/member.enum";
import MemberModel from "../src/schema/Member.model";
import ProductModel from "../src/schema/Product.model";
import { api, createProduct, signupMember } from "./helpers";

const withRedis = process.env.REDIS_URL ? describe : describe.skip;
const withoutRedis = process.env.REDIS_URL ? describe.skip : describe;

const listNames = async () => {
  const res = await api().get("/product/all");
  return res.body.map((p: any) => p.productName);
};

/** Creates the admin and returns an agent that carries its session cookie. */
const adminAgent = async () => {
  await MemberModel.create({
    memberNick: "admin",
    memberPhone: "01000000000",
    memberPassword: await bcrypt.hash("admin-password", 4),
    memberType: MemberType.ADMIN,
  });
  const agent = request.agent(app);
  const res = await agent
    .post("/admin/login")
    .type("form")
    .send({ memberNick: "admin", memberPassword: "admin-password" });
  expect(res.status).toBe(302);
  return agent;
};

describe("admin session", () => {
  it("keeps the admin logged in across requests", async () => {
    await createProduct({ productName: "Bichon" });
    const agent = await adminAgent();

    const res = await agent.get("/admin/product/all");
    expect(res.text).toMatch(/Bichon/);
    expect(res.text).not.toMatch(/Please login first/);
  });
});

withRedis("with Redis", () => {
  it("stores the admin session in Redis", async () => {
    await adminAgent();
    const keys = await getRedis()!.keys("sess:*");
    expect(keys).toHaveLength(1);
  });

  it("serves product lists from the cache", async () => {
    const product = await createProduct({ productName: "Old name" });
    expect(await listNames()).toEqual(["Old name"]);

    // Changed behind the API's back: the cached page is still served.
    await ProductModel.updateOne({ _id: product._id }, { productName: "New name" });
    expect(await listNames()).toEqual(["Old name"]);
  });

  it("refreshes product lists when the admin edits a product", async () => {
    const product = await createProduct({ productName: "On sale" });
    expect(await listNames()).toEqual(["On sale"]);

    const agent = await adminAgent();
    await agent.post(`/admin/product/${product._id}`).send({ productStatus: "PAUSE" });

    expect(await listNames()).toEqual([]);
  });

  it("gives cached entries a TTL", async () => {
    await createProduct();
    await listNames();
    const [key] = await getRedis()!.keys("cache:products:*:*");
    const ttl = await getRedis()!.ttl(key);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(60);
  });

  it("caches the top users list", async () => {
    const { member } = await signupMember();
    await MemberModel.updateOne({ _id: member._id }, { memberPoints: 5 });
    await api().get("/member/top-users");

    await MemberModel.updateOne({ _id: member._id }, { memberPoints: 9 });
    const res = await api().get("/member/top-users");
    expect(res.body[0].memberPoints).toBe(5);
  });

  it("keeps rate-limit counters in Redis", async () => {
    await api().post("/member/login").send({ memberNick: "x", memberPassword: "y" });
    const keys = await getRedis()!.keys("rl:*");
    expect(keys.length).toBeGreaterThan(0);
  });
});

withoutRedis("without Redis", () => {
  it("always reads product lists from the database", async () => {
    const product = await createProduct({ productName: "Old name" });
    await listNames();
    await ProductModel.updateOne({ _id: product._id }, { productName: "New name" });
    expect(await listNames()).toEqual(["New name"]);
  });
});
