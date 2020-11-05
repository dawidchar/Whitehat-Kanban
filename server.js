const express = require('express')
const Handlebars = require('handlebars')
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const { Board, User, Task, UserToken, UserPassword, sequelize } = require('./server/models/models.js');
const { allowInsecurePrototypeAccess } = require('@handlebars/allow-prototype-access');
const { request } = require('express');
const crypto = require('crypto')


const app = express()


const handlebars = expressHandlebars({
    handlebars: allowInsecurePrototypeAccess(Handlebars)
})

app.use(express.static('public'))
app.engine('handlebars', handlebars)
app.set('view engine', 'handlebars')
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
}));


const server = require('http').createServer(app);
const io = require('socket.io').listen(server);


app.use(async function (req, res, next) {
    console.log(req.path, req.method, req.params)
    if (req.url == '/') {
        if (req.cookies.userid && req.cookies.userToken && await verifyToken(req.cookies.userid, req.cookies.userToken)) {
            return res.redirect("/myboards")
        } else {
            return next()
        }
    }
    if (req.path.match("\/api\/users\/[a-z0-9_]*\/exists$") && req.method == "GET") return next()
    if (req.path.match("\/api\/users$") && req.method == "POST") return next()
    if (req.path.match("\/api\/users$") && req.method == "GET") return next()
    if (req.path.match("\/api\/users\/[a-z0-9_]*\/login$") && req.method == "POST") return next()

    if (!req.cookies.userid || !req.cookies.userToken) return res.redirect("/")
    if (!await verifyToken(req.cookies.userid, req.cookies.userToken)) { res.clearCookie('userid'); res.clearCookie('userToken'); return res.redirect("/") }

    next()
})


async function createUserToken(user, DBnew) {
    const newToken = { token: crypto.randomBytes(32).toString('hex'), expiry: new Date(Date.now() + 3600000 * 24 * 2) }
    if (DBnew) {
        accessToken = await UserToken.create(newToken)
        user.setUserToken(accessToken)
    } else {
        await UserToken.update(newToken, { where: { id: user.UserTokenId } })
    }
    return newToken
}

function setUserTokenCookies(res, user, accesstoken) {
    res.cookie('userid', user.id, { maxAge: 3600000 * 24 * 2 })
    res.cookie('userToken', accesstoken.token, { expiry: accesstoken.expiry })
    res.cookie('user-name', user.name)
    res.cookie('username', user.username)
    return true
}

async function verifyToken(userid, token) {
    const user = await User.findByPk(userid)
    if (!user) return false
    const userToken = await user.getUserToken()
    return ((userToken.token == token) && (userToken.expiry > Date.now()))
}


function protectUser(req, res, next) {
    if (req.params.userid) {
        if (req.params.userid != req.cookies.userid) {
            return res.send(false)
        }
    }
    next()
}

async function protectBoard(req, res, next) {
    if (req.params.id && req.method == 'POST') {
        const board = await Board.findOne({
            where: { id: req.params.id },
            include: { model: User, as: "users" }
        });
        if (!board.users.find(el => el.id == req.cookies.userid)) return res.send(false)
    }
    next()
}

async function protectTask(req, res, next) {
    if (req.params.taskid && req.method == 'POST') {
        const task = await Task.findByPk(req.params.taskid)
        const board = await task.getBoard({ include: { model: User, as: "users" } })
        if (!board.users.find(el => el.id == req.cookies.userid)) return res.send(false)
    }
    next()
}


app.get('/', (req, res) => { //Login Page
    res.render('login', { layout: 'home' })
})

app.get('/profile', (req, res) => { //All Boards Page
    res.render('profile')
})

app.get('/boards', (req, res) => { //All Boards Page
    res.render('boards')
})

app.get('/myboards', (req, res) => { //Boards You are part of Page
    res.render('myboards')
})


app.get('/board/:id', (req, res) => { // Specific Board Page
    res.render('board')
})


///////////// REST /////////////

////Users

app.get('/api/users', async (req, res) => { //Get All Users
    const users = await User.findAll()
    res.send(users)
})

app.post('/api/users', protectUser, async (req, res) => { // Create New User (Must have username and must be unique)
    if (!req.body.username) {
        return res.send({ error: 'A Username must be provided' })
    }
    if (!req.body.passcode) {
        return res.send({ error: 'A Passcode must be provided' })
    }
    if (await User.findOne({ where: { username: req.body.username } })) {
        return res.send({ error: 'Username Taken' })
    }
    let user = {}
    try {
        user = await User.create(req.body)
        passobj = await UserPassword.create({ password: req.body.passcode })
        user.setUserPassword(passobj)
        const newToken = await createUserToken(user, true)
        setUserTokenCookies(res, user, newToken)
    } catch (error) {
        console.log('Create User Error', error)
        res.send({ error: error })
    }
    res.send(user)
})


app.get('/api/users/:userid', async (req, res) => { //Get User with ID
    const user = await User.findByPk(req.params.userid)
    res.send(user)
})


app.post('/api/users/:username/login', protectUser, async (req, res) => { //Login a User with username
    const user = await User.findOne({ where: { username: req.params.username } })
    if (!req.body.pass) {
        return res.json({ message: 'Passcode Not Provided' })
    }
    if (!user) {
        return res.json({ message: 'User Does Not Exist' })
    }
    const user_password = await user.getUserPassword()
    if (user_password.password === req.body.pass) {
        const newToken = await createUserToken(user)
        setUserTokenCookies(res, user, newToken)
        return res.json({ success: true })
    } else {
        return res.json({ message: 'Inncorrect Passcode' })
    }
})

app.get('/api/users/:username/exists', async (req, res) => { //Get User with ID
    const user = await User.findOne({ where: { username: req.params.username } })
    if (user) {
        res.json(user)
    } else {
        res.json(false)
    }
})

app.get('/api/users/:userid/boards', async (req, res) => { //Get the Boards of the User with ID
    const user = await User.findOne({
        where: {
            id: req.params.userid
        },
        include: { model: Board, as: "boards", include: { model: User, as: "users" } }
    })
    try {
        res.send(user.boards);
    } catch (error) {
        res.send({})
    }
})

app.post('/api/users/:userid', protectUser, async (req, res) => { // Update User with that ID
    if (req.body.name) {
        await User.update({ name: req.body.name }, {
            where: { id: req.params.userid }
        })
        res.send(true)
    }
    if (req.body.avatar) {
        await User.update({ avatar: req.body.avatar }, {
            where: { id: req.params.userid }
        })
        res.send(true)
    }
    if (req.body.username) {
        if (await User.findOne({ where: { username: req.body.username } })) {
            res.send({ error: 'Username Taken' })
        } else {
            await User.update({ avatar: req.body.username }, {
                where: { id: req.params.userid }
            })
            res.send(true)
        }
    }
})

app.post('/api/users/:userid/delete', protectUser, async (req, res) => { // Delete User With That ID
    await User.destroy({
        where: { id: req.params.userid }
    })
    res.send(true)
})

////Boards

app.get('/api/boards', async (req, res) => { //Get All Boards
    let boards = await Board.findAll({
        include: { model: User, as: "users" }
    });
    res.send(boards)
})

app.post('/api/boards', protectBoard, async (req, res) => { //Create New Board
    if (req.body.title && req.body.userid && req.body.image && req.body.desc) {
        const user = await User.findOne({
            where: { id: req.body.userid }
        });
        const board = await Board.create({ title: req.body.title, image: req.body.image, desc: req.body.desc })
        await user.addBoard(board);
        res.send(true);
    } else {
        res.send(false);
    }
})


app.get('/api/board/:id', async (req, res) => { //Get Board With ID
    let board = await Board.findOne({
        where: { id: req.params.id },
        include: { model: User, as: "users" }
    });
    res.send(board)
})

app.post('/api/board/:id', protectBoard, async (req, res) => { //Update Board with that ID
    let result = false;
    if (req.body.title) {
        await Board.update({ title: req.body.title }, {
            where: { id: req.params.id }
        })
        result = true;
    }
    if (req.body.image) {
        await Board.update({ image: req.body.image }, {
            where: { id: req.params.id }
        })
        result = true
    }
    if (req.body.desc) {
        await Board.update({ desc: req.body.desc }, {
            where: { id: req.params.id }
        })
        result = true;
    }
    res.send(result)
})

app.post('/api/board/:id/adduser/:userid', protectBoard, async (req, res) => { //Update Board -- Add User
    let board = await Board.findOne({
        where: { id: req.params.id }
    });
    let user = await User.findOne({
        where: { id: req.params.userid }
    });
    if (user && board) {
        board.addUser(user);
        res.send(true);
    } else {
        res.send(false)
    }
})

app.post('/api/board/:id/removeuser/:userid', protectBoard, async (req, res) => { //Update Board -- Remove User
    let board = await Board.findOne({
        where: { id: req.params.id }
    });
    if (Object.keys(await board.getUsers()).length == 1) {
        res.send({ error: 'There has to be at least 1 Collabarator' })
        return
    }
    let user = await User.findOne({
        where: { id: req.params.userid }
    });
    if (user && board) {
        Task.update({ UserId: null }, {
            where: { BoardId: req.params.id, UserId: req.params.userid }
        })
        board.removeUser(user);
        res.send(true);
    } else {
        res.send(false)
    }
})

// app.post('/api/board/:id/title', async (req, res) => { //Update Title of Board with that ID
//     await Board.update({ title: req.body.title }, {
//         where: { id: req.params.id }
//     })
//     res.send(true)
// })

app.post('/api/board/:id/delete', protectBoard, async (req, res) => { //Delete Board With that ID
    await Board.destroy({
        where: { id: req.params.id }
    });
    res.send(true)
})

//// Tasks

app.get('/api/board/:id/tasks', async (req, res) => { // Get Tasks From the Board With that Board ID
    let board = await Board.findOne({
        where: { id: req.params.id }
    });
    let tasks = await board.getTasks({ include: { model: User } });
    res.send(tasks);
})

app.post('/api/board/:id/tasks', protectTask, async (req, res) => {// Create a New Task For the Board with that Board ID
    const task = await Task.create({ name: req.body.name, state: 0 })
    let id = req.params.id;
    let board = await Board.findOne({
        where: { id: id }
    });
    if (board) {
        board.addTask(task)
        if (req.body.userid) {
            let user = await User.findOne({
                where: { id: req.body.userid }
            });
            if (user) {
                user.addTask(task)
            }
        }
        res.send(true)
    } else {
        res.send(false)
    }
})

//(Each task has a unique ID regardless of their board so we can just refrence it)

app.get('/api/task/:taskid', async (req, res) => { // Get A Single Task 
    let task = await Task.findOne({
        where: { id: req.params.taskid },
        include: { model: User }
    });
    res.send(task)
})

app.post('/api/task/:taskid', protectTask, async (req, res) => {// Update a Specific Task with that Task ID
    let result = false;
    if (req.body.name) {
        await Task.update({ name: req.body.name }, {
            where: { id: req.params.taskid }
        })
        result = true;
    }
    if (req.body.state || req.body.state == 0) {
        await Task.update({ state: req.body.state }, {
            where: { id: req.params.taskid }
        })
        result = true;
    }
    res.send(result)
})

app.post('/api/task/:taskid/assign/:userid', protectTask, async (req, res) => {// Update the assigned User of Specific Task with that Task ID
    const task = await Task.findByPk(req.params.taskid)
    let user = await User.findOne({
        where: { id: req.params.userid }
    });
    if (user && task) {
        await task.setUser(user)
        res.send(true)
    } else {
        res.send(false)
    }
})

app.post('/api/task/:taskid/unassign', protectTask, async (req, res) => {// Update the task to unassign an user from it
    const task = await Task.findByPk(req.params.taskid)
    if (task) {
        const user = await task.getUser()
        if (user) {
            await user.removeTask(task)
            res.send(true)
        } else {
            res.send(false)
        }
    } else {
        res.send(false)
    }
})

app.post('/api/task/:taskid/delete', protectTask, async (req, res) => { // Delete Task With that Task ID
    await Task.destroy({
        where: { id: req.params.taskid }
    });
    res.send()
})


io.on('connection', (socket) => {
    let user_data

    socket.on('update-tasks', () => {
        socket.broadcast.emit('update-tasks')
    })

    socket.on('update-tasks', (id) => {
        socket.broadcast.emit('update-tasks', id)
    })

    socket.on('update-board', (id) => {
        socket.broadcast.emit('update-board', id)
        socket.broadcast.emit('update-boards')
    })

    socket.on('update-boards', () => {
        socket.broadcast.emit('update-boards')
    })


    socket.on('update-board-user-join', (userdata) => {
        user_data = userdata
        socket.broadcast.emit('update-board-user-join', userdata)
    })

    socket.on('disconnect', () => {
        socket.broadcast.emit('update-board-user-leave', user_data)
    });
});

server.listen(process.env.PORT, () => {
    sequelize.sync();
    console.log('web server running on port 3000')
})
