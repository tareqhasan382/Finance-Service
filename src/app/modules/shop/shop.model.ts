import { Schema, model } from "mongoose";
import { IShop, IShopModel } from "./shop.interface";

const shopSchema = new Schema<IShop>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    price: { type: String, required: true },
    model: { type: String, required: true },
    img: { type: String, required: true },
    display: {
      size: { type: String, required: true },
      type: { type: String },
      resolution: { type: String },
      features: { type: String },
    },
    processor: {
      chipset: { type: String },
      cpuType: { type: String },
      cpuSpeed: { type: String },
      gpu: { type: String },
    },
    memory: {
      ram: { type: String, required: true },
      internalStorage: { type: String, required: true },
      cardSlot: { type: String, required: true },
    },
    camera: {
      rear: {
        resolution: { type: String, required: true },
        features: { type: String },
        videoRecording: { type: String },
      },
      front: {
        resolution: { type: String },
        videoRecording: { type: String },
      },
    },
    audio: {
      speaker: { type: String, required: true },
    },
    networkConnectivity: {
      sim: { type: String, required: true },
      network: { type: String, required: true },
      wifi: { type: String, required: true },
      bluetooth: { type: String, required: true },
      gps: { type: String, required: true },
      nfc: { type: String, required: true },
      usb: { type: String, required: true },
      audioJack: { type: String, required: true },
    },
    os: {
      operatingSystem: { type: String, required: true },
      upgradable: { type: String, required: true },
      features: [{ type: String }],
    },
    features: {
      fingerprint: { type: String, required: true },
      sensors: { type: String, required: true },
      other: { type: String, required: true },
    },
    battery: {
      type: { type: String, required: true },
      capacity: { type: String, required: true },
    },
    physicalSpecification: {
      dimension: { type: String, required: true },
      weight: { type: String, required: true },
      bodyMaterial: { type: String, required: true },
      colors: [{ type: String, required: true }],
    },
    warrantyInformation: {
      warranty: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const ShopModel = model<IShop, IShopModel>("Shop", shopSchema);

export default ShopModel;
