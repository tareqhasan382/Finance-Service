import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import config from "../../../config";
import { IAdmin, IAdminModel } from "./admin.interface";
const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    pin: { type: String, required: true, select: false },
    phone: { type: String, required: true, unique: true },
    accountType: { type: String, default: "admin" },
    nid: { type: String, required: true },
    balance: { type: Number, default: 100000 },
  },
  { timestamps: true }
);
// User.create() / User.save()
adminSchema.pre("save", async function (next) {
  // hashing password
  this.pin = await bcrypt.hash(this.pin, Number(config.bycrypt_salt_rounds));
  next();
});

const AdmintModel = model<IAdmin, IAdminModel>("Admin", adminSchema);

export default AdmintModel;
