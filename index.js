var express = require("express");
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server); // the server that socket listen to

server.listen(3000);

var usersInRoom = [];
var room;

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
        io.in(data.room).emit('user-entered', newUser);
        io.in(data.room).emit('connected users', usersInRoom);
        room = data.room;
    });

    socket.on('disconnect', function() {
        console.log("user left ", socket.id);
        for (var index = 0; index < usersInRoom.length; index++) {
            var user = usersInRoom[index];
            if(user.id == socket.id){
                io.in(room).emit('user-left', user.id);
                usersInRoom.splice(index, 1);
                break;
            }       
        }
    });
   
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

});