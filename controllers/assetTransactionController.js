const { Asset, Employee, AssetTransaction, Category,sequelize } = require('../models');
const {Op} = require("sequelize");

async function getIssueFormData() {
  const availableAssets = await Asset.findAll({
    where: { status: 'stock' },
    order: [['serialNumber', 'ASC']]
  });
  const activeEmployees = await Employee.findAll({
    where: { isActive: true },
    order: [['name', 'ASC']]
  });
  return { availableAssets, activeEmployees };
}

// Utility to get employees with issued assets
async function getEmployeesWithIssuedAssets(){
  return Employee.findAll({
    include: [{
      model: Asset,
      where: { status: 'issued' },
      required: true
    }],
    order: [['name', 'ASC']]
  });
}

// Utility: Assets issued to a specific employee
async function getAssetsIssuedToEmployee(employeeId) {
  return Asset.findAll({
    where: { status: 'issued', employeeId },
    order: [['serialNumber', 'ASC']]
  });
}

exports.issueFormPage =  async (req, res) => {
  try {
    const { availableAssets, activeEmployees } = await getIssueFormData();
    res.render('asset/issue', { availableAssets, activeEmployees, error: null, success: null });
  } catch (err) {
    res.render('asset/issue', { availableAssets: [], activeEmployees: [], error: err.message || 'Failed to load data', success: null });
  }
}

exports.issueFormAPI = async (req, res) => {
  const { employeeId, assetIds, date } = req.body;
  if (!employeeId || !assetIds || !date) {
    const { availableAssets } = await getIssueFormData();
    return res.json({ success: false, message: 'All fields required.', availableAssets });
  }
  const assetIdArr = Array.isArray(assetIds) ? assetIds : [assetIds];
  const t = await sequelize.transaction();
  try {
    for (const assetId of assetIdArr) {
      await Asset.update(
        { status: 'issued', employeeId },
        { where: { id: assetId, status: 'stock' }, transaction: t }
      );
      await AssetTransaction.create(
        { assetId, employeeId, type: 'issue', date },
        { transaction: t }
      );
    }
    await t.commit();
    const { availableAssets } = await getIssueFormData();
    return res.json({ success: true, message: 'Asset(s) issued successfully!', availableAssets });
  } catch (err) {
    if (t.finished !== 'commit') await t.rollback();
    const { availableAssets } = await getIssueFormData();
    return res.json({ success: false, message: err.message || 'Failed to issue asset(s).', availableAssets });
  }
};

// GET /assettransactions/return
exports.returnFormPage = async (req, res) => {
  try {
    const employeesWithAssets = await getEmployeesWithIssuedAssets();
    res.render('asset/return', { employeesWithAssets, error: null, success: null });
  } catch (err) {
    res.render('asset/return', { employeesWithAssets: [], error: err.message || 'Failed to load employee list.', success: null });
  }
};

// GET /assettransactions/api/issued-assets/:employeeId
exports.issuedAssetsList = async (req, res) => {
  const assets = await getAssetsIssuedToEmployee(req.params.employeeId);
  res.json(assets.map(a => ({
    id: a.id,
    serialNumber: a.serialNumber,
    make: a.make,
    model: a.model
  })));
};

// POST /assettransactions/api/return
exports.returnFormAPI = async (req, res) => {
  const { employeeId, assetIds, reasonSelect, reasonOther, date } = req.body;
  const reason = reasonSelect === 'other' ? reasonOther : reasonSelect;
  // assetIds can be string (single) or array (multi)
  const assetIdArr = Array.isArray(assetIds) ? assetIds : [assetIds].filter(Boolean);

  if (!employeeId || !assetIdArr.length || !reason || !date) {
    const employeesWithAssets = await getEmployeesWithIssuedAssets();
    return res.json({ success: false, message: 'All fields required.', employeesWithAssets });
  }

  // Validate all assets: return date > issue date for each asset
  for (const assetId of assetIdArr) {
    const issueTx = await AssetTransaction.findOne({
      where: { assetId, employeeId, type: 'issue' },
      order: [['date', 'DESC']]
    });
    if (!issueTx) {
      const employeesWithAssets = await getEmployeesWithIssuedAssets();
      return res.json({ success: false, message: `No issue record found for asset ${assetId} and employee.`, employeesWithAssets });
    }
    if (new Date(date) <= new Date(issueTx.date)) {
      const employeesWithAssets = await getEmployeesWithIssuedAssets();
      return res.json({
        success: false,
        message: `Return date (${date}) must be after the issue date (${issueTx.date.toISOString().slice(0,10)}) for asset ${assetId}.`,
        employeesWithAssets
      });
    }
  }

  const t = await sequelize.transaction();
  try {
    for (const assetId of assetIdArr) {
      await Asset.update(
        { status: 'returned', employeeId: null },
        { where: { id: assetId, status: 'issued', employeeId }, transaction: t }
      );
      await AssetTransaction.create(
        { assetId, employeeId, type: 'return', reason, date },
        { transaction: t }
      );
    }
    await t.commit();
    // Refetch fresh employeeWithAssets for dropdowns
    const employeesWithAssets = await getEmployeesWithIssuedAssets();
    return res.json({ success: true, message: 'Asset(s) returned successfully!', employeesWithAssets });
  } catch (err) {
    if (t.finished !== 'commit') await t.rollback();
    const employeesWithAssets = await getEmployeesWithIssuedAssets();
    return res.json({ success: false, message: err.message || 'Failed to return asset(s).', employeesWithAssets });
  }
};


// Utility: Get all assets NOT scrapped
async function getAvailableAssetsForScrap() {
  return Asset.findAll({
    where: { status: { [Op.notIn]: ['scrapped','issued'] } },
    order: [['serialNumber', 'ASC']]
  });
}

// GET /assettransactions/scrap
exports.scrapFormPage = async (req, res) => {
  try {
    const availableAssets = await getAvailableAssetsForScrap();
    res.render('asset/scrap', { availableAssets, error: null, success: null });
  } catch (err) {
    res.render('asset/scrap', { availableAssets: [], error: err.message || 'Failed to load assets.', success: null });
  }
};

// POST /assettransactions/api/scrap
exports.scrapFormAPI = async (req, res) => {
  const { assetIds, reason, date } = req.body;
  const assetIdArr = Array.isArray(assetIds) ? assetIds : [assetIds].filter(Boolean);

  if (!assetIdArr.length || !reason || !date) {
    const availableAssets = await getAvailableAssetsForScrap();
    return res.json({ success: false, message: 'All fields required.', availableAssets });
  }

  const t = await sequelize.transaction();
  try {
    for (const assetId of assetIdArr) {
      await Asset.update(
        { status: 'scrapped', employeeId: null },
        { where: { id: assetId, status: { [Op.notIn]: ['scrapped','issued'] } }, transaction: t }
      );
      await AssetTransaction.create(
        { assetId, type: 'scrap', reason, date },
        { transaction: t }
      );
    }
    await t.commit();
    const availableAssets = await getAvailableAssetsForScrap();
    return res.json({ success: true, message: 'Asset(s) scrapped successfully!', availableAssets });
  } catch (err) {
    if (t.finished !== 'commit') await t.rollback();
    const availableAssets = await getAvailableAssetsForScrap();
    return res.json({ success: false, message: err.message || 'Failed to scrap asset(s).', availableAssets });
  }
};


// Page route: renders Jade with asset & transaction history
exports.assetHistoryPage = async (req, res) => {
  const assetId = req.params.assetId;
  try {
    const asset = await Asset.findOne({
      where: { id: assetId },
      include: [{ model: Category }]
    });
    if (!asset) {
      return res.status(404).render('404', { message: 'Asset not found' });
    }

    const history = await AssetTransaction.findAll({
      where: { assetId },
      include: [{ model: Employee }],
      order: [['date', 'ASC'], ['id', 'ASC']]
    });

    res.render('asset/history', { asset, history });
  } catch (err) {
    res.status(500).render('500', { message: 'Failed to load asset history: ' + err.message });
  }
};

// API route: returns JSON (optional, for SPA/AJAX)
exports.assetHistoryAPI = async (req, res) => {
  const assetId = req.params.assetId;
  try {
    const asset = await Asset.findOne({
      where: { id: assetId },
      include: [{ model: Category }]
    });
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const history = await AssetTransaction.findAll({
      where: { assetId },
      include: [{ model: Employee }],
      order: [['date', 'ASC'], ['id', 'ASC']]
    });

    res.json({
      asset: {
        id: asset.id,
        serialNumber: asset.serialNumber,
        make: asset.make,
        model: asset.model,
        value: asset.value,
        status: asset.status,
        category: asset.Category ? asset.Category.name : null
      },
      history: history.map(tx => ({
        id: tx.id,
        type: tx.type,
        date: tx.date,
        reason: tx.reason,
        employee: tx.Employee ? { id: tx.Employee.id, name: tx.Employee.name, email: tx.Employee.email } : null
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to load asset history' });
  }
};