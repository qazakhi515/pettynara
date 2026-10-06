import { ProductCollection, ProductStatus } from "../src/libs/enums/product.enum";
import ProductModel from "../src/schema/Product.model";
import { api, createProduct, signupMember } from "./helpers";

const list = (query: Record<string, string | number>) =>
  api().get("/product/all").query({ page: 1, limit: 10, order: "createdAt", ...query });

describe("GET /product/all", () => {
  it("lists only products that are on sale (PROCESS)", async () => {
    await createProduct({ productName: "On sale" });
    await createProduct({ productName: "Paused", productStatus: ProductStatus.PAUSE });
    await createProduct({ productName: "Deleted", productStatus: ProductStatus.DELETE });

    const res = await list({});
    expect(res.status).toBe(200);
    expect(res.body.map((p: any) => p.productName)).toEqual(["On sale"]);
  });

  it("filters by category", async () => {
    await createProduct({ productName: "Dog", productCollection: ProductCollection.DOG });
    await createProduct({ productName: "Cat", productCollection: ProductCollection.CAT });

    const res = await list({ productCollection: ProductCollection.CAT });
    expect(res.body.map((p: any) => p.productName)).toEqual(["Cat"]);
  });

  it("searches by name, ignoring case", async () => {
    await createProduct({ productName: "Golden Retriever" });
    await createProduct({ productName: "Persian Cat" });

    const res = await list({ search: "golden" });
    expect(res.body.map((p: any) => p.productName)).toEqual(["Golden Retriever"]);
  });

  it("sorts by price from cheapest", async () => {
    await createProduct({ productName: "B", productPrice: 300 });
    await createProduct({ productName: "A", productPrice: 100 });
    await createProduct({ productName: "C", productPrice: 200 });

    const res = await list({ order: "productPrice" });
    expect(res.body.map((p: any) => p.productPrice)).toEqual([100, 200, 300]);
  });

  it("paginates", async () => {
    for (let i = 0; i < 5; i++) await createProduct();

    const page1 = await list({ page: 1, limit: 2 });
    const page3 = await list({ page: 3, limit: 2 });
    expect(page1.body).toHaveLength(2);
    expect(page3.body).toHaveLength(1);
  });
});

describe("GET /product/:id", () => {
  it("returns a product on sale", async () => {
    const product = await createProduct({ productName: "Bichon" });
    const res = await api().get(`/product/${product._id}`);
    expect(res.status).toBe(200);
    expect(res.body.productName).toBe("Bichon");
  });

  it("hides a paused product", async () => {
    const product = await createProduct({ productStatus: ProductStatus.PAUSE });
    const res = await api().get(`/product/${product._id}`);
    expect(res.status).toBe(404);
  });

  // Regression: the response used to show the count from before the increment.
  it("counts a view once per member and returns the updated count", async () => {
    const product = await createProduct();
    const { auth } = await signupMember();

    const first = await api().get(`/product/${product._id}`).set(auth);
    const second = await api().get(`/product/${product._id}`).set(auth);

    expect(first.body.productViews).toBe(1);
    expect(second.body.productViews).toBe(1);
  });

  it("does not count views from visitors who are not logged in", async () => {
    const product = await createProduct();
    await api().get(`/product/${product._id}`);

    const stored = await ProductModel.findById(product._id);
    expect(stored?.productViews).toBe(0);
  });
});

describe("query validation", () => {
  it.each(["(", "[a-", "*"])("treats %p in search as plain text", async (search) => {
    await createProduct({ productName: "Poodle" });
    const res = await list({ search });
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("matches regex characters literally", async () => {
    await createProduct({ productName: "a.c" });
    await createProduct({ productName: "abc" });
    const res = await list({ search: "a.c" });
    expect(res.body.map((p: any) => p.productName)).toEqual(["a.c"]);
  });

  it("answers a catastrophic-backtracking pattern quickly", async () => {
    await createProduct({ productName: "a".repeat(40) + "!" });
    const started = Date.now();
    const res = await list({ search: "(a+)+$" });
    expect(res.status).toBe(200);
    expect(Date.now() - started).toBeLessThan(1000);
  });

  it("uses default paging when page and limit are missing", async () => {
    await createProduct();
    const res = await api().get("/product/all");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it("caps the page size", async () => {
    const res = await list({ limit: 100000 });
    expect(res.status).toBe(200);
  });

  it("returns 404 for a malformed product id", async () => {
    const res = await api().get("/product/not-an-id");
    expect(res.status).toBe(404);
  });

  it("returns 404 when liking a malformed product id", async () => {
    const { auth } = await signupMember();
    const res = await api().post("/product/not-an-id/like").set(auth);
    expect(res.status).toBe(404);
  });
});
