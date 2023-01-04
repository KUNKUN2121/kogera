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
    'x2',
    '/2',
    'MAX->0',
    // '？',
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


  var roomCard = settingcard.concat();
  io.sockets.on('connection', function(socket) {
    console.log("接続！");
    
    socket.on('roomJoin' , function (data) {
        roomId = data.value;

        socket.join(roomId);
        console.log(socket.id + ' さんが' + roomId + 'に参加しました。');
        socket.emit('joinLog',{value: socket.id+'さん参加'});

        roomCard = settingcard.concat();

        // 参加者取得
          const clients = io.sockets.adapter.rooms.get(roomId);
          const numClients = clients ? clients.size : 0;
          if(clients == null){
              console.log("ルーム名 : "+roomId+" の参加者がいません")
              return;
          }
          console.log('grooooooop '+ numClients);
          io.to(roomId).emit('groupSetting',{roomPlayers: numClients});
    });

    socket.on('roomResetCard' , function(data){
        roomId= data.roomId;
        console.log(roomId);
        roomCard = settingcard;
        console.log(settingcard);
        roomCard = settingcard.concat();
    });
    socket.on('test', function(data) {
        console.log('test')
    });


    
    socket.on('gameStartPost', function(data) {
        console.log("開始Post");
        roomId= data.roomId;
        //ルームのすべてのクライントIDを取得
        const clients = io.sockets.adapter.rooms.get(roomId);
        const numClients = clients ? clients.size : 0;
        if(clients == null){
            console.log("ルーム名 : "+roomId+" の参加者がいません")
            return;
        }
        // カードシャッフル
        arrayShuffle(roomCard);
        if(roomCard.length < numClients){
            io.to(roomId).emit('group',{id:'noCard',value:"もうないよ；；"});
            roomCard = settingcard.concat();
            return;
        }
        
        // 配布処理
        var goukei = 0;
        for (const clientId of clients ) {
            var clientCard = roomCard.pop();  // カード取り出し
            if(!isNaN(Number(clientCard))){   // 数値判断
              goukei = goukei + Number(clientCard);
            }else{
              // 数字じゃない場合（特殊文字の処理）
              // x2 /2 とかはあとから処理しないといかんよね。
            }
            // ルーム内 1人 ソケット
            const clientSocket = io.sockets.sockets.get(clientId);
            clientSocket.emit('client', {id: "card", value: "" + clientCard});
            // clientSocket.leave('room1'); // ゲーム終了時退出
       }
       // ここで特殊文字を処理する。
      //  1. ? 未実装
      //  2. MAX->0
      //  3. x2 /2
      //  console.log(goukei);
      });



      socket.on('kogera', function(data) {
          roomId = data.roomId;
          user = socket.id;
          kogera();
          // ライフを１減らす。
          // 
          
          // 次のカード送信する。(別画画面だからここじゃない
      });

});
function kogera(params) {

}




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