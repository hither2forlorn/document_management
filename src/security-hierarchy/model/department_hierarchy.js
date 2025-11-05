module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "department_hierarchy",
    {
      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true, // Part of composite primary key
        references: {
          model: "departments", // Table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      hierarchyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true, // Part of composite primary key
        references: {
          model: "security_hierarchies", // Table name
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("CURRENT_TIMESTAMP"),
      },
    },
    {
      tableName: "department_hierarchy",
      timestamps: true, // Enables createdAt and updatedAt
      freezeTableName: true, // Prevents automatic table name pluralization
    }
  );
};