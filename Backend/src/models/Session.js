// models/Session.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const Session = sequelize.define('Session', {
    session_id: {
      type: DataTypes.INTEGER(100),
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
    upright_posture_photo: {
      // 정자세 기준 사진 경로
      type: DataTypes.STRING(100),
      allowNull: true
    },
    random_photo: {
      // 랜덤 측정 사진 경로
      type: DataTypes.STRING(100),
      allowNull: true
    }
  }, {
    tableName: 'sessions_table',
    timestamps: false
  })

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'user_id'
    })
    Session.hasMany(models.PostureData, {
      foreignKey: 'session_id'
    })
    Session.hasMany(models.StretchingLog, {
      foreignKey: 'session_id'
    })
  }

  return Session
}