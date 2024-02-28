import { Schema, model } from "mongoose";
import { IUser, IUserModel } from "./user.interface";
import bcrypt from "bcrypt";
import config from "../../../config";
const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    pin: { type: String, required: true, select: false },
    phone: { type: String, required: true, unique: true },
    accountType: { type: String, default: "user" },
    nid: { type: String, unique: true, required: true },
    balance: { type: Number, default: 40 },
  },
  { timestamps: true }
);
// User.create() / User.save()
userSchema.pre("save", async function (next) {
  // hashing password
  this.pin = await bcrypt.hash(this.pin, Number(config.bycrypt_salt_rounds));
  next();
});

const UserModel = model<IUser, IUserModel>("Users", userSchema);

export default UserModel;
