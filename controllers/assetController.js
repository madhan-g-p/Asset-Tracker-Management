const { Asset, Category } = require('../models');
const {Op} =require("sequelize");

// List assets with search & filters
exports.list = async (req, res) => {
  try {
    const { search = '', status, categoryId, page = 1, limit = 10,historyPage='false' } = req.query;
    const where = {};
    if (search) {
      where[Op.or] = [
        { make: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
        { serialNumber: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status) {
      where.status = status;
    }else if(!status){
      if(!JSON.parse(historyPage)){
        where.status = { [Op.ne] : 'scrapped' }
      }
    }

    if (categoryId) where.categoryId = categoryId;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { rows, count } = await Asset.findAndCountAll({
      where,
      include: [{ model: Category }],
      offset,
      limit: parseInt(limit),
      order: [['id', 'ASC']]
    });
    res.json({ assets: rows, totalCount: count });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Create asset
exports.create = async (req, res) => {
  try {
    const { serialNumber, make, model, value, status, categoryId } = req.body;
    if (!serialNumber || !categoryId) return res.status(400).json({ error: 'Serial number and category are required' });
    const asset = await Asset.create({ serialNumber, make, model, value, status, categoryId });
    res.status(201).json({ asset });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Serial number must be unique' });
    }
    res.status(500).json({ error: e.message });
  }
};

// Get one asset
exports.getOne = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id, { include: [{ model: Category }] });
    if (!asset) return res.status(404).json({ error: 'Not found' });
    res.json({ asset });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};

// Update asset
exports.update = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Not found' });
    const { serialNumber, make, model, value, status, categoryId } = req.body;
    if (!serialNumber || !categoryId) return res.status(400).json({ error: 'Serial number and category are required' });
    await asset.update({ serialNumber, make, model, value, status, categoryId });
    res.json({ asset });
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Serial number must be unique' });
    }
    res.status(500).json({ error: e.message });
  }
};

// Delete asset
exports.remove = async (req, res) => {
  try {
    const asset = await Asset.findByPk(req.params.id);
    if (!asset) return res.status(404).json({ error: 'Not found' });
    await asset.destroy();
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};