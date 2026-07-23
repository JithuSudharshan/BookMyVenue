import jwt from "jsonwebtoken";
import { findAdminByEmail } from "../../repositories/admin/adminAuthRepository.js";

const generateAdminToken = (adminId) => {
  return jwt.sign(
    { id: adminId },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

export const loginAdminService = async (email, password) => {
  const admin = await findAdminByEmail(email);

  if (!admin) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await admin.matchPassword(password);

  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    token: generateAdminToken(admin._id),
  };
};
