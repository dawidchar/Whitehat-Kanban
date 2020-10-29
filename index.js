const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const app = express()
const { Board, User, Task, sequelize } = require('models')

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true}))
app.use(express.json())

app.get('/', (request, response) => { //Login Page
    response.render('login', {date: new Date()})
})

app.get('/boards', async (request, response) => { //All Boards Page
    const boards = await Board.findAll({
        include: 'users',
        nest: true 
    })
    response.render('boards', {boards})
})

app.get('/:userid/myboards', async (request, response) => { //Boards You are part of Page
    const user = await User.findByPk(request.params.userid)
    const boards = await user.getBoards()
    response.render('myboards', {user, boards})
})


app.get('/board/:id', async (request, response) => { // Specific Board Page
    const board = await Board.findByPk(request.params.id)
    const tasks = await board.getTasks()
    const users = await board.getUsers()
    response.render('board', {board, tasks, users})
})


///////////// REST /////////////

////Users

app.get('/api/users', (request, response) => { //Get All Users
    const users = User.all
    response.send(users)
})

app.post('/api/users', (request, response) => { // Create New User
    User.all.push(request.body)
    response.send()
})

app.get('/api/users/:userid', async (request, response) => { //Get User with ID
    const user = await User.findByPk(request.params.userid)
    response.send(user)
})

app.get('/api/users/:userid/boards', async (request, response) => { //Get the Boards of the User with ID
    const user = await User.findByPk(request.params.userid)
    const boards = await user.getBoards()
    response.send(boards)
})

app.post('/api/users/:userid', async (request, response) => { // Update User with that ID
    const user = await User.findByPk(request.params.userid)
    await user.update(request.body)
    response.send(user)
})

app.post('/api/users/:userid/delete', (request, response) => { // Delete User With That ID
    const user = await User.findByPk(request.params.userid)
    await user.destroy()
    response.send()
})

////Boards

app.get('/api/boards', (request, response) => { //Get All Boards

})

app.post('/api/boards', (request, response) => { //Create New Board

})

app.get('/api/board/:id', (request, response) => { //Get Board With ID

})

app.post('/api/board/:id', (request, response) => { //Update Board with that ID

})

app.post('/api/board/:id/name', (request, response) => { //Update Name of Board with that ID

})

app.post('/api/board/:id/delete', (request, response) => { //Delete Board With that ID

})

//// Tasks

app.get('/api/board/:id/tasks', (request, response) => { // Get Tasks From the Board With that Board ID

})

app.post('/api/board/:id/tasks', (request, response) => {// Create a New Task For the Board with that Board ID

})

//(Each task has a unique ID regardless of their board so we can just refrence it)

app.get('/api/task/:taksid', (request, response) => { // Get A Single Task 

})

app.post('/api/task/:taksid', (request, response) => {// Update a Specific Task with that Task ID

})

app.post('/api/task/:taksid/description', (request, response) => {// Update the Description of Specific Task with that Task ID

})

app.post('/api/task/:taksid/assign', (request, response) => {// Update the assigned User of Specific Task with that Task ID

})

app.post('/api/task/:taksid/delete', (request, response) => { // Delete Task With that Task ID

})


app.listen(3000, () => console.log('web server running on port 3000'))