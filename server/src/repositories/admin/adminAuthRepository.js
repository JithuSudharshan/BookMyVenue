import Admin from "../../models/adminModel.js";

export const findAdminByEmail = async (email) => {
  return await Admin.findOne({ email }).select("+password");
};
