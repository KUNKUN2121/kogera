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

function room(roomid, card ,user) {
    this.roomid = roomid;
    this.card = settingcard.concat();
    this.user = user;

    this.reset = function() {
        this.card = settingcard.concat();
      };
}
// ルームIDごとにコンストラクトを作成する。
// 内容
//  user 配列。
var userlist = [];
userlist.push(
    // id , life , card
    ['001', '1', 'card'],
    ['002', '5', 'card'],
    ['003', '3', 'card'],
    ['004', '2', 'card'],
    ['005', '2', 'card'],
    );



var r001 = new room(1, null ,userlist);
console.log(r001.roomid);
// console.log(r001.card);
// console.log(r001.user[0][1]);
console.log(r001.user);