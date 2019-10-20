
module.exports = function(sequelize, DataTypes) {
  let Onetimetoken = sequelize.define('onetimetoken', {
      token: {type: DataTypes.STRING, allowNull:false}
  });

  Onetimetoken.associate = function(models) {

    Onetimetoken.belongsTo(models.questionnaire, {foreignKey: 'questionnaire_id', as: "Questionnaire", allowNull: false, onDelete: 'cascade'});

  };

  return Onetimetoken;
};