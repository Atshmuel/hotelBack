import jwt, { VerifyErrors } from "jsonwebtoken";
import { config } from "../config/config";
import { Request, Response, NextFunction } from "express";
import { CustomRequest, Users } from "../interfaces/interfaces";
import { getDataFromCookie, tokenHasExp } from "../services/helpers";

export function authenticateToken(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.cookies["jwt"];

  if (!authHeader) {
    return res
      .status(401)
      .json({ message: "You must Authenticate first to use this feature." });
  }

  jwt.verify(
    authHeader,
    config.SECRET_ACCESS,
    (err: VerifyErrors | null, decoded: any) => {
      if (err) {
        return res
          .status(403)
          .json({ message: "Access forbidden, session has expired." });
      }
      req.user = decoded as Users;
      next();
    }
  );
}

export function authRole(roleName: string[]) {
  return function (req: CustomRequest, res: Response, next: NextFunction) {
    const authHeader = getDataFromCookie(req, `jwt`);

    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "You must Authenticate first to use this feature." });
    }
    const { role } = authHeader as Users;

    if (!roleName.includes(role))
      return res.status(403).json({
        message: `Access forbidden, your permission are not allowed to use this function`,
      });

    next();
  };
}

export function authLoggedIn(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const access = getDataFromCookie(req, "jwt");
  const refresh = getDataFromCookie(req, "token");

  if (tokenHasExp(req, "jwt") || !access || !refresh)
    return res.status(400).json({ message: "User is not logged in." });

  next();
}

export function authSelfDelete(
  req: CustomRequest,
  res: Response,
  next: NextFunction
) {
  const { id: deleteId } = req.query;
  const authHeader = getDataFromCookie(req, "jwt");
  if (!deleteId || !authHeader)
    res.status(400).json({
      message:
        "Could not find this employee id or dose not have permissions to perform this action",
    });

  const { userId } = authHeader as { userId: string };
  deleteId === userId
    ? res.status(400).json({ error: "Employee cannot delete himself." })
    : next();
}


export function authSelfAction(req: CustomRequest,
  res: Response,
  next: NextFunction) {
  const authHeader = getDataFromCookie(req, "jwt");
  const data = req.body;

  if (!authHeader || !data) {
    res.status(400).json({
      message:
        "Could not find this employee id or dose not have permissions to perform this action",
    });
  }

  const { userId } = authHeader as { userId: string };
  userId === data.id ? res.status(400).json({ message: "Employee cannot change his own role." }) : next()

}