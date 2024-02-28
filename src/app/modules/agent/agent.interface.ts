import { Model } from "mongoose";

export type IAgent = {
  _id?: string;
  name: string;
  pin: string;
  phone: string;
  email: string;
  accountType: "agent";
  nid: string;
  balance: number;
  isApproved: boolean;
};
export type IAgentModel = Model<IAgent, Record<string, unknown>>;

export enum ENUM_ROLE {
  ADMIN = "admin",
  USER = "user",
  AGENT = "agent",
}
