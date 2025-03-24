module.exports = (sequelize, DataTypes) => {
  const Store = sequelize.define("Store", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    ownerId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" } }
  });
  return Store;
};
