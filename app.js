var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var ent = require('ent');

var todolist = [];
var last_id = 0;

app.use('/node_modules', express.static(__dirname + '/node_modules'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function (req, res) {
    res.sendFile(__dirname + '/style.css');
});

io.on('connection', function (socket) {
    // On envoit à l'utilisateur se connectant pour la première fois la liste actuelle
    socket.on('init', function () {
        socket.emit('init', todolist);
    });

    // Un utilisateur veut ajouter une tâche
    socket.on('add', function (message) {
        var task = {id: last_id++, text: ent.encode(message)};
        todolist.push(task);

        socket.broadcast.emit('add', task); // On renvoit à tout le monde
        socket.emit('add', task); // On envoit aussi à l'auteur (pour le système d'ID interne)
    });

    // Un utilisateur supprime une tache
    socket.on('delete', function (id) {
        todolist.forEach(function(item, index) {
            if(item.id == id) {
                todolist.splice(index, 1);
            }
        });

        socket.broadcast.emit('delete', id);
    });
});

server.listen(8080);