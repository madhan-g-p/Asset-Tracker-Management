module.exports = (sequelize, DataTypes) => {
  const Asset = sequelize.define('Asset', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    serialNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    make: { type: DataTypes.STRING },
    model: { type: DataTypes.STRING },
    value: { type: DataTypes.FLOAT, defaultValue: 0 },
    status: { type: DataTypes.STRING, defaultValue: 'stock' }, // stock/issued/returned/scrapped
    categoryId: { type: DataTypes.INTEGER, allowNull: false },
    employeeId: { type: DataTypes.INTEGER, allowNull: true } // NEW: For current holder
  });
  Asset.associate = models => {
    Asset.belongsTo(models.Category, { foreignKey: 'categoryId' });
    Asset.belongsTo(models.Employee, { foreignKey: 'employeeId' }); // NEW: direct association
  };
  return Asset;
};