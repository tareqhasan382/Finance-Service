/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import bcrypt from "bcrypt";
import config from "../../../config";
import AgentModel from "./agent.model";
import UserModel from "../user/user.model";
import TransactionModel from "../transaction/transaction.model";
const createAgent = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  console.log("body data:", data);
  try {
    const isEmailExist = await AgentModel.findOne({ email: data.email });
    const isPhoneExist = await AgentModel.findOne({ phone: data.phone });
    const isNidExist = await AgentModel.findOne({ nid: data.nid });
    if (isNidExist) {
      return res.json({
        status: "false",
        message: "NID Already Exist. NID must be unique",
        data: isNidExist.nid,
      });
    }
    if (isEmailExist || isPhoneExist) {
      console.log("User:", isEmailExist);
      console.log("User:", isPhoneExist);
      return res.json({
        status: "false",
        message: "User Already Exist.",
        data: isEmailExist?.email || isPhoneExist?.phone,
      });
    }
    const result = await AgentModel.create(data);
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
      user = await AgentModel.findOne({ email: data.email }).select(
        "password accountType pin email isApproved"
      );
    } else if (data.phone) {
      user = await AgentModel.findOne({ phone: data.phone }).select(
        "password accountType pin email isApproved"
      );
    }

    if (!user) {
      return res.json({ status: "false", message: "User not found" });
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
        isApproved: user.isApproved,
      },
      config.jwt.secret as Secret,
      { expiresIn: config.jwt.expires_in }
    );

    return res.status(200).json({
      status: "true",
      message: "User logged in successfully",
      token: accessToken,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ success: false, message: "Something went wrong" });
  }
});
const agentProfile = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;
    const result = await AgentModel.findById({ _id: userId });
    console.log("result:", result);
    return res.json({ data: result });
  }
});
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const { amount, pin, recipientPhone } = req.body;
  if (!amount || !pin || !recipientPhone) {
    return res
      .status(404)
      .json({ message: "Amount & Pin & phoneNumber must be required" });
  }
  try {
    if (req.user) {
      const agentId = req.user.userId;

      // Validate the input data
      if (!parseInt(amount) || parseInt(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Fetch user and agent from the database
      const user = await UserModel.findOne({ phone: recipientPhone });
      console.log("user Info:", user);
      const agent = await AgentModel.findById(agentId).select("pin balance");
      console.log("agent Info:", agent);
      if (agent && agent.balance < parseFloat(amount)) {
        return res.status(400).json({ message: "Insaficient amount" });
      }
      // Check if user and agent exist
      if (!user || !agent) {
        return res.status(404).json({ message: "User or agent Invalid" });
      }

      // Verify the agent's PIN
      const isPinValid = await bcrypt.compare(pin, agent.pin);
      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid PIN" });
      }

      // Update the user's account balance
      const newUserBalance = user.balance + parseInt(amount);
      console.log("user New balance:", newUserBalance);
      await UserModel.findByIdAndUpdate(user._id, { balance: newUserBalance });

      // Update the agent's balance
      const newAgentBalance = agent.balance - parseInt(amount);
      console.log("Agent New balance:", newAgentBalance);
      await AgentModel.findByIdAndUpdate(agentId, { balance: newAgentBalance });

      // Update the total money in the system (assuming it's stored somewhere)
      // const totalMoney = calculateTotalMoney(); // You need to implement this function

      // Save the transaction details (assuming you have a TransactionModel)
      const transaction = new TransactionModel({
        sender: agentId,
        recipient: user._id,
        transactionType: "Cash-In",
        amount: amount,
      });
      await transaction.save();

      res.status(200).json({ message: "Cash-in successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
const agentTransaction = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;
    //const result = await TransactionModel.find({});
    const result = await TransactionModel.find({ sender: userId });
    const cashIn = await TransactionModel.find({ recipient: userId });
    return res.json({ status: "true", data: result, cashIn: cashIn });

    return res.json({ status: "true", data: result, cashIn: cashIn });
  }
});
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const { amount, pin, recipientPhone } = req.body;
  if (!amount || !pin || !recipientPhone) {
    return res
      .status(404)
      .json({ message: "Amount & Pin & phoneNumber must be required" });
  }
  try {
    if (req.user) {
      const agentId = req.user.userId;

      // Validate the input data
      if (!parseInt(amount) || parseInt(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Fetch user and agent from the database
      const user = await UserModel.findOne({ phone: recipientPhone });
      console.log("user Info:", user);
      const agent = await AgentModel.findById(agentId).select("pin balance");
      console.log("agent Info:", agent);
      if (agent && agent.balance < parseFloat(amount)) {
        return res.status(400).json({ message: "Insaficient amount" });
      }
      // Check if user and agent exist
      if (!user || !agent) {
        return res.status(404).json({ message: "User or agent Invalid" });
      }

      // Verify the agent's PIN
      const isPinValid = await bcrypt.compare(pin, agent.pin);
      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid PIN" });
      }

      // Update the user's account balance
      const newUserBalance = user.balance + parseInt(amount);
      console.log("user New balance:", newUserBalance);
      await UserModel.findByIdAndUpdate(user._id, { balance: newUserBalance });

      // Update the agent's balance
      const newAgentBalance = agent.balance - parseInt(amount);
      console.log("Agent New balance:", newAgentBalance);
      await AgentModel.findByIdAndUpdate(agentId, { balance: newAgentBalance });

      // Update the total money in the system (assuming it's stored somewhere)
      // const totalMoney = calculateTotalMoney(); // You need to implement this function

      // Save the transaction details (assuming you have a TransactionModel)
      const transaction = new TransactionModel({
        sender: agentId,
        recipient: user._id,
        transactionType: "Cash-In",
        amount: amount,
      });
      await transaction.save();

      res.status(200).json({ message: "Cash-in successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export const AgentController = {
  createAgent,
  login,
  agentProfile,
  cashIn,
  cashOut,
  agentTransaction,
};
