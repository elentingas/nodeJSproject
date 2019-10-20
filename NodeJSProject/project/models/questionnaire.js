module.exports = function(sequelize, DataTypes) {
  let Questionnaire = sequelize.define("questionnaire", {
    name: { type: DataTypes.STRING, allowNull: false },
    work_life_balance_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    salary_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    senior_management_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    self_development_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    organization_development_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1, max: 5 }
    },
    summary: { type: DataTypes.TEXT, allowNull: true }
  });

  Questionnaire.associate = function(models) {
    Questionnaire.hasMany(models.onetimetoken, {
      as: "Questionnaire",
      foreignKey: "questionnaire_id",
      onDelete: "cascade"
    });
  };

  return Questionnaire;
};
