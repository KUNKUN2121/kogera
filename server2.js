const app  = require("express")();
const http = require("http").createServer(app);
const io   = require("socket.io")(http);
const crypto = require('crypto');
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
    '2','2','2',,
    '0','0','0',
    '-5','-5',
    '-10',
    "x2",
    "÷2",
    "MAX->0",
    "？",
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

  //



  var roomCard = settingcard.concat();
  io.sockets.on('connection', function(socket) {
    console.log("接続！");
    
    socket.on('roomJoin' , function (data) {
        // room == data.value があるか確認
        room = data.value;
        socket.join(room);
        console.log(socket.id + ' さんが' + room + 'に参加しました。');
        console.log("Now Room " + socket.rooms);  //現在のRoom 一覧
        roomCard = settingcard.concat();
    });

    socket.on('roomResetCard' , function(data){
        roomId= data.roomId;
        console.log(roomId);
        roomCard = settingcard;
        console.log(settingcard);
        roomCard = settingcard.concat();
    });



    
    socket.on('test_post', function(data) {
        console.log("開始Post");
        roomId= data.roomId;
        //ルームのすべてのクライントIDを取得
        const clients = io.sockets.adapter.rooms.get(roomId);
        const numClients = clients ? clients.size : 0;
        if(clients == null){
            console.log("undi")
            return;
        }
        // カードシャッフル
        arrayShuffle(roomCard);
        // console.log(roomCard);
        // console.log(roomCard.length)
        if(roomCard.length < numClients){
            io.to(roomId).emit('groupOnly',{id:'noCard',value:"もうないよ；；"});
            return;
        }
        for (const clientId of clients ) {
            var clientCard = roomCard.pop(); 
            // ルーム内 1人 ソケット
            const clientSocket = io.sockets.sockets.get(clientId);
            clientSocket.emit('clientOnly', {id: "card", value: "clientOnlyMessage" + clientCard});
            // clientSocket.leave('room1'); // ゲーム終了時退出
       
       }
        // socket.emit("test", "受け取ったやつ ");
        
      });
});





// 配列シャッフル 
// 参考 : https://gray-code.com/javascript/shuffle-for-item-of-array/

function arrayShuffle(array) {
    for(var i = (array.length - 1); 0 < i; i--){
  
      // 0〜(i+1)の範囲で値を取得
      var r = Math.floor(Math.random() * (i + 1));
  
      // 要素の並び替えを実行
      var tmp = array[i];
      array[i] = array[r];
      array[r] = tmp;
    }
    return array;
  }