const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const { Board, User, Task, sequelize } = require('./models/models');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access')


const app = express()

const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

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

app.post('/api/boards', async (request, response) => { //Create New Board
    if (request.body.bName) {
        let bName = request.body.bName;
        let userId = request.body.userid;
        const user = await User.findOne({
            where: { id: userId}
        });
        const board = await Board.create({title: bName})
        let handler = await user.addBoard(board);
        response.send(true);
    } else {
        response.send(false);
    }
    
})


app.get('/api/board/:id', async (request, response) => { //Get Board With ID
    if (request.params.id) {
        let id = request.params.id;
        let board = await Board.findOne({
            where: {id: id}
        });
        response.send(board)
    } else {
        response.send({});
    }
})

app.post('/api/board/:id', async (request, response) => { //Update Board with that ID
    if (request.params.id) {
        let id = request.params.id;
        let operation = request.body.operation;
        let userid = request.body.userid;
        let board = await Board.findOne({
            where: {id: id}
        });
        let user = await User.findOne({
            where: {id: userid}
        });
        switch (operation) {
            case 'adduser':
                board.addUser(user);
                response.send(true);
                break;
            case 'removeuser':
                board.removeUser(user);
                response.send(true)
                break;  
            default:
                response.send(false)
                break;
        }
    } else {
        response.send(false)
    }
})

app.post('/api/board/:id/name', async (request, response) => { //Update Name of Board with that ID
    if (request.params.id) {
        let id = request.params.id;
        let bName = request.body.bName;
        let board = await Board.update({ title: bName }, {
            where: {id: id}
        })
        response.send(true)
    } else {
        response.send(false)
    }
})

app.post('/api/board/:id/delete', async (request, response) => { //Delete Board With that ID
    if (request.params.id) {
        let id = request.params.id;
        await Board.destroy({
            where: { id: id }
        });
        response.send(true);
    } else {
        response.send(false);
    }
})

//// Tasks

app.get('/api/board/:id/tasks', async (request, response) => { // Get Tasks From the Board With that Board ID
    if (request.params.id) {
        let id = request.params.id;
        let board = await Board.findOne({
            where: { id: id }
        });
        let tasks = await board.getTasks();
        response.send(tasks);
    } else {
        response.send(false);
    }
})

app.post('/api/board/:id/tasks', async (request, response) => {// Create a New Task For the Board with that Board ID
    const task = await new Task(request.body)
    response.send(task)
})

//(Each task has a unique ID regardless of their board so we can just refrence it)

app.get('/api/task/:taskid', async (request, response) => { // Get A Single Task 
    if (request.params.taskid) {
        let id = request.params.taskid;
        let task = await Task.findOne({
            where: { id: id }
        });
        response.send(task)
    } else {
        response.send(false)
    }
})

app.post('/api/task/:taskid', async (request, response) => {// Update a Specific Task with that Task ID
    const task = await Task.findByPk(request.params.taskid)
    await task.update(request.body)
    response.send(task)
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