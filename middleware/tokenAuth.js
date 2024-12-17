
import jwtHelper from "../utilities/jwt.js";
import Response from "../utilities/response.js";
import messageUtil from "../utilities/message.js";

const isAuthenticated = async (req, res, next) => {
  try {

    const token = req.cookies.token

    if (!token) {
      return Response.notFound(res, messageUtil.TOKEN_EMPTY);
    }

    const isVerified = jwtHelper.verify(token);

    if (!isVerified) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
        missingParameters: ["login_token"],
      });
    }

    req.userId = isVerified._id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export default { isAuthenticated };
