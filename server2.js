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
        console.log("----------------");
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
        var tempFun = [];
        var max = -10;
        for (const clientId of clients) {
            var clientCard = roomCard.pop();  // カード取り出し

            // 数値判断
            if(!isNaN(Number(clientCard))){
              // 数値を計算
              if(Number(clientCard) > max){
                max = clientCard;
                // クロージャ 遅延評価?
              }
              goukei = goukei + Number(clientCard);
            }else{
              // 数値以外を一旦配列に入れておく
              tempFun.push(clientCard);
            }
            // ルーム クライント 送信する。
            const clientSocket = io.sockets.sockets.get(clientId);
            clientSocket.emit('client', {id: "card", value: "" + clientCard});
       }
      // 特殊文字処理
      tempFun.forEach(function(value){
        console.log('変換します' + value);
        switch (value) {
          case 'Max0':
            goukei = goukei - max ;
            console.log(goukei);
            break;
          case 'x2':
            goukei = goukei  * 2 ;
            console.log('かける２' + goukei);
            break;
          case '/2':
            goukei = goukei / 2;
            console.log('わる２' + goukei);
            break;
          default:
            break;
        }
      });
      console.log('合計 : ' + goukei);
      console.log('max : ' + max);
      io.to(roomId).emit('groupGoukei',{value: goukei});
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
            // clientSocket.leave('room1'); // ゲーム終了時退出
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