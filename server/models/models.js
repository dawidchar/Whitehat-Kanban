const { Sequelize, Model, DataTypes } = require('sequelize');
const path = require('path')
// const sequelize = process.env.NODE_ENV === 'test'
//     ? new Sequelize('sqlite::memory:', null, null, { dialect: 'sqlite', logging: false })
//     : new Sequelize({ dialect: 'sqlite', storage: path.join(__dirname, '../database.sqlite'), logging: false })


const connectionSettings = {
    test: { dialect: 'sqlite', storage: 'sqlite::memory:' },
    dev: { dialect: 'sqlite', storage: path.join(__dirname, '../database.sqlite'), logging: false },
    production: { dialect: 'postgres', protocal: 'postgres' }
}
const sequelize = process.env.NODE_ENV === 'production'
    ? new Sequelize(process.env.DATABASE_URL, connectionSettings[process.env.NODE_ENV])
    : new Sequelize(connectionSettings[process.env.NODE_ENV])


class Board extends Model { }
Board.init({
    title: DataTypes.STRING,
    image: DataTypes.STRING,
    desc: DataTypes.STRING
}, { sequelize })

class User extends Model { }
User.init({
    username: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
    },
    passcode: DataTypes.STRING,
    name: DataTypes.STRING,
    avatar: DataTypes.STRING
}, { sequelize })

class UserPassword extends Model { }
UserPassword.init({
    password: DataTypes.STRING
}, { sequelize })

class UserToken extends Model { }
UserToken.init({
    token: DataTypes.STRING,
    expiry: DataTypes.DATE
}, { sequelize })

class Task extends Model { }
Task.init({
    name: DataTypes.STRING,
    state: DataTypes.INTEGER
}, { sequelize })

User.belongsToMany(Board, { as: 'boards', through: 'User_Board' })
Board.belongsToMany(User, { as: 'users', through: 'User_Board' })

Board.hasMany(Task, { as: 'tasks' })
Task.belongsTo(Board)

User.hasMany(Task, { as: 'tasks' })
Task.belongsTo(User)

User.belongsTo(UserPassword)
User.belongsTo(UserToken)

module.exports = { Board, User, Task, UserPassword, UserToken, sequelize }
