import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import ProductService from "../models/Product.service";
import LikeService from "../models/Like.service";
import { AdminRequest, ExtendedRequest } from "../libs/types/member";
import { ProductInput, ProductInquiry } from "../libs/types/product";
import { ProductCollection } from "../libs/enums/product.enum";

const productService = new ProductService();
const likeService = new LikeService();
const productController: T = {};

/** ssr */
productController.getProducts = async (req: Request, res: Response) => {
  try {
    console.log("getProducts");
    const { page, limit, order, productCollection, search } = req.query;
    const inquiry: ProductInquiry = {
      order: String(order),
      page: Number(page),
      limit: Number(limit),
    };
    if (productCollection) {
      inquiry.productCollection = productCollection as ProductCollection;
    }
    if (search) inquiry.search = String(search);
    const result = await productService.getProducts(inquiry);

    res.set("Cache-Control", "no-store");
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.getProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getProduct");
    const { id } = req.params;
    console.log("req:", req.member);
    const memberId = req.member?._id ?? null;
    const result = await productService.getProduct(memberId, id as string);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

/** Toggle the current member's like on a product. Mounted behind verifyAuth,
 *  so req.member is always present here. */
productController.likeProduct = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("likeProduct");
    const { id } = req.params;
    const result = await likeService.toggleLike(req.member._id, id as string);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, likeProduct:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.getAllProducts = async (req: AdminRequest, res: Response) => {
  try {
    console.log("getAllProducts");
    const limit = 8;
    const page = Math.max(1, Number(req.query.page) || 1);
    const { list, total, activeCount, pausedCount, imageCount } =
      await productService.getAllProducts(page, limit);
    const totalPages = Math.max(1, Math.ceil(total / limit));

    res.render("products", {
      products: list,
      page,
      limit,
      total,
      totalPages,
      activeCount,
      pausedCount,
      imageCount,
    });
  } catch (err) {
    console.log("Error, getAllProducts:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

productController.createNewProduct = async (
  req: AdminRequest,
  res: Response,
) => {
  try {
    console.log("createNewProduct");
    console.log("req.body", req.body);
    if (!req.files?.length)
      throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);

    const data: ProductInput = req.body;
    data.productImages = req.files?.map((ele) => {
      return ele.path;
    });

    await productService.createNewProduct(data);

    res.send(
      `<script> alert ("successfully created"); window.location.replace('/admin/product/all') </script>`,
    );
  } catch (err) {
    console.log("Error, createNewProduct:", err);
    const message =
      err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
    res.send(
      `<script> alert ("${message}"); window.location.replace('/admin/product/all') </script>`,
    );
  }
};

productController.updateChosenProduct = async (req: Request, res: Response) => {
  try {
    console.log("updateChosenProduct");
    const id = req.params.id; //@ts-ignoreç

    const result = await productService.updateChosenProduct(id, req.body);

    res.status(HttpCode.OK).json({ data: result });
  } catch (err) {
    console.log("Error, updateChosenProduct", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

export default productController;
