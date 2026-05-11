import express from "express";

import { signup, signin, refreshToken, signout } from "../controllers/auth.controller.js";
import { checkDuplicateUsernameOrEmail, checkRolesExisted } from "../middlewares/index.js";

const router = express.Router();

router.post(
  "/signup",
  [checkDuplicateUsernameOrEmail, checkRolesExisted],
  signup
);

router.post("/signin", signin);
router.post("/refreshtoken", refreshToken);
router.post("/signout", signout);

export default router;
