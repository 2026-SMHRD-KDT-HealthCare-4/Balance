// models/AiReport.js
const { DataTypes } = require('sequelize')

module.exports = (sequelize) => {
  const AiReport = sequelize.define('AiReport', {
    report_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    // [수정] 특정 시점(posture_id)이 아닌 '기간' 분석일 경우를 위해 allowNull: true 허용
    posture_id: {
      type: DataTypes.INTEGER,
      allowNull: true 
    },
    report_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    prescription_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // --- 여기서부터 추가된 6개 컬럼 ---
    balance_shoulder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '어깨 수평 점수 (0-100)'
    },
    balance_neck: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '목 각도 점수 (0-100)'
    },
    balance_head: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '머리 중심 점수 (0-100)'
    },
    compliance_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '스트레칭 수행률 점수 (0-100)'
    },
    accuracy_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      comment: '자세 정확도 점수 (0-100)'
    },
    report_type: {
      type: DataTypes.ENUM('daily', 'weekly'),
      defaultValue: 'daily',
      comment: '리포트 분석 단위'
    },
    // ------------------------------
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'ai_reports',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false
  })

  AiReport.associate = (models) => {
    AiReport.belongsTo(models.User, { foreignKey: 'user_id' })
    AiReport.belongsTo(models.PostureData, { foreignKey: 'posture_id' })
  }

  return AiReport
}
