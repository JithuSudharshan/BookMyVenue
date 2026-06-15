import { normalizeName } from "../../utils/normalize-name.js"
import {
    createCategoryRepository,
    getCategoriesRepository,
    getCategoryByNameRepository
} from "../../repositories/admin/category.repository.js";

export const createCategoryService = async ({
    name,
    image,
    description
}) => {

    if (!name || !image) {
        throw new Error("Category name and image are required");
    }

    const normalizedName = normalizeName(name);

    const existingCategory =
        await getCategoryByNameRepository(
            normalizedName
        );

    if (existingCategory) {
        throw new Error(
            "Category already exists"
        );
    }

    const categoryData = {
        name: normalizedName,
        image,
        description
    };

    return await createCategoryRepository(
        categoryData
    );
};

export const getCategoriesService =
    async () => {
        return await getCategoriesRepository();
    };