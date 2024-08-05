const express = require('express');
const app = express();
const http = require('http');
const socketIO = require('socket.io');
const server = http.createServer(app);
const path = require('path');
const io = socketIO(server);
const indexRouter = require('./routes/indexRouter');


const room = [];
const waitingUsers = [];

io.on('connect', (socket) => {
    console.log('connection established');

    if (waitingUsers.length > 0) {
        const partner = waitingUsers.shift();

        const roomname = `${partner.id}-${socket.id}`;
        socket.join(roomname);
        partner.join(roomname);
        io.to(roomname).emit("joined", roomname);

    } else {
        waitingUsers.push(socket);
    }
    socket.on("message", (data) => {
        socket.broadcast.to(data.room).emit("message", data.message);
    })
    socket.on("signalingMessage", (data) => {
        socket.broadcast.to(data.room).emit("signalingMessage", data.message);
    })
    socket.on("disconnect", () => {
        let index = waitingUsers.findIndex((waitingUsers) => waitingUsers.id == socket.id)
        waitingUsers.splice(index, 1);
        console.log('disconnect');
        io.emit("userout");
    })


})
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use("/", indexRouter);

server.listen(3000, () => {
    console.log('http://localhost:3000');
});