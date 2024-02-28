import { Model } from "mongoose";

export type IAdmin = {
  _id?: string;
  name: string;
  pin: string;
  phone: string;
  email: string;
  accountType: "admin";
  nid: string;
  balance: number;
};
export type IAdminModel = Model<IAdmin, Record<string, unknown>>;

export enum ENUM_ROLE {
  ADMIN = "admin",
}
