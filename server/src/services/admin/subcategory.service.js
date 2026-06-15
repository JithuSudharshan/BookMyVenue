import { normalizeName } from "../../utils/normalize-name.js"
import {
    createSubcategoryRepository,
    getSubcategoriesRepository,
    getSubcategoryByNameRepository
} from "../../repositories/admin/subcategory.repository.js";

import {
    getCategoryByIdRepository
} from "../../repositories/admin/category.repository.js";

export const createSubcategoryService =
    async ({
        categoryId,
        name
    }) => {

        if (!categoryId || !name) {
            throw new Error(
                "Category and subcategory name are required"
            );
        }

        const category =
            await getCategoryByIdRepository(
                categoryId
            );

        if (!category) {
            throw new Error(
                "Category not found"
            );
        }

        const normalizedName =
            normalizeName(name);

        const existingSubcategory =
            await getSubcategoryByNameRepository(
                categoryId,
                normalizedName
            );

        if (existingSubcategory) {
            throw new Error(
                "Subcategory already exists in this category"
            );
        }

        const subcategoryData = {
            categoryId,
            name: normalizedName
        };

        return await createSubcategoryRepository(
            subcategoryData
        );
    };

export const getSubcategoriesService =
    async () => {
        return await getSubcategoriesRepository();
    };