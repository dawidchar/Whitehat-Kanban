const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const { Board, User, Task, sequelize } = require('./models/models');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')
const app = express()

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

app.get('/', (request, response) => { //Login Page
    response.render('login', {date: new Date()})
})

app.get('/boards', (request, response) => { //All Boards Page
    
})

app.get('/myboards', (request, response) => { //Boards You are part of Page
    
})

app.get('/board/:id', (request, response) => { // Specific Board Page
    
})



///////////// REST /////////////

////Users

app.get('/api/users', (request, response) => { //Get All Users

})

app.post('/api/users', (request, response) => { // Create New User

})

app.get('/api/users/:userid', (request, response) => { //Get User with ID

})

app.get('/api/users/:userid/boards', (request, response) => { //Get the Boards of the User with ID

})

app.post('/api/users/:userid', (request, response) => { // Update User with that ID

})

app.post('/api/users/:userid/delete', (request, response) => { // Delete User With That ID

})

////Boards

app.get('/api/boards', async (request, response) => { //Get All Boards
    let boards = await Board.findAll();
    response.send(JSON.stringify(boards, null, 2))
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


app.listen(3000, () => {
    sequelize.sync();
    console.log('web server running on port 3000')
})