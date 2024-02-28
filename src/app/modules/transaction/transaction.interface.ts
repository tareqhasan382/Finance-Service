import { Model, ObjectId } from "mongoose";

export type ITransaction = {
  _id?: string;
  sender: ObjectId;
  recipient: ObjectId;
  amount: number;
  transactionFee: number;
  transactionType: "Cash-Out" | "Cash-In" | "Send-Money";
};
export type ITransactionModel = Model<ITransaction, Record<string, unknown>>;
// 'buyer' | 'seller'
