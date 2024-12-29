import jwtHelper from "../utilities/jwt.js";
import Response from "../utilities/response.js";
import messageUtil from "../utilities/message.js";
import userService from "../services/userServices.js";
import { bcryptHash, comparePassword } from "../utilities/password.js";
import transporter from "../middleware/transporter.js";
import cloudnary from "cloudinary";
import passport from "passport";
import UserSchema from "../model/Baseuser.js";

class UserController {
  SignUp = async (req, res) => {
    const {
      body: { first_name, last_name, email, password },
    } = req;
    try {
      let user = await UserSchema.findOne({ email: req.body.email });

      if (user) {
        return Response.ExistallReady(res, messageUtil.ALL_READY_EXIST);
      }

      user = await userService.createUser({
        ...req.body,
        password: await bcryptHash(req.body.password),
      });
      const token = await jwtHelper.issue({ _id: user._id });
      return Response.success(res, messageUtil.USER_CREATED, user, token);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  Login = async (req, res) => {
    try {
      let user = await UserSchema.findOne({ email: req.body.email });
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      const isMatch = await comparePassword(req.body.password, user.password);
      if (!isMatch)
        return Response.authorizationError(res, messageUtil.INCORRECT_PASSWORD);
      const token = await jwtHelper.issue({ _id: user._id });
      return Response.success(res, messageUtil.LOGIN_SUCCESS, user, token);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  getUserDetails = async (req, res) => {
    try {
      const { userId } = req;
      const user = await userService.findUser(userId);
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      return Response.success(res, messageUtil.USER_DETAILS_FETCHED, user);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  ForgotPasswordEmail = async (req, res) => {
    const {
      body: { email },
    } = req;
    try {
      const user = await userService.forgotPasswordEmail(email);
      if (!user) {
        return Response.notFound(res, messageUtil.NOT_FOUND);
      }

      const token = jwtHelper.issue({ id: user._id });
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;
      const mailOptions = {
        from: process.env.EMAIL_SENDER,
        to: email,
        subject: "Reset Password",
        html: `<div style="font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; padding: 20px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
              <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px; color: #333;">
              To reset your password, please click the following link:
              </p>

                <a href="${resetLink}" style="display: inline-block; font-size: 16px; color: #ffffff; background-color: #3076B1; padding: 12px 20px; text-decoration: none; border-radius: 4px; margin-bottom: 20px;">
                  Reset Password
                </a>

                <p style="font-size: 14px; line-height: 1.5; margin-top: 20px; color: #555;">
                  If you did not request a password reset, please ignore this email.
                </p>

                <p style="font-size: 14px; color: #777; margin-top: 30px;">
                  Thank you,<br>
                  Trust Travel
                </p>
              </div>`,
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.log("Email sent: ", info.response);
        }
      });

      return Response.success(res, messageUtil.FORGOT_PASSWORD_EMAIL_SENT);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  ResetPassword = async (req, res) => {
    try {
      const {
        body: { password },
        params: { token },
      } = req;
      const { id } = jwtHelper.verify(token);
      const user = await userService.resetPassword(
        id,
        { password: await bcryptHash(password) },
        { new: true }
      );
      if (!user) {
        return Response.notFound(res, messageUtil.NOT_FOUND);
      }
      return Response.success(res, messageUtil.PASSWORD_RESET_SUCCESS);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  UserAuth = async (req, res) => {
    let user;
    try {
      user = await userService.findUser({ _id: req.userId });
      if (!user) {
        return Response.notFound(res, messageUtil.NOT_FOUND);
      } else {
        return Response.success(res, messageUtil.OK, user);
      }
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  GetAllUsers = async (req, res) => {
    try {
      let users;
      if (req.query.role) {
        const role = req.query.role?.includes(",")
          ? req.query.role.split(",")
          : req.query.role;
        users = await userService.findAll({
          ...req.query,
          role: { $in: role },
        });
      } else {
        users = await userService.findAll(req.query);
      }
      if (!users) return Response.notFound(res, messageUtil.NOT_FOUND);
      return Response.success(res, messageUtil.OK, users);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  UpdateUser = async (req, res) => {
    const { userId } = req;
    const { first_name, last_name, email, password } = req.body
    try {
      let user = await userService.findUser(req.userId);
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      const hashPassword = await bcryptHash(password);
      user = await userService.updateUser(userId, {
        first_name,
        last_name,
        email,
        password: hashPassword
      });
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      return Response.success(res, messageUtil.OK, user);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  RefreshToken = async (req, res) => {
    try {
      const token = await jwtHelper.issue({ _id: req.userId });
      return Response.success(res, messageUtil.OK, {}, token);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };

  DeleteUser = async (req, res) => {
    try {
      let admin = await userService.findUser({ _id: req.userId });
      if (!admin)
        return Response.authorizationError(res, messageUtil.UNAUTHORIZED);
      let user = await userService.findUser({ _id: req.params.id });
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      user = await userService.deleteUser({ _id: req.params.id });
      if (!user) return Response.notFound(res, messageUtil.NOT_FOUND);
      return Response.success(res, messageUtil.OK, user);
    } catch (error) {
      return Response.serverError(res, error);
    }
  };
  UploadImage = async (req, res) => {
    try {
      cloudnary.v2.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.CLOUDNARY_API_KEY,
        api_secret: process.env.CLOUDNARY_API_SECRECT,
      });
      if (!req.file)
        return Response.badRequest(res, messageUtil.FILENOTUPLOADED);
      const fileBase64 = `data:${req.file.mimetype
        };base64,${req.file.buffer.toString("base64")}`;
      let result = await cloudnary.uploader.upload(fileBase64);

      return Response.success(res, messageUtil.OK, { url: result.secure_url });
    } catch (error) {
      return Response.serverError(res, JSON.stringify(error));
    }
  };

  googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
  });

  googleAuthCallback = (req, res, next) => {
    passport.authenticate("google", async (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.redirect("/login");

      try {
        const email = user.emails[0].value;
        let existingUser = await userService.findByEmail(user.emails[0].value);

        if (existingUser) {
          const token = jwtHelper.issue({ id: existingUser._id });

          return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        } else {
          const newUser = await userService.createUser({
            email: email,
            first_name: user.name.familyName,
            last_name: user.name.givenName,
          });
          const token = jwtHelper.issue({ id: newUser._id });
          return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
        }
      } catch (error) {
        return Response.serverError(res, error);
      }
    })(req, res, next);
  };

  logout = (req, res) => {
    req.logout((err) => {
      if (err) return next(err);
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    });
  };
}

export default new UserController();
