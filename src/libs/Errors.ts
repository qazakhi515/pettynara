export enum HttpCode {
  OK = 200,
  CREATED = 201,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export enum Message {
  SOMETHING_WENT_WRONG = "Something went wrong",
  NO_DATA_FOUNG = "No data is found",
  BLOCKED_USER = "You have been blocked and contact with admin",
  CREATE_FAILED = "Create is failed",
  UPDATE_FAILED = "Update is failed",

  NO_MEMBER_NICK = "No member with that member nick",
  USED_NICK_PHONE = "You are inserting already used nick or phone",
  WRONG_PASSWORD = "Wrong password, please try again",
  INVALID_PHONE = "Phone number must contain 9 to 15 digits",
  INVALID_ORDER_ITEMS = "Order items are invalid or no longer on sale",
  INVALID_STATUS_CHANGE = "This order cannot be moved to that status",
  INVALID_IMAGE = "Only image files up to 5 MB can be uploaded",
  TOO_MANY_REQUESTS = "Too many attempts, please try again later",
  INVALID_PAYMENT = "Payment details are invalid",
  PAYMENT_AMOUNT_MISMATCH = "The paid amount does not match the order total",
  PAYMENT_FAILED = "The payment could not be completed",
  PAYMENT_PROVIDER_DOWN = "The payment service is not responding, please try again",
  PAYMENTS_DISABLED = "Online payment is not available right now",
  NOT_AUTHENTICATED = "You are not authenticated, Please login first",
  TOKEN_CREATION_FAILED = "Token creation error!",
  TOKEN_EXPIRED = "Your session has expired, please login again",
}

class Errors extends Error {
  public code: HttpCode;
  public message: Message;

  static standart = {
    code: HttpCode.INTERNAL_SERVER_ERROR,
    message: Message.SOMETHING_WENT_WRONG,
  };

  constructor(statusCode: HttpCode, statusMessage: Message) {
    super();
    this.code = statusCode;
    this.message = statusMessage;
  }
}
export default Errors;
