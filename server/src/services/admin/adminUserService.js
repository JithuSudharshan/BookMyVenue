import {
  getAllUsers,
  getUserByIdRepo,
  updateUserBlockStatusById,
} from "../../repositories/admin/adminUserRepository.js";

export const getUsersService = async (options) => {
  return await getAllUsers(options);
};

export const getUserByIdService = async (userId) => {
  const user = await getUserByIdRepo(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

export const updateUserBlockStatusService = async (userId, isBlocked) => {
  const user = await updateUserBlockStatusById(userId, isBlocked);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};
