/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../../../config";
import AdmintModel from "./admin.model";
import AgentModel from "../agent/agent.model";
const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  console.log("body data:", data);
  try {
    const isEmailExist = await AdmintModel.findOne({ email: data.email });
    const isPhoneExist = await AdmintModel.findOne({ phone: data.phone });

    if (isEmailExist || isPhoneExist) {
      console.log("User:", isEmailExist);
      console.log("User:", isPhoneExist);
      return res.json({
        status: "false",
        message: "User Already Exist.",
        data: isEmailExist?.email || isPhoneExist?.phone,
      });
    }
    const result = await AdmintModel.create(data);
    return res.json({
      status: "true",
      message: "User Created Successfully.",
      data: result,
    });
  } catch (error) {
    return res.json({ status: "false", message: "Failed to create user." });
  }
});
///admin/login
const login = catchAsync(async (req: Request, res: Response) => {
  try {
    const data = req.body;
    console.log("body data:", data);
    if ((!data.email && !data.phone) || !data.pin) {
      return res.json({
        status: "false",
        message: "Email/phone and pin are required",
      });
    }

    let user;
    if (data.email) {
      user = await AdmintModel.findOne({ email: data.email }).select(
        "password accountType pin email"
      );
    } else if (data.phone) {
      user = await AdmintModel.findOne({ phone: data.phone }).select(
        "password accountType pin email"
      );
    }

    if (!user) {
      return res.json({ status: "false", message: "Admin not found" });
    }

    // check match pin
    const isMatchPin = await bcrypt.compare(data.pin, user.pin);

    if (!isMatchPin) {
      return res.json({ status: "false", message: "Pin is incorrect" });
    }
    console.log("find user:", user);
    // create jwt token
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.accountType,
        email: user.email,
      },
      config.jwt.secret as Secret,
      { expiresIn: config.jwt.expires_in }
    );

    return res.status(200).json({
      status: "true",
      message: "Admin logged in successfully",
      token: accessToken,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
});
const adminProfile = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { email } = req.user;
    const result = await AdmintModel.findOne({ email: email });
    return res.json({ data: result });
  }
});
const allAgent = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const userId = req.user;
    const result = await AgentModel.find({});
    console.log("result:", result);
    return res.json({ data: result });
  }
});
const approveAgent = catchAsync(async (req: Request, res: Response) => {
  const id = req.body;
  console.log("id:", id);
  // Find and update the agent document
  const result = await AgentModel.findOneAndUpdate(
    { _id: id?.userId }, // Filter criteria
    { $set: { isApproved: true } }, // Update to set isApproved to true
    { new: true } // Return the updated document
  );

  if (!result) {
    return res.status(404).json({ error: "Agent not found" });
  }

  console.log("Updated agent:", result);
  return res.json({ data: result });
});

export const AdminController = {
  createAdmin,
  login,
  adminProfile,
  approveAgent,
  allAgent,
};
