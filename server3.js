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

  var roomCard = settingcard.concat();

  io.sockets.on('connection', function(socket) {


    ///[roomEvent] 
        /// (roomJoin) 部屋参加
        socket.on('roomJoin' , function (data) {
            socket.join(data.roomId);
            console.log(socket.id + ' さんが' + data.roomId + 'に参加しました。');
            // TODO ここで変化のFunctionを作る。
            // カード結合
            roomCard = settingcard.concat();
        });
        
        /// (gameStart) ゲーム開始
        socket.on('gamestart' , function (data) {
            gamestart(data);
        });

        /// (kogeraPost) kogeraWait
        socket.on('kogeraPost' , function (data) {
            console.log('kogera');
            io.to(data.roomId).emit('kogeraPost',{});
        });

        socket.on('kogeraResult' , function (data) {

        });

        socket.on('roomClose' , function (data) {
        });

    /// 退出処理
    socket.on("disconnecting", () => {
        console.log(socket.rooms); // the Set contains at least the socket ID
      });
    socket.on("disconnect", () => {
        // socket.rooms.size === 0
    });
  });

/// 人数変化Function
function name(params) {
    
}
/// 参加者人数Function
function roomMemFun(params) {
    const clients = io.sockets.adapter.rooms.get(params);
    const numClients = clients ? clients.size : 0;
    if(clients == null){
        console.log("ルーム名 : "+roomId+" の参加者がいません")
        return null;
    }
    // console.log(numClients);
return {clients : clients, numClients: numClients};
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






  function gamestart(data) {
  console.log("開始Post");
        // ルームID取得
        roomId= data.roomId;

        //ルーム接続数、参加人数を取得
        clientsddd =roomMemFun(roomId);
        clients = clientsddd.clients;
        numClients = clientsddd.numClients;

        // カードシャッフル
        arrayShuffle(roomCard);
        if(roomCard.length < numClients){
            // カードが人数分なかったときの処理
            io.to(roomId).emit('group',{id:'noCard',value:"もうないよ；；"});
            roomCard = settingcard.concat();
            return;
        }
        
        /// 配布処理
        // 初期化
        var goukei = 0;
        var tempFun = [];
        var max = -10;

        // クライントにforで送信
        for (const clientId of clients) {
            // カード取り出し
            var clientCard = roomCard.pop();  
            var roomshare;
            roomshare.clientId = clientCard;

            if(!isNaN(Number(clientCard))){
              // 数値の場合
              if(Number(clientCard) > max){
                // 最大値の代入
                max = clientCard;
              }
              // 計算
              goukei = goukei + Number(clientCard);
            }else{
              // 数値じゃない処理
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
    }
    function keisan(params) {
        //人数取得
        clientsddd =roomMemFun(roomId);
        numClients = clientsddd.numClients;
        
        // カードシャッフル
        arrayShuffle(roomCard);
        if(roomCard.length < numClients){
            // カードが人数分なかったときの処理
            io.to(roomId).emit('group',{id:'noCard',value:"もうないよ；；"});
            roomCard = settingcard.concat();
            return;
        }

                // 人数分計算する。
                /// 配布処理
        // 初期化
        var goukei = 0;
        var tempFun = [];
        var max = -10;

        // クライントにforで送信
        for (const clientId of clients) {
            // カード取り出し
            var clientCard = roomCard.pop();  

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
    }