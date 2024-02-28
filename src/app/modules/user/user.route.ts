import express from "express";
import { UserController } from "./user.controller";
import { authVerify } from "../../middlewares/authVerify";
import { ENUM_ROLE } from "./user.interface";
const router = express.Router();
router.get("/agents", authVerify(ENUM_ROLE.USER), UserController.Agents);
router.get(
  "/userProfile",
  authVerify(ENUM_ROLE.USER),
  UserController.userProfile
);
router.get(
  "/users",
  authVerify(ENUM_ROLE.USER, ENUM_ROLE.AGENT),
  UserController.users
);
router.get(
  "/userTransaction",
  authVerify(ENUM_ROLE.USER),
  UserController.userTransaction
);
//   router.get('/user/:id', UserController.getUser),
//   router.patch('/user/:id', UserController.updateUser)
router.post("/user/login", UserController.login);
router.post("/user/signup", UserController.createUser);
router.post(
  "/user/sendMoney",
  authVerify(ENUM_ROLE.USER),
  UserController.sendMoney
);
router.post(
  "/user/cashOut",
  authVerify(ENUM_ROLE.USER),
  UserController.cashOut
);
export const UserRoute = router;
