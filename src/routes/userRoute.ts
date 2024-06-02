import { Request, Router } from "express";
import {
  checkUserTokens,
  createUser,
  deleteUser,
  getAllUsers,
  getUser,
  getUserData,
  upDateRefreshToken,
  updateUserData,
  updateUserPassword,
  updateUserRole,
} from "../db/controllers/userController";
import bcrypt from "bcrypt";
import {
  authLoggedIn,
  authRole,
  authSelfAction,
  authSelfDelete,
} from "../middlewares/authHelpers";
import {
  generateAccessToken,
  generateRefreshToken,
  getDataFromCookie,
  limiter,
  lowerCase,
  tokenHasExp,
} from "../services/helpers";
import jwt from "jsonwebtoken";
import { config } from "../config/config";
import { Users } from "../interfaces/interfaces";
import { ObjectId } from "mongoose";

export const userRouter = Router();

userRouter.get("/all", async (req, res) => {
  try {
    const foundUsers = await getAllUsers();
    if (!foundUsers.length) throw new Error("Could not find users.");

    res.status(200).json(foundUsers);
  } catch (error) {
    res.status(400).json({ message: error?.message });
  }
});


userRouter.post(
  "/signup",
  authRole([config.ROLE.ADMIN, config.ROLE.EMPLOYEE]),
  async (req, res) => {
    let {
      email,
      firstName,
      lastName,
      phone,
      password,
      userRole: role,
      userAvatar,
    }: {
      email: string;
      firstName: string;
      lastName: string;
      userLastName: string;
      phone: string;
      password: string;
      userRole: string;
      userAvatar: string;
    } = req.body;

    try {
      password = await bcrypt.hash(password, 10);
      email = lowerCase(email);
      firstName = lowerCase(firstName);
      lastName = lowerCase(lastName);

      const hasCreated = await createUser({
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        userAvatar,
      });
      if (!hasCreated) throw new Error("User already exist.");
      res.status(200).json(hasCreated && "User has created successfully");
    } catch (error) {
      res.status(400).json(error?.message);
    }
  }
);

userRouter.post("/login", limiter(60, 5), async (req, res) => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await getUser(email.toLowerCase());

    if (!user) throw new Error("User dose not exist!");
    const isValidPassword = await bcrypt.compare(password, user?.password);
    if (!isValidPassword) throw new Error("Email or password is wrong.");

    const { _id: userId, role } = user;
    const accessRole =
      role === config.ROLE.ADMIN
        ? config.ROLE_NUM.ADMIN
        : role === config.ROLE.EMPLOYEE
          ? config.ROLE_NUM.EMPLOYEE
          : config.ROLE_NUM.CUSTOMER;
    const accessToken = generateAccessToken({ userId, role });
    const refreshToken = generateRefreshToken({ userId, role });
    const userGotTheRefreshToken = await upDateRefreshToken(
      userId,
      refreshToken,
      "push"
    );
    if (!userGotTheRefreshToken) throw new Error("Failed to find the user.");
    res.cookie("jwt", accessToken, { httpOnly: true });
    res.cookie("token", refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + config.THIRTY_DAYS),
    });
    res.cookie("perm", accessRole);

    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(401).json({ message: error?.message });
  }
});

userRouter.get("/login", async (req, res) => {
  try {
    const refreshToken = req.cookies["token"];
    console.log(refreshToken);
    if (!refreshToken) throw new Error("No token found.");

    if (tokenHasExp(req, "token")) throw new Error("Token has expierd");
    const info = getDataFromCookie(req, "token") as Users;
    const { userId } = info;

    const userHasTheToken = await checkUserTokens(userId, refreshToken);
    const user = await getUserData(userId);
    if (!userHasTheToken || !user) throw new Error("Token is not valid!");
    const role = user?.role;
    const accessRole =
      role === config.ROLE.ADMIN
        ? config.ROLE_NUM.ADMIN
        : role === config.ROLE.EMPLOYEE
          ? config.ROLE_NUM.EMPLOYEE
          : config.ROLE_NUM.CUSTOMER;
    const accessToken = generateAccessToken({ userId, role });
    res.cookie("jwt", accessToken, { httpOnly: true });
    res.cookie("perm", accessRole);

    res.status(200).json({ message: "Logged in" });
  } catch (error) {
    res.status(401).json({ message: error?.message });
  }
});

userRouter.get(
  "/userInfo",
  authLoggedIn,
  limiter(60 * 60, 800),
  async (req, res) => {
    const info = getDataFromCookie(req, "jwt") as Users;
    const { userId } = info;
    try {
      const user = await getUserData(userId);
      if (!user) throw new Error("Could not find that user.");
      res.status(200).json(user);
    } catch (error) {
      res.status(400).json({ message: error?.message });
    }
  }
);

userRouter.get("/logout", authLoggedIn, async (req, res) => {
  const userData = getDataFromCookie(req, "jwt");
  const refresh = req.cookies["token"];
  const { userId } = userData as Users;
  const clearedTokensFromDB = await upDateRefreshToken(userId, refresh, "pull");
  Object.keys(req.cookies).forEach((cookie) =>
    res.cookie(cookie, "", { expires: new Date(0) })
  );

  if (clearedTokensFromDB)
    return res.status(200).json({ message: "Logged out Successfully, Bye." });
  return res.status(400).json({ message: "Logout failed" });
});
userRouter.post("/refresh", limiter(60 * 60, 4), (req, res) => {
  const refreshToken = req.cookies["token"];
  if (!refreshToken) return res.sendStatus(401);

  jwt.verify(refreshToken, config.SECRET_REFRESH, (err, decoded) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({
      userId: decoded?.userId,
      role: decoded?.role,
    });

    res.cookie("jwt", accessToken, { httpOnly: true });
    res.status(400).json({ accessToken });
  });
});

userRouter.delete(
  "/delete",
  authRole([config.ROLE.ADMIN]),
  authSelfDelete,
  async (req, res) => {
    try {
      const { id }: { id?: ObjectId } = req.query;
      if (!id) throw new Error("Could not find this employee id");
      const HasDeleted = await deleteUser(id);
      if (!HasDeleted)
        throw new Error(
          "Cloud not delete the employee, Please try again later."
        );
      res
        .status(200)
        .json({ message: "Employee has been delete successfully." });
    } catch (error) {
      res.status(400).json({ error: error?.message });
    }
  }
);

userRouter.patch('/update/data', authLoggedIn, limiter(60 * 60, 10), authSelfAction, async (req, res) => {
  const userData = req.body;
  const cookie = getDataFromCookie(req, "jwt");
  const { userId } = cookie as Users;

  try {
    if (userData.id) {
      const updatedUser = await updateUserRole(userData)
      if (!updatedUser) throw Error('Could not update the user role.')
      return res.status(200).json({ message: 'User role updated successfully.' })
    }
    const updatedUser = await updateUserData(userId, userData)
    if (!updatedUser) throw new Error('Could not update the user or updated value is not allowed.')
    res.status(200).json({ message: 'User info updated successfully.' })
  } catch (error) {

    res.status(400).json({ message: error?.message })
  }
})


userRouter.patch('/update/password', async (req, res) => {
  const passwords = req.body;
  const cookie = getDataFromCookie(req, "jwt");
  const { userId } = cookie as Users;

  try {
    const updatedUser = await updateUserPassword(userId, passwords)

    if (!updatedUser) throw new Error('Could not update the password or current password is not valid.')
    res.status(200).json({ message: 'Password updated successfully.' })
  } catch (error) {

    res.status(400).json({ message: error?.message })
  }
})
