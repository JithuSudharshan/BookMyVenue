import { normalizeName } from "../../utils/normalize-name.js";

import {
    createCategoryRepository,
    getCategoriesRepository,
    getCategoryByNameRepository,
    getCategoryByIdRepository,
    updateCategoryRepository,
    toggleCategoryStatusRepository
} from "../../repositories/admin/category.repository.js";

import {
    blockAllSubcategoriesByCategoryRepository
} from "../../repositories/admin/subcategory.repository.js";



export const createCategoryService = async ({
    name,
    image,
    description
}) => {

    if (!name?.trim()) {
        throw new Error(
            "Category name is required"
        );
    }

    if (!image?.trim()) {
        throw new Error(
            "Category image is required"
        );
    }

    const normalizedName =
        normalizeName(name);

    const existingCategory =
        await getCategoryByNameRepository(
            normalizedName
        );

    if (existingCategory) {
        throw new Error(
            "Category already exists"
        );
    }

    return await createCategoryRepository({
        name: normalizedName,
        image,
        description
    });
};



export const getCategoriesService =
    async () => {

        return await getCategoriesRepository();
    };



export const updateCategoryService =
    async (
        categoryId,
        updateData
    ) => {

        const category =
            await getCategoryByIdRepository(
                categoryId
            );

        if (!category) {
            throw new Error(
                "Category not found"
            );
        }

        if (updateData.name) {

            updateData.name =
                normalizeName(
                    updateData.name
                );

            const existingCategory =
                await getCategoryByNameRepository(
                    updateData.name
                );

            if (
                existingCategory &&
                existingCategory._id.toString() !==
                categoryId
            ) {
                throw new Error(
                    "Category already exists"
                );
            }
        }

        return await updateCategoryRepository(
            categoryId,
            updateData
        );
    };



export const toggleCategoryStatusService =
    async (
        categoryId,
        isActive
    ) => {

        const category =
            await getCategoryByIdRepository(
                categoryId
            );

        if (!category) {
            throw new Error(
                "Category not found"
            );
        }

        const updatedCategory =
            await toggleCategoryStatusRepository(
                categoryId,
                isActive
            );

        if (!isActive) {

            await blockAllSubcategoriesByCategoryRepository(
                categoryId
            );
        }

        return updatedCategory;
    };