import { Model } from "mongoose";

export type IUser = {
  _id?: string;
  name: string;
  pin: string;
  phone: string;
  email: string;
  accountType: "user";
  nid: string;
  balance: number;
};
export type IUserModel = Model<IUser, Record<string, unknown>>;

export enum ENUM_ROLE {
  ADMIN = "admin",
  USER = "user",
  AGENT = "agent",
}
