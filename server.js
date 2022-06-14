const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const crypto = require('crypto');

/**
 * 3000番でサーバを起動する
 */
 http.listen(3000, ()=>{
  console.log("listening on *:3000");
});

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/view/index.html');
  
// });

const DOCUMENT_ROOT = __dirname + "/view";

app.get("/", (req, res)=>{
  res.sendFile(DOCUMENT_ROOT + "/index.html");
});

app.get("/:file", (req, res)=>{
    res.sendFile(DOCUMENT_ROOT + "/" + req.params.file);
  });

  app.get("/css/:file", (req, res)=>{
    res.sendFile(DOCUMENT_ROOT + "/css/" + req.params.file);
  });

///////////////////////////////////////////////////

const card = [
  '20',
  '15','15',
  '10','10','10',
  '5','5','5',
  '4','4','4',
  '3','3','3',
  '2','2','2',,
  '0','0','0',
  '-5','-5',
  '-10',
  "x2",
  "÷2",
  "MAX->0",
  "?",
];
rand = Math.floor(Math.random()*card.length);

console.log('rand is ' + rand+'');
console.log('cardrand is ' + card[rand]);
console.log('array is ' + card);
card.splice(rand, 1);
console.log('arrayis2'+card);

let i
var userAry = [];
  

io.sockets.on('connection', function(socket) {
    var name;


    // S05. client_to_serverイベント・データを受信する
    socket.on('client_to_server', function(data) {
        // S06. server_to_clientイベント・データを送信する
        console.log('client_to_server 処理です  : '+data.value);
        io.sockets.emit('server_to_client', {value : data.value});
    });



    // S07. client_to_server_broadcastイベント・データを受信し、送信元以外に送信する
    socket.on('client_to_server_broadcast', function(data) {
        socket.broadcast.emit('server_to_client', {value : data.value});
    });



    // 個人送信 
    socket.on('client_to_server_personal', function(data) {
        var id = socket.id;
        name = data.value;
        var personalMessage = "あなたは、" + name + "さんとして入室しました。"
        io.to(id).emit('server_to_client', {value : personalMessage});
    });



    // 退出処理
    socket.on('disconnect', function() {
        if (name == 'undefined') {
            console.log("未入室のまま、どこかへ去っていきました。");
        } else {
            var endMessage = name + "さんが退出しました。"
            io.sockets.emit('server_to_client', {value : endMessage});
        }
    });
});