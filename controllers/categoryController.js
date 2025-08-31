const { Category } = require('../models');
const { Op } = require('sequelize');

// List with search & pagination
exports.list = async (req, res) => {
  try {
    const { search = '', page = 1, limit = 10 } = req.query;
    const where = {};
    if (search) where.name = { [Op.iLike]: `%${search}%` }; // or Sequelize.Op.like
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Category.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['id', 'ASC']]
    });
    res.json({ categories: rows, totalCount: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Create
exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const cat = await Category.create({ name });
    res.status(201).json({ category: cat });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Category name must be unique' });
    }
    res.status(500).json({ error: e.message });
  }
};

// Get one
exports.getOne = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    res.json({ category: cat });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    await cat.update({ name });
    res.json({ category: cat });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Category name must be unique' });
    }
    res.status(500).json({ error: e.message });
  }
};

// Delete
exports.remove = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    await cat.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};