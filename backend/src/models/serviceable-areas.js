"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class ServiceableArea extends Model {
    static associate(models) {}
  }

  ServiceableArea.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        comment: "Name of the area or city",
      },
      coordinates: {
        type: DataTypes.GEOMETRY("POLYGON"),
        allowNull: false,
        comment: "Polygon representing the serviceable area",
      },
    },
    {
      sequelize,
      modelName: "ServiceableArea",
      tableName: "serviceable_areas",
      timestamps: true,
      underscored: true,
    }
  );

  return ServiceableArea;
};
