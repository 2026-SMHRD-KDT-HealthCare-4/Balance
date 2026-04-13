// models/User.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    user_id: {
      type: DataTypes.INTEGER(10),
      primaryKey: true,
      autoIncrement: true
    },
    // 1. 여기에 진짜 아이디를 담을 login_id를 추가합니다.
    login_id: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    name: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    // 2. email은 이제 '진짜 이메일 주소'만 담는 용도로 둡니다.
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: true
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
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'user_table',
    timestamps: false,
    createdAt: 'created_at', // 실제 컬럼명 명시
    updatedAt: false
  })

  User.associate = (models) => {
    User.hasMany(models.Session, { foreignKey: 'user_id' })
  }

  return User
}
// 주석용