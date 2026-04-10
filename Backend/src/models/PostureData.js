// models/PostureData.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const PostureData = sequelize.define('PostureData', {
    posture_id: {
      type: DataTypes.INTEGER(100),
      primaryKey: true,
      autoIncrement: true
    },
    session_id: {
      type: DataTypes.INTEGER(100),
      allowNull: false
    },
    neck_angle: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    shoulder_angle: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    posture_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 100
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    alarm_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    posture_measurement_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'posture_data_table',
    timestamps: false
  })

  PostureData.associate = (models) => {
    PostureData.belongsTo(models.Session, {
      foreignKey: 'session_id'
    })
  }

  return PostureData
}