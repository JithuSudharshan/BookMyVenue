import axiosInstance from "../axiosConfig";

// Categories

export const getCategories = async (params) => {
  try {
    const response = await axiosInstance.get("/admin/categories", { params });
    return response.data.data; // { categories: [], pagination: {} }
  } catch (error) {
    console.error("Error fetching categories", error);
    throw error;
  }
};

export const createCategory = async (data) => {
  try {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    const response = await axiosInstance.post("/admin/categories", formData);
    return response.data;
  } catch (error) {
    console.error("Error creating category", error);
    throw error;
  }
};

export const updateCategory = async (categoryId, data) => {
  try {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    const response = await axiosInstance.patch(`/admin/categories/${categoryId}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating category", error);
    throw error;
  }
};

export const toggleCategoryStatus = async (categoryId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/admin/categories/${categoryId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error toggling category status", error);
    throw error;
  }
};

// Subcategories

export const createSubcategory = async (data) => {
  try {
    const response = await axiosInstance.post("/admin/subcategories", data);
    return response.data;
  } catch (error) {
    console.error("Error creating subcategory", error);
    throw error;
  }
};

export const updateSubcategory = async (subcategoryId, data) => {
  try {
    const response = await axiosInstance.patch(`/admin/subcategories/${subcategoryId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating subcategory", error);
    throw error;
  }
};

export const toggleSubcategoryStatus = async (subcategoryId, isActive) => {
  try {
    const response = await axiosInstance.patch(`/admin/subcategories/${subcategoryId}/status`, { isActive });
    return response.data;
  } catch (error) {
    console.error("Error toggling subcategory status", error);
    throw error;
  }
};

export const deleteSubcategory = async (subcategoryId) => {
  try {
    const response = await axiosInstance.delete(`/admin/subcategories/${subcategoryId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting subcategory", error);
    throw error;
  }
};
