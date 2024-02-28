import express from "express";
import { authVerify } from "../../middlewares/authVerify";
import { ENUM_ROLE } from "./agent.interface";
import { AgentController } from "./agent.controller";
const router = express.Router();
router.get(
  "/agentProfile",
  authVerify(ENUM_ROLE.AGENT, ENUM_ROLE.ADMIN),
  AgentController.agentProfile
);
router.get(
  "/agentTransaction",
  authVerify(ENUM_ROLE.AGENT, ENUM_ROLE.ADMIN),
  AgentController.agentTransaction
);
//   router.get('/user/:id', UserController.getUser),
//   router.patch('/user/:id', UserController.updateUser)
router.post("/agent/login", AgentController.login);
router.post("/agent/signup", AgentController.createAgent);
router.post(
  "/agent/cashIn",
  authVerify(ENUM_ROLE.AGENT),
  AgentController.cashIn
);
router.post(
  "/agent/cashOut",
  authVerify(ENUM_ROLE.AGENT),
  AgentController.cashOut
);
export const AgentRoute = router;
