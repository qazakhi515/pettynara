import { ProductStatus } from "../src/libs/enums/product.enum";
import ProductModel from "../src/schema/Product.model";
import { api, createProduct, signupMember } from "./helpers";

const toggle = (auth: Record<string, string>, productId: unknown) =>
  api().post(`/product/${productId}/like`).set(auth);

describe("likes", () => {
  it("require a logged-in member", async () => {
    const product = await createProduct();
    const res = await api().post(`/product/${product._id}/like`);
    expect(res.status).toBe(401);
  });

  it("toggle on and off and keep the counter in step", async () => {
    const { auth } = await signupMember();
    const product = await createProduct();

    const on = await toggle(auth, product._id);
    expect(on.status).toBe(200);
    expect(on.body).toEqual({ liked: true, likesCount: 1 });

    const off = await toggle(auth, product._id);
    expect(off.body).toEqual({ liked: false, likesCount: 0 });
  });

  it("count each member once", async () => {
    const alice = await signupMember();
    const bob = await signupMember();
    const product = await createProduct();

    await toggle(alice.auth, product._id);
    const res = await toggle(bob.auth, product._id);

    expect(res.body.likesCount).toBe(2);
  });

  it("return 404 for an unknown product", async () => {
    const { auth } = await signupMember();
    const res = await toggle(auth, "64b7f0c2a1b2c3d4e5f60718");
    expect(res.status).toBe(404);
  });

  it("list the member's liked products that are still on sale", async () => {
    const { auth } = await signupMember();
    const onSale = await createProduct({ productName: "On sale" });
    const paused = await createProduct({ productName: "Paused" });
    await toggle(auth, onSale._id);
    await toggle(auth, paused._id);
    await ProductModel.updateOne({ _id: paused._id }, { productStatus: ProductStatus.PAUSE });

    const res = await api().get("/member/likes").set(auth);

    expect(res.status).toBe(200);
    expect(res.body.map((p: any) => p.productName)).toEqual(["On sale"]);
  });
});

describe("POST /member/likes/sync", () => {
  it("adds likes made before login, skipping duplicates and bad ids", async () => {
    const { auth } = await signupMember();
    const a = await createProduct();
    const b = await createProduct();
    await toggle(auth, a._id);

    const res = await api()
      .post("/member/likes/sync")
      .set(auth)
      .send({ productIds: [String(a._id), String(b._id), String(b._id), "not-an-id"] });

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const [storedA, storedB] = await Promise.all([
      ProductModel.findById(a._id),
      ProductModel.findById(b._id),
    ]);
    expect(storedA?.productLikes).toBe(1);
    expect(storedB?.productLikes).toBe(1);
  });

  it("rejects a body without a productIds array", async () => {
    const { auth } = await signupMember();
    const res = await api().post("/member/likes/sync").set(auth).send({});
    expect(res.status).toBe(400);
  });
});
