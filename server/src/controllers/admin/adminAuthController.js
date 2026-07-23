import { loginAdminService } from "../../services/admin/adminAuthService.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await loginAdminService(email, password);

    res.status(200).json({ success: true, message: 'Login successful', data: admin });
  } catch (error) {
    res.status(401).json({
      message: error.message,
    });
  }
};

export const getAdminMe = (req, res) => {
  if (req.user) {
    res.status(200).json({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    });
  } else {
    res.status(404).json({ message: "Admin not found" });
  }
};
