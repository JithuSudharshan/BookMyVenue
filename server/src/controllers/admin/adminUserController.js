import {
  getUsersService,
  getUserByIdService,
  updateUserBlockStatusService,
} from "../../services/admin/adminUserService.js";

export const getUsers = async (req, res) => {
  try {
    const search = req.query.search || req.query.q || "";
    const status = req.query.status || "All";
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;

    const { data, total } = await getUsersService({ search, status, page, limit });

    res.status(200).json({
      data,
      pagination: {
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await getUserByIdService(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    res.status(404).json({
      message: error.message,
    });
  }
};

export const updateUserBlockStatus = async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const user = await updateUserBlockStatusService(req.params.id, isBlocked);

    res.status(200).json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user,
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
