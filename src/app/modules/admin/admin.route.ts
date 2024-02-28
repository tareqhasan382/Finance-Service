import express from "express";
import { authVerify } from "../../middlewares/authVerify";
import { AdminController } from "./admin.controller";
import { ENUM_ROLE } from "./admin.interface";
const router = express.Router();
router.get(
  "/adminProfile",
  authVerify(ENUM_ROLE.ADMIN),
  AdminController.adminProfile
);
router.get(
  "/admin/allAgent",
  authVerify(ENUM_ROLE.ADMIN),
  AdminController.allAgent
);
//   router.get('/user/:id', UserController.getUser),
//   router.patch('/user/:id', UserController.updateUser)
router.post("/admin/login", AdminController.login);
router.post("/admin/signup", AdminController.createAdmin);
router.patch("/admin/approveAgent", AdminController.approveAgent);

export const AdminRoute = router;
