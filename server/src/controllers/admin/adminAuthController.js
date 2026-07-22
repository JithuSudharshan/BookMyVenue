import { loginAdminService } from "../../services/admin/adminAuthService.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await loginAdminService(email, password);

    res.status(200).json(admin);
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};
