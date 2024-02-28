import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../../config";
import { IAgent, IAgentModel } from "./agent.interface";
const agentSchema = new Schema<IAgent>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    pin: { type: String, required: true, select: false },
    phone: { type: String, required: true, unique: true },
    accountType: { type: String, default: "agent" },
    nid: { type: String, required: true },
    balance: { type: Number, default: 100000 },
    isApproved: { type: Boolean, default: false },
  },
  { timestamps: true }
);
// User.create() / User.save()
agentSchema.pre("save", async function (next) {
  // hashing password
  this.pin = await bcrypt.hash(this.pin, Number(config.bycrypt_salt_rounds));
  next();
});

const AgentModel = model<IAgent, IAgentModel>("Agents", agentSchema);

export default AgentModel;
