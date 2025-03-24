module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define("Rating", {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      userId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Users", key: "id" } },
      storeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Stores", key: "id" } },
      rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } }
    });
    return Rating;
  };
  