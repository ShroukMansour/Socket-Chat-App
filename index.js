var express = require("express");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server); // the server that socket listen to

var usersInRoom = [];

server.listen(3000);

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get(/(^\/[a-zA-Z0-9]+$)/, function (req, res) {
    res.sendFile(__dirname + '/chat.html');
});

app.use(express.static("./public")); // third party moddle ware


io.on('connection', function(socket){ // socket is a client joined

    console.log('a user connected with id %s', socket.id);

    socket.on('join', function (data) {
        var newUser = new Object();
        newUser.id = socket.id;
        newUser.name = data.username;
        usersInRoom.push(newUser);
        console.log(newUser.name);
        socket.join(data.room);
        console.log(socket.id, "joined", data.room);   
        io.in(data.room).emit('connected users', usersInRoom);
    });

    socket.on('disconnect', () => console.log("user left"));
   
    socket.on('chat message', function (data) {
        io.to(data.room).emit("chat message", data);
    });

    socket.on('typing', function (data) {
        io.to(data.room).emit("typing", data)
    });
     
    socket.on('leave', function (room) {
        socket.leave(room);
        console.log(socket.id, "left", room);
    });

//     socket.on('disconnect', function() {
//         delete usersInRoom[socket.id];
//         socket.to(data.room).emit("connected users", usersInRoom);
//   });

});