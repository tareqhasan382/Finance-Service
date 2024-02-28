/* eslint-disable @typescript-eslint/no-explicit-any */
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { SortOrder } from "mongoose";
import ShopModel from "./shop.model";
const createProduct = catchAsync(async (req: Request, res: Response) => {
  try {
    const data = req.body;
    // console.log("Data:", data);
    const result = await ShopModel.create(data);
    return res.json({
      status: "true",
      message: "Product Created Successfully.",
      data: result,
    });
  } catch (error) {
    return res.json({ status: "false", message: "Failed to create Product." });
  }
});
const allProduct = catchAsync(async (req: Request, res: Response) => {
  try {
    const { price, name, type, processor, memory, os } = req.query;
    // Build a query object based on the provided filters
    const query: any = {};

    if (price) {
      query["price"] = price;
    }

    if (name) {
      // query.category = { $regex: new RegExp(search as string, 'i') }
      query["name"] = new RegExp(name as string, "i"); // Case-insensitive search
    }

    if (type) {
      query["display.type"] = type;
    }

    if (processor) {
      query["processor.chipset"] = processor;
    }

    if (memory) {
      query["memory.ram"] = memory;
    }

    if (os) {
      query["os.operatingSystem"] = os;
    }

    // Fetch mobiles based on the constructed query
    const mobiles = await ShopModel.find(query);

    res.json({
      status: "true",
      message: "Mobiles fetched successfully.",
      data: mobiles,
    });
    //====================================
    // const result = await ShopModel.find();
    // return res.json({
    //   status: "true",
    //   message: "Product retrive Successfully.",
    //   data: result,
    // });
  } catch (error) {
    return res.json({ status: "false", message: "Failed to retrive Product." });
  }
});
const userProduct = catchAsync(async (req: Request, res: Response) => {
  try {
    const { userId }: any = req.user;
    console.log("userId:", userId);
    const result = await ShopModel.find({ userId: userId });
    return res.json({
      status: "true",
      message: "Product retrive Successfully.",
      data: result,
    });
  } catch (error) {
    return res.json({ status: "false", message: "Failed to retrive Product." });
  }
});
const singleProduct = catchAsync(async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    //console.log("id:", id);
    const result = await ShopModel.findById(id);
    return res.json({
      status: "true",
      message: "Product retrive Successfully.",
      data: result,
    });
  } catch (error) {
    return res.json({ status: "false", message: "Failed to retrive Product." });
  }
});
export const shopController = {
  createProduct,
  allProduct,
  userProduct,
  singleProduct,
};
