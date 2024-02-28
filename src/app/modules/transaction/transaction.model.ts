import { Schema, model } from "mongoose";
import { ITransaction, ITransactionModel } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
  {
    sender: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    recipient: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    amount: { type: Number, required: true },
    transactionFee: { type: Number, default: 0 },
    transactionType: {
      type: String,
      enum: ["Cash-Out", "Cash-In", "Send-Money"],
      required: true,
    },
  },
  { timestamps: true }
);
const TransactionModel = model<ITransaction, ITransactionModel>(
  "Transactions",
  transactionSchema
);

export default TransactionModel;

/*
sender: ObjectId;
  recipient: ObjectId;
  amount: number;
  transactionFee: number;
*/
