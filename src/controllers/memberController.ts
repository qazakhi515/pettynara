import { NextFunction, Request, Response } from "express";
import { T } from "../libs/types/common";
import MemberService from "../models/Member.service";
import {
  ExtendedRequest,
  LoginInput,
  Member,
  MemberInput,
  MemberUpdateInput,
} from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AUTH_TIMER, isValidPhone } from "../libs/config";
import AuthService from "../models/Auth.service";
import LikeService from "../models/Like.service";

//React loyiha uchun
const memberService = new MemberService();
const authService = new AuthService();
const likeService = new LikeService();

const memberController: T = {};
memberController.getRestaurant = async (req: Request, res: Response) => {
  try {
    console.log("getRestaurant");
    const result1 = await memberService.getRestaurant();

    res.status(HttpCode.OK).json(result1);
  } catch (err) {
    console.log("Error, logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.signup = async (req: Request, res: Response) => {
  try {
    console.log("signup");
    const input: MemberInput = req.body;
    // Validated here as well as in the form: the browser check is a courtesy,
    // it does not stop anyone posting straight to the API.
    if (!isValidPhone(input.memberPhone))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PHONE);

    const result: Member = await memberService.signup(input);
    const token = await authService.createToken(result);
    res.cookie("accessToken", token, {
      maxAge: +AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.CREATED).json({ member: result, accessToken: token });
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    console.log("login");
    const input: LoginInput = req.body,
      result = await memberService.login(input),
      token = await authService.createToken(result);
    console.log("token>>", token);

    res.cookie("accessToken", token, {
      maxAge: +AUTH_TIMER * 3600 * 1000,
      httpOnly: false,
    });

    res.status(HttpCode.OK).json({ member: result, accessToken: token }); /// 1.1 dan kelgan natujani front end ga jonatib yuboryopmiz.
  } catch (err) {
    console.log("Error, signup:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.logout = (req: ExtendedRequest, res: Response) => {
  try {
    console.log("logout");
    // `res.cookie(..., null)` cookie'ga literal "null" satrini yozib qo'yardi
    res.clearCookie("accessToken", { httpOnly: false });
    res.status(HttpCode.OK).json({ logout: true });
  } catch (err) {
    console.log("Error, logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.getMemberDetail = async (
  req: ExtendedRequest,
  res: Response,
) => {
  try {
    console.log("getMemberDetail");
    const result = await memberService.getMemberDetail(req.member);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, logout", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.updateMember = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("updateMember");
    const input: MemberUpdateInput = req.body;
    if (input.memberPhone !== undefined && !isValidPhone(input.memberPhone))
      throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_PHONE);
    if (req.file) input.memberImage = req.file.path.replace(/\\/, "/");
    const result = await memberService.updateMember(req.member, input);
    // Wrapped as { member } to match login/signup. The client reads
    // `data.member` for all three; returning the bare document here made it
    // read undefined, which then poisoned localStorage and blanked the app.
    res.status(HttpCode.OK).json({ member: result });
  } catch (err) {
    console.log("Error, updateMember", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

/** Products the signed-in member has liked. Behind verifyAuth. */
memberController.getMyLikes = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("getMyLikes");
    const result = await likeService.getMemberLikes(req.member._id);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getMyLikes:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

/** Adopt the likes a visitor collected before signing in. Behind verifyAuth. */
memberController.syncMyLikes = async (req: ExtendedRequest, res: Response) => {
  try {
    console.log("syncMyLikes");
    const ids: unknown = req.body?.productIds;
    if (!Array.isArray(ids))
      throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);

    // Cap the batch: this endpoint takes client-supplied ids, and an unbounded
    // array would let one request drive an arbitrary number of writes.
    const productIds = ids.filter((x) => typeof x === "string").slice(0, 100);
    const result = await likeService.syncLikes(req.member._id, productIds);
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, syncMyLikes:", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.getTopUsers = async (req: Request, res: Response) => {
  try {
    console.log("getTopUsers");
    const result = await memberService.getTopUsers();
    res.status(HttpCode.OK).json(result);
  } catch (err) {
    console.log("Error, getTopUsers", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standart.code).json(Errors.standart);
  }
};

/** Extract the access token from the cookie or the Authorization header */
const extractToken = (req: ExtendedRequest): string | null => {
  const cookieToken = req.cookies?.["accessToken"];
  // Eski logout `null` qiymatini yozib ketgan bo'lishi mumkin — bunday "axlat"
  // cookie truthy string bo'lgani uchun Bearer fallbackni to'sib qo'yardi
  if (
    cookieToken &&
    !["null", "undefined", ""].includes(String(cookieToken).trim())
  )
    return String(cookieToken).trim();

  const authHeader = req.headers?.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  return null;
};

memberController.verifyAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);
    if (token) req.member = await authService.checkAuth(token);
    if (!req.member)
      throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHENTICATED);

    next();
  } catch (err) {
    console.log("Error, verifyAuth:", err);
    if (err instanceof Errors) {
      // Yaroqsiz/muddati o'tgan tokenni tozalaymiz, aks holda brauzer uni qayta-qayta yuboraveradi
      if (err.code === HttpCode.UNAUTHORIZED)
        res.clearCookie("accessToken", { httpOnly: false });
      res.status(err.code).json(err);
    } else res.status(Errors.standart.code).json(Errors.standart);
  }
};

memberController.retrieveAuth = async (
  req: ExtendedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = extractToken(req);
    if (token) req.member = await authService.checkAuth(token);
    next();
  } catch (err) {
    console.log("Error, retrieveAuth", err);
    next();
  }
};
export default memberController;
