const Category = require("../models/categoryModel");

const categoryController = {
    getAllCategories: async (req, res) => {
        try {
            const categories = await Category.getAll();
            res.status(200).json({ success: true, data: categories });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createCategory: async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            const newId = await Category.create(name);
            res.status(201).json({ success: true, data: { id: newId, name } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getCategoryById: async (req, res) => {
        try {
            const { id } = req.params;
            const category = await Category.getById(parseInt(id));
            if (!category) {
                return res.status(404).json({ success: false, message: "Category not found" });
            }
            res.status(200).json({ success: true, data: category });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            const success = await Category.update(parseInt(id), name);
            if (success) {
                res.status(200).json({ success: true, message: "Category updated successfully" });
            } else {
                res.status(404).json({ success: false, message: "Category not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteCategory: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await Category.delete(parseInt(id));
            if (success) {
                res.status(200).json({ success: true, message: "Category deleted successfully" });
            } else {
                res.status(404).json({ success: false, message: "Category not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};


module.exports = categoryController;
