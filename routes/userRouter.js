import express from "express";
var router = express.Router();
import userController from "../controller/userController.js";
import isAuthenticated from "../middleware/tokenAuth.js";


router.post("/signup",  userController.SignUp);
router.post("/login", userController.Login);
router.get("/details", isAuthenticated.isAuthenticated , userController.getUserDetails);
router.post("/forgot/password/email",  userController.ForgotPasswordEmail);
router.put("/reset/password/:token", userController.ResetPassword);

//google auth

router.get("/google/auth", userController.googleAuth);
router.get("/google/callback", userController.googleAuthCallback);
router.get("/logout", userController.logout);
export default router;
