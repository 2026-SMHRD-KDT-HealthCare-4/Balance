// models/User.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true
    },
    login_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    // 🌟 나이 컬럼 추가 (회원가입 시 입력받은 값 저장)
    age: {
      type: DataTypes.INTEGER(3),
      allowNull: false,
      defaultValue: 25 // 기본값을 설정해두면 에러 방지에 도움이 됩니다.
    },
    provider: {
      type: DataTypes.STRING(10),
      allowNull: false,
      defaultValue: 'local'
    },
    provider_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    base_shoulder_width: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    base_neck_dist: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    base_shoulder_diff: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_table',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  })

  User.associate = (models) => {
    User.hasMany(models.Session, { foreignKey: 'user_id' })
  }

  return User
}