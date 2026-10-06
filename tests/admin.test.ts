import ProductModel from "../src/schema/Product.model";
import { api } from "./helpers";

describe("admin panel", () => {
  it("does not list products without an admin session", async () => {
    const res = await api().get("/admin/product/all");
    expect(res.text).toMatch(/Please login first/);
    expect(res.text).not.toMatch(/<table/);
  });

  it("does not create products without an admin session", async () => {
    await api().post("/admin/product/create").type("form").send({
      productName: "Sneaky",
      productCollection: "DOG",
      productPrice: 1,
      productDesc: "x",
    });
    expect(await ProductModel.countDocuments()).toBe(0);
  });
});
