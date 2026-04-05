const Author = require("../models/authorModel");

const authorController = {
    getAllAuthors: async (req, res) => {
        try {
            const authors = await Author.getAll();
            res.status(200).json({ success: true, data: authors });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    createAuthor: async (req, res) => {
        try {
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            const newId = await Author.create(name);
            res.status(201).json({ success: true, data: { id: newId, name } });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    getAuthorById: async (req, res) => {
        try {
            const { id } = req.params;
            const author = await Author.getById(parseInt(id));
            if (!author) {
                return res.status(404).json({ success: false, message: "Author not found" });
            }
            res.status(200).json({ success: true, data: author });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    updateAuthor: async (req, res) => {
        try {
            const { id } = req.params;
            const { name } = req.body;
            if (!name) {
                return res.status(400).json({ success: false, message: "Name is required" });
            }
            const success = await Author.update(parseInt(id), name);
            if (success) {
                res.status(200).json({ success: true, message: "Author updated successfully" });
            } else {
                res.status(404).json({ success: false, message: "Author not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },

    deleteAuthor: async (req, res) => {
        try {
            const { id } = req.params;
            const success = await Author.delete(parseInt(id));
            if (success) {
                res.status(200).json({ success: true, message: "Author deleted successfully" });
            } else {
                res.status(404).json({ success: false, message: "Author not found" });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
};


module.exports = authorController;
