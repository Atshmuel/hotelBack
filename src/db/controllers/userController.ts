import { userModel } from "../models/models";
import { getTime } from "../../services/helpers";
import { ObjectId } from "mongoose";
import { Users } from "../../interfaces/interfaces";
import bcrypt from "bcrypt";

export const createUser = async ({
  email,
  firstName,
  lastName,
  phone,
  role,
  password,
  userAvatar,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  password: string;
  userAvatar: string;
}) => {
  if (
    (await userModel.findOne({ email })) ||
    (await userModel.findOne({ phone }))
  )
    return false;
  const newUser = await userModel.create({
    email,
    firstName,
    lastName,
    phone,
    role,
    password,
    userAvatar,
    createdAt: getTime(),
  });
  return true;
};

export const getUser = async (email: string) => {
  const user = await userModel.findOne({ email: email.toLowerCase() });
  return user;
};
export const getUserData = async (id: ObjectId) => {
  const userData = await userModel.findById(id);

  if (!userData) return;

  return userData;
};

export const upDateRefreshToken = async (
  userId: ObjectId,
  token: string,
  method: string
) => {
  let updatedUser;
  if (method === "push") {
    updatedUser = await userModel.findByIdAndUpdate(userId, {
      $push: { refreshToken: token },
    });
  }
  if (method === "pull") {
    updatedUser = await userModel.findByIdAndUpdate(userId, {
      $set: { refreshToken: [] },
    });
  }
  if (updatedUser) return updatedUser;
  throw new Error("Method is not allowed");
};

export const checkUserTokens = async (userId: ObjectId, token: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new Error("Cannot find that user.");
  const userHasTheToken = user?.refreshToken?.includes(token);
  return userHasTheToken;
};

export const getAllUsers = async () => {
  const allUsers = (await userModel.find().sort({ role: 1 })).filter((user) => user.role !== 'owner')
  if (!allUsers) throw new Error("Could not find users.");
  return allUsers;
};

export const deleteUser = async (id: ObjectId) => {
  const userFound = await userModel.findByIdAndDelete(id);
  if (!userFound) throw new Error("Could not find employee.");
  return userFound;
};

export const updateUserData = async (id: ObjectId, data: Users) => {
  const { firstName, lastName, phone } = data;
  if (!firstName || !lastName || !phone) return false;
  if (await userModel.findOne({ phone: phone })) return false;
  const userUpdated = await userModel.findByIdAndUpdate(id, data);
  return userUpdated ? true : false;
};

export const updateUserPassword = async (
  id: ObjectId,
  passwords: { newPassword: string; oldPassword: string }
) => {
  const user = await userModel.findById(id);
  if (!user) return false;
  const isValidPassword = await bcrypt.compare(
    passwords.oldPassword,
    user.password
  );
  if (!isValidPassword) return false;
  const password = await bcrypt.hash(passwords.newPassword, 10);
  if (!password) return false;
  const lastPasswordChange = getTime();

  const hasUpdatedPassword = await user.updateOne({
    password,
    lastPasswordChange,
  });
  return hasUpdatedPassword ? true : false;
};

export const updateUserRole = async (userData: Users) => {
  const { role, id } = userData;
  if (!role || !id) return false;
  const userUpdated = await userModel.findByIdAndUpdate(id, { role });
  return userUpdated ? true : false;
};
