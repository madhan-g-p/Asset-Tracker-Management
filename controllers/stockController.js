const { Asset, Category,sequelize } = require('../models');
const { Op } = require('sequelize');

exports.list_deprecated = async (req, res) => {
  // Assuming 'branch' is a field in Asset (else, join Employee to get branch)
  const assets = await Asset.findAll({
    where: { status: 'stock' },
    include: [Category],
    order: [['branch', 'ASC']],
  });

  // Group by branch and calculate totals
  const grouped = {};
  let totalValue = 0;
  assets.forEach(asset => {
    const branch = asset.branch || 'Unknown';
    if (!grouped[branch]) grouped[branch] = { assets: [], total: 0 };
    grouped[branch].assets.push(asset);
    grouped[branch].total += asset.value || 0;
    totalValue += asset.value || 0;
  });

  res.render('stock/list', { grouped, totalValue });
};

exports.birdsEyeSummary = async (req, res) => {
  try {
    // Aggregate per-category summary (joins category name)
    const summary = await Asset.findAll({
      attributes: [
        [sequelize.col('Category.name'), 'categoryName'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 'stock' THEN 1 ELSE 0 END`)), 'inStock'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 'returned' THEN 1 ELSE 0 END`)), 'returned'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 'issued' THEN 1 ELSE 0 END`)), 'issued'],
        [sequelize.fn('SUM', sequelize.literal(`CASE WHEN status = 'scrapped' THEN 1 ELSE 0 END`)), 'scrapped'],
        [sequelize.fn('SUM', sequelize.col('value')), 'totalValue']
      ],
      include: [{ model: Category, attributes: [] }],
      group: ['Category.name'],
      raw: true
    });

    // Format as numbers and nice keys
    const assetSummaryList = summary.map(r => ({
      category: r.categoryName,
      inStock: Number(r.inStock),
      returned: Number(r.returned),
      issued: Number(r.issued),
      scrapped: Number(r.scrapped),
      totalValue: Number(r.totalValue)
    }));

    // Calculate grand total over all categories
    const grandTotal = assetSummaryList.reduce((acc, cur) => ({
      inStock: acc.inStock + cur.inStock,
      issued: acc.issued + cur.issued,
      returned: acc.returned + cur.returned,
      scrapped: acc.scrapped + cur.scrapped,
      totalValue: acc.totalValue + cur.totalValue
    }), { inStock: 0, issued: 0, scrapped: 0,returned:0, totalValue: 0 });

    // Respond as JSON for DataTables (or any frontend)
    res.render('stock/list', { assetSummaryList, grandTotal,error:"" });
  } catch (err) {
    console.error('Error in birdseye-summary API:', err);
    res.render("stock/list",{error:err.message || "Error fetching summary"})
  }
}