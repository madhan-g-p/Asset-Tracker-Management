const { Employee } = require('../models');
const { Op } = require('sequelize');

// List/Search/Filter employees
exports.list = async (req, res) => {
  const { search = '', status, page = 1, limit = 10 } = req.query;
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { email: { [Op.iLike]: `%${search}%` } },
      { branch: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (status === 'true') where.isActive = true;
  if (status === 'false') where.isActive = false;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { rows, count } = await Employee.findAndCountAll({
    where,
    offset,
    limit: parseInt(limit),
    order: [['id', 'ASC']]
  });

  res.json({
    employees: rows,
    totalCount: count
  });
};
// Create employee
exports.create = async (req, res) => {
  try {
    const { name, email, branch, isActive } = req.body;
    if (!name || !email || !branch) return res.status(400).json({ error: "All fields required" });
    // You may want to add unique email check here
    const newEmp = await Employee.create({ name, email, branch, isActive: !!isActive });
    res.status(201).json({ employee: newEmp });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error creating employee' });
  }
};

// Edit (Update) Employee
exports.update = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: "Not found" });
    const { name, email, branch, isActive } = req.body;
    if (!name || !email || !branch) return res.status(400).json({ error: "All fields required" });
    await emp.update({ name, email, branch, isActive: !!isActive });
    res.json({ employee: emp });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error updating employee' });
  }
};

// Get one employee (for edit form)
exports.getOne = async (req, res) => {
  try {
    const emp = await Employee.findByPk(req.params.id);
    if (!emp) return res.status(404).json({ error: "Not found" });
    res.json({ employee: emp });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Error fetching employee' });
  }
};
// Delete employee
exports.remove = async (req, res) => {
  const employee = await Employee.findByPk(req.params.id);
  if (!employee) return res.status(404).json({ error: 'Not found' });
  await employee.destroy();
  res.json({ success: true });
};