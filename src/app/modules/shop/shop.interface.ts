import { Model, Types } from "mongoose";

export type IShop = {
  userId: Types.ObjectId;
  name: string;
  price: string;
  model: string;
  img: string;
  display: {
    size: string;
    type?: string;
    resolution: string;
    features?: string;
  };
  processor: {
    chipset?: string;
    cpuType?: string;
    cpuSpeed?: string;
    gpu?: string;
  };
  memory: {
    ram: string;
    internalStorage: string;
    cardSlot?: string;
  };
  camera: {
    rear: {
      resolution: string;
      features: string;
      videoRecording: string;
    };
    front: {
      resolution: string;
      videoRecording: string;
    };
  };
  audio: {
    speaker: string;
  };
  networkConnectivity: {
    sim: string;
    network: string;
    wifi: string;
    bluetooth: string;
    gps: string;
    nfc: string;
    usb: string;
    audioJack: string;
  };
  os: {
    operatingSystem: string;
    upgradable: string;
    features?: [string];
  };
  features: {
    fingerprint: string;
    sensors: string;
    other: string;
  };
  battery: {
    type?: string;
    capacity?: string;
  };
  physicalSpecification: {
    dimension: string;
    weight: string;
    bodyMaterial: string;
    colors: [string];
  };
  warrantyInformation: {
    warranty: string;
  };
};
export type IShopModel = Model<IShop, Record<string, unknown>>;
// price, name, type, processor, memory, OS.
