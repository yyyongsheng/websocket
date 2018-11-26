var express = require('express')
var WebSocket = require('ws')
var http = require('http')
var moment = require('moment')
const app = express()
const escapeGoat = require('escape-goat');
app.use(express.static('views'))
app.use('/node_modules', express.static('node_modules'))
app.use('/views', express.static('views'))

const baseServer = http.createServer(app)

const wss = new WebSocket.Server({ server: baseServer })

var count = 0;
// 在线人数


wss.on('connection', (ws, req) => {

    count++;
    // ws.send('欢迎连接服务器')
    const ip = req.connection.remoteAddress;
    wss.broadcast('系统消息', ip + '进入了聊天室', 2)

    ws.on('message', (msg) => {
        var msgInfo = JSON.parse(msg)
        wss.broadcast(msgInfo.name, msgInfo.msg, 1)
    })

    ws.on('close', function() {
        count--;
        wss.broadcast('系统消息', ip + '退出了聊天室', 2)

    })
})

//广播。。

// 封装broadcast 
// type 1 用户   2  系统
// name 
// msg
// time
// count

wss.broadcast = function broadcast(name, msg, type) {
    type = type || 1
    var msgInfo = {
        type,
        name,
        msg: escapeGoat.escape(msg),
        time: moment().format('YYYY-MM-DD HH:mm:ss'),
        count
    }


    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(msgInfo));
        }
    });
};



baseServer.listen(3000, '192.168.2.39', () => {

    console.log('server running at http://192.168.2.39:3000');

})