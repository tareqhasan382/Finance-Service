/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import UserModel from "./user.model";
import bcrypt from "bcrypt";
import config from "../../../config";
import AdmintModel from "../admin/admin.model";
import TransactionModel from "../transaction/transaction.model";
import AgentModel from "../agent/agent.model";
import { ENUM_ROLE } from "../agent/agent.interface";
const createUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  console.log("body data:", data);
  try {
    const isEmailExist = await UserModel.findOne({ email: data.email });
    const isPhoneExist = await UserModel.findOne({ phone: data.phone });
    const isNidExist = await UserModel.findOne({ nid: data.nid });
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
    const result = await UserModel.create(data);
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
    console.log("login data:", data);
    if ((!data.email && !data.phone) || !data.pin) {
      return res.json({
        status: "false",
        message: "Email/phone and pin are required",
      });
    }

    let user;
    if (data.email) {
      user = await UserModel.findOne({ email: data.email }).select(
        "accountType pin email"
      );
    } else if (data.phone) {
      user = await UserModel.findOne({ phone: data.phone }).select(
        "accountType pin email"
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

const userProfile = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;

    const result = await UserModel.findById({ _id: userId });

    return res.json({ status: "true", data: result });
  }
});
const userTransaction = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;
    const result = await TransactionModel.find({ sender: userId });
    const cashIn = await TransactionModel.find({ recipient: userId });
    return res.json({ status: "true", data: result, cashIn: cashIn });
  }
});
const users = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;
    console.log("userId:", userId);
    const result = await UserModel.find({});
    console.log("all users:", result);
    return res.json({ status: "true", data: result });
  }
});
const Agents = catchAsync(async (req: Request, res: Response) => {
  if (req.user) {
    const { userId } = req.user;
    const result = await AgentModel.find({});
    return res.json({ status: "true", data: result });
  }
});
// send money
const sendMoney = catchAsync(async (req: Request, res: Response) => {
  try {
    // console.log("data:", req.body);
    // let user;
    if (req.user) {
      // user = await UserModel.findOne({ _id: req?.user?.userId });
      const { recipientPhone, amount, pin } = req.body;
      if (!recipientPhone || !amount || !pin) {
        return res.status(404).json({ message: "Invalid credentials" });
      }
      const senderUserId = req.user.userId;
      const admin = await AdmintModel.findOne();
      if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
      }
      const sender = await UserModel.findById(senderUserId).select(
        "pin balance"
      );
      if (!sender) {
        return res.status(400).json({ message: "Agent account not found" });
      }
      const matchPin = await bcrypt.compare(pin, sender.pin);
      if (!matchPin) {
        return res.status(400).json({ message: "Invalid PIN" });
      }
      if (sender.balance < parseFloat(amount)) {
        return res.status(400).json({
          message: "Insaficient balance",
        });
      }
      // Find the recipient's account
      const recipient = await UserModel.findOne({ phone: recipientPhone });
      //console.log("reciver:", recipient);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      // Validate the input data
      if (parseFloat(amount) < 50) {
        // console.log("Minimum amount:");
        return res.status(400).json({
          message: "Minimum amount allowed for sending money is 50 taka",
        });
      }

      // Check if the sender has sufficient balance

      if (sender.balance < amount) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Calculate the transaction fee
      let transactionFee = 0;
      if (parseFloat(amount) > 100) {
        transactionFee = 5;
      }

      // Deduct the amount to be sent and the transaction fee from the sender's account
      const newSenderBalance =
        sender.balance - parseFloat(amount) - transactionFee;

      // Update the sender's account balance
      await UserModel.findByIdAndUpdate(senderUserId, {
        balance: newSenderBalance,
      });

      // Add the sent amount to the recipient's balance
      const newRecipientBalance = recipient.balance + parseFloat(amount);

      // Update the recipient's account balance
      await UserModel.findByIdAndUpdate(recipient, {
        balance: newRecipientBalance,
      });

      // Update the admin's account balance by adding the transaction fee

      const newAdminBalance = admin.balance + 5;
      await AdmintModel.findByIdAndUpdate(admin._id, {
        balance: newAdminBalance,
      });

      // Save the transaction details
      const transaction = new TransactionModel({
        sender: senderUserId,
        recipient: recipient._id,
        amount,
        transactionFee,
        transactionType: "Send-Money",
      });
      await transaction.save();

      res.status(200).json({ message: "Money sent successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
// send money
const cashOut = catchAsync(async (req: Request, res: Response) => {
  try {
    if (req.user) {
      const { amount, pin, recipientPhone } = req.body;
      if (!amount || !pin || !recipientPhone) {
        return res
          .status(404)
          .json({ message: "Amount & Pin must be required" });
      }
      const userId = req.user.userId;
      // Check if the user is an approved agent
      const agentUser = await AgentModel.findOne({ phone: recipientPhone });
      if (!agentUser) {
        return res.status(404).json({ message: "Agent user not found" });
      }

      if (agentUser) {
        if (agentUser.accountType === "agent" && !agentUser.isApproved) {
          return res
            .status(403)
            .json({ message: "Agent not approved for cash-out" });
        }
      }
      const agent = await AgentModel.findOne({ phone: recipientPhone });
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      // Validate the input data
      if (!parseInt(amount) || parseInt(amount) <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      // Find the user by userId
      const user = await UserModel.findById(userId).select("pin balance ");
      // console.log("find user:", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify the account PIN
      const isPinValid = await bcrypt.compare(pin, user.pin);
      if (!isPinValid) {
        return res.status(400).json({ message: "Invalid PIN" });
      }

      // Calculate the cash-out fee (1.5% of the transaction amount)
      const cashOutFee = parseInt((parseInt(amount) * 0.015).toFixed(4));

      // Check if the user has sufficient balance
      if (user.balance < parseInt(amount) + cashOutFee) {
        return res.status(400).json({ message: "Insufficient balance" });
      }

      // Deduct the amount to be withdrawn and the cash-out fee from the user's account
      const newBalance = user.balance - parseInt(amount) - cashOutFee;

      // Update the user's account balance
      await UserModel.findByIdAndUpdate(userId, { balance: newBalance });

      // Update the agent's balance and income

      const agentIncome = parseInt((parseInt(amount) * 0.01).toFixed(4));

      const newAgentBalance = agent.balance + parseInt(amount) - agentIncome;
      await AgentModel.findByIdAndUpdate(agent._id, {
        balance: newAgentBalance,
      });

      // Update the admin's income
      const admin = await AdmintModel.findOne();
      if (!admin) {
        return res.status(404).json({ message: "Admin account not found" });
      }
      const adminIncome = parseFloat((parseInt(amount) * 0.005).toFixed(4));

      const newAdminBalance = admin.balance + adminIncome;
      await AdmintModel.findByIdAndUpdate(admin._id, {
        balance: newAdminBalance,
      });

      // Save the transaction details
      const transaction = new TransactionModel({
        sender: userId,
        transactionType: "Cash-Out",
        amount: amount,
        transactionFee: cashOutFee,
        recipient: agent._id,
      });
      await transaction.save();

      res.status(200).json({ message: "Cash-out successful" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

export const UserController = {
  createUser,
  login,
  userProfile,
  sendMoney,
  cashOut,
  userTransaction,
  users,
  Agents,
};
