module.exports = (sequelize, DataTypes) => {
  const AssetTransaction = sequelize.define('AssetTransaction', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    assetId: { type: DataTypes.INTEGER, allowNull: false },
    employeeId: { type: DataTypes.INTEGER },
    type: { type: DataTypes.STRING, allowNull: false }, // issue, return, scrap
    reason: { type: DataTypes.STRING },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  });
  AssetTransaction.associate = models => {
    AssetTransaction.belongsTo(models.Asset, { foreignKey: 'assetId' });
    AssetTransaction.belongsTo(models.Employee, { foreignKey: 'employeeId' });
  };
  return AssetTransaction;
};