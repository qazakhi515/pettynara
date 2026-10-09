import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
const orderSchema = new Schema(
  {
    orderTotal: {
      type: Number,
      required: true,
    },
    orderDelivery: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: OrderStatus,
      default: OrderStatus.PAUSE,
    },
    memberId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Member",
    },
    // Set when Toss Payments confirms the payment (PAUSE -> PROCESS).
    paymentKey: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Order", orderSchema);
