import { normalizeName } from "../../utils/normalizeName.js";

import {
    createCategoryRepository,
    getCategoriesRepository,
    getCategoriesCountRepository,
    getCategoryByNameRepository,
    getCategoryByIdRepository,
    updateCategoryRepository,
    toggleCategoryStatusRepository
} from "../../repositories/admin/categoryRepository.js";

import {
    blockAllSubcategoriesByCategoryRepository
} from "../../repositories/admin/subcategoryRepository.js";



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


export const getCategoriesService = async (query) => {

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 6;

    const search = query.search?.trim() || "";
    const status = query.status || "all";
    const sort = query.sort || "newest";

    const skip = (page - 1) * limit;

    const categories = await getCategoriesRepository({
        search,
        status,
        sort,
        skip,
        limit
    });

    const totalCategories =
        await getCategoriesCountRepository({
            search,
            status
        });

    return {
        categories,

        pagination: {
            currentPage: page,
            totalPages: Math.ceil(
                totalCategories / limit
            ),
            totalCategories,
            limit
        }
    };
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

        return updatedCategory;
    };