import express from "express";

import {
  allAccess,
  userBoard,
  adminBoard,
  moderatorBoard,
} from "../controllers/user.controller.js";
import { authJwt } from "../middlewares/index.js";

const router = express.Router();

router.get("/all", allAccess);
router.get("/user", [authJwt.verifyToken], userBoard);
router.get("/mod", [authJwt.verifyToken, authJwt.isModerator], moderatorBoard);
router.get("/admin", [authJwt.verifyToken, authJwt.isAdmin], adminBoard);

export default router;
