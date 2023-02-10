const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const crypto = require('crypto');
const { userInfo } = require("os");
const send = require("send");

/**
 * 3000番でサーバを起動する
 */
 http.listen(3000, ()=>{
  console.log("listening on *:3000");
});

const settingcard = [
    '20',
    '15','15',
    '10','10','10',
    '5','5','5',
    '4','4','4',
    '3','3','3',
    '2','2','2',
    '0','0','0',
    '-5','-5',
    '-10',
    'x2',
    '/2',
    'Max0',
    // '？',
    // 偶数は0
  ];
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

////////////////////////////////////////////////////////////

  io.sockets.on('connection', function(socket) {
    ///[roomEvent] 
        /// (roomJoin) 部屋参加
        socket.on('roomJoin' , function (data) {

        });
      });


      var json = {
        "name": "taro",
        "age": "30",
        "tel": "090-0123-4567"
    }