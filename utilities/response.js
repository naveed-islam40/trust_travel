import messageUtil from "../utilities/message.js";
import { StatusCodes } from "http-status-codes";

class Response {
  ExistallReady = async (res, message) => {
    res.status(StatusCodes.CONFLICT, messageUtil.allReadyExist).send({
      success: false,
      message,
    });
  };

  success = (res, message, data, token) => {
    const options = {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Strict",
    };

    if (token) {
      res.cookie("token", token, options);
    }

    const response = {
      success: true,
      message,
    };

    if (data) {
      response.data = data;
      response.token = token;
    }

    res.status(StatusCodes.OK).send(response);
  };

  authorizationError = (res, message) => {
    res.status(StatusCodes.UNAUTHORIZED).send({
      success: false,
      message,
    });
  };

  serverError = (res, error) => {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      success: false,
      error: error.toString(),
      message: messageUtil.serverError,
    });
  };

  notFound = (res, message) => {
    res.status(StatusCodes.NOT_FOUND).send({
      success: false,
      message,
    });
  };

  badRequest = (res, message) => {
    res.status(StatusCodes.BAD_REQUEST).send({
      success: false,
      message,
    });
  };
}

export default new Response();
