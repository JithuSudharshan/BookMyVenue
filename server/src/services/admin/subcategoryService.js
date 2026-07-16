import { normalizeName } from "../../utils/normalizeName.js";

import {
    createSubcategoryRepository,
    getSubcategoriesRepository,
    getSubcategoryByNameRepository,
    getSubcategoryByIdRepository,
    updateSubcategoryRepository,
    toggleSubcategoryStatusRepository
} from "../../repositories/admin/subcategoryRepository.js";

import {
    getCategoryByIdRepository
} from "../../repositories/admin/categoryRepository.js";



export const createSubcategoryService =
    async ({
        categoryId,
        name
    }) => {

        if (!categoryId) {
            throw new Error(
                "Category is required"
            );
        }

        if (!name?.trim()) {
            throw new Error(
                "Subcategory name is required"
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

        if (!category.isActive) {
            throw new Error(
                "Cannot add subcategory to blocked category"
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
                "Subcategory already exists"
            );
        }

        return await createSubcategoryRepository({
            categoryId,
            name: normalizedName
        });
    };



export const getSubcategoriesService =
    async () => {

        return await getSubcategoriesRepository();
    };



export const updateSubcategoryService =
    async (
        subcategoryId,
        updateData
    ) => {

        const subcategory =
            await getSubcategoryByIdRepository(
                subcategoryId
            );

        if (!subcategory) {
            throw new Error(
                "Subcategory not found"
            );
        }

        if (updateData.name) {

            updateData.name =
                normalizeName(
                    updateData.name
                );

            const existingSubcategory =
                await getSubcategoryByNameRepository(
                    subcategory.categoryId,
                    updateData.name
                );

            if (
                existingSubcategory &&
                existingSubcategory._id.toString() !==
                subcategoryId
            ) {
                throw new Error(
                    "Subcategory already exists"
                );
            }
        }

        return await updateSubcategoryRepository(
            subcategoryId,
            updateData
        );
    };



export const toggleSubcategoryStatusService =
    async (
        subcategoryId,
        isActive
    ) => {

        const subcategory =
            await getSubcategoryByIdRepository(
                subcategoryId
            );

        if (!subcategory) {
            throw new Error(
                "Subcategory not found"
            );
        }

        if (isActive) {

            const category =
                await getCategoryByIdRepository(
                    subcategory.categoryId
                );

            if (!category.isActive) {
                throw new Error(
                    "Cannot activate subcategory under blocked category"
                );
            }
        }

        return await toggleSubcategoryStatusRepository(
            subcategoryId,
            isActive
        );
    };