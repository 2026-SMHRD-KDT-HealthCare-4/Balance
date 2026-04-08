// models/StretchingLog.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const StretchingLog = sequelize.define('StretchingLog', {
    stretching_id: {
      type: DataTypes.INTEGER(100),
      primaryKey: true,
      autoIncrement: true
    },
    session_id: {
      type: DataTypes.INTEGER(100),
      allowNull: false
    },
    target_part: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    alarm_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'stretching_logs_table',
    timestamps: false
  })

  StretchingLog.associate = (models) => {
    StretchingLog.belongsTo(models.Session, {
      foreignKey: 'session_id'
    })
  }

  return StretchingLog
}