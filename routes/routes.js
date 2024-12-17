import express from "express";
var router = express.Router();
import userRoutes from "./userRouter.js";


router.use("/user", userRoutes)


export default router;
