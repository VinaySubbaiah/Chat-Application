//const mongodbclient = require('mongodb').MongoClient;
const mongoose = require('mongoose');
const io = require('socket.io').listen(5000).sockets;
mongoose.connect('mongodb://localhost:27017/node_demo', (err, db) => {
    if (err) {
        console.log("Error");
    }
    console.log("Connected..!!");
    io.on('connection', (socket) => {
        let chat = db.collection('chats');
        sendStatus = function(s) {
            socket.emit('status', s);
        }
        chat.find().limit(20).sort({ _id: 1 }).toArray((err, res) => {
            if (err) {
                console.log("error");
            }
            socket.emit('output', res);
        });
        socket.on('input', (data) => {
            let name = data.name;
            let msg = data.msg;
            if (name == '' || msg == '') {
                sendStatus('Enter name and message')
            } else {
                chat.insert({ name: name, msg: msg }, () => {
                    io.emit('output', [data]);
                    sendStatus({
                        msg: 'Message sent',
                        clear: true
                    });
                });
            }
        });
        socket.on('clear', (data) => {
            chat.remove({}, () => {
                socket.emit('cleared');
            });
        });
    });
});
