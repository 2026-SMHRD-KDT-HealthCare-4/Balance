// models/index.js — 모든 모델을 한 곳에서 불러오고 associate 연결
const sequelize = require('../config/database')

const User = require('./User')(sequelize)
const Session = require('./Session')(sequelize)
const PostureData = require('./PostureData')(sequelize)
const StretchingLog = require('./StretchingLog')(sequelize)

const models = { User, Session, PostureData, StretchingLog }

// association 연결
Object.values(models).forEach(model => {
  if (model.associate) model.associate(models)
})

module.exports = { sequelize, ...models }