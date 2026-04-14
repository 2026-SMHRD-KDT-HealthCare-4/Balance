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
      allowNull: true,
      references: {
      model: 'user_table', // 실제 유저 테이블명
      key: 'user_id'
    },
    onDelete: 'SET NULL', // 유저가 삭제되면 이 필드를 NULL로 만듦
    onUpdate: 'CASCADE'
    },
    temp_uuid: {
      type: DataTypes.STRING(100),
      allowNull: true // 비회원일 때만 사용함
    },
    start_time: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    end_time: {
      type: DataTypes.DATE,
      allowNull: true
    },
  }, {
    tableName: 'sessions_table',
    timestamps: false
  })

  Session.associate = (models) => {
    Session.belongsTo(models.User, {
      foreignKey: 'user_id',
      constraints: false
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