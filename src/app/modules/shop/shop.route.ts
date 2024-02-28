import express from "express";
import { shopController } from "./shop.controller";
import { authVerify } from "../../middlewares/authVerify";
import { ENUM_ROLE } from "../user/user.interface";
const router = express.Router();
//authVerify(ENUM_ROLE.ADMIN, ENUM_ROLE.SELLER, ENUM_ROLE.USER),
router.get("/product/:id", shopController.singleProduct),
  router.get("/products", shopController.allProduct),
  router.get(
    "/userByproduct",
    authVerify(ENUM_ROLE.USER),
    shopController.userProduct
  ),
  //   router.patch('/user/:id', UserController.updateUser)
  // router.post("/login", UserController.login);
  router.post("/addProduct", shopController.createProduct);
export const ShopRoute = router;
