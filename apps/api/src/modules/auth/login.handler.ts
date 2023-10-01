import { Request, Response } from "express";

import { generateToken, comparePassword } from "./auth.helper";
import { getUser } from "../../repositories";
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from "../../messages.ts";
import { configs } from "../../configs.ts";

export default async function loginHandler(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await getUser(email);

  if (!user) {
    res.status(400).json({
      ok: false,
      message: ERROR_MESSAGE.LOGIN_INVALID_CREDENTIAL,
    });
    return;
  }

  const { password: saltedPassword } = user;

  const isValid = await comparePassword(password, saltedPassword);

  if (!isValid) {
    res.status(400).json({
      ok: false,
      message: ERROR_MESSAGE.LOGIN_INVALID_CREDENTIAL,
    });
    return;
  }

  const jwtSecret = configs.JWT_SECRET;

  res.status(200).json({
    ok: true,
    message: SUCCESS_MESSAGE.LOGIN_SUCCESS,
    token: generateToken(email, jwtSecret),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  });
}
