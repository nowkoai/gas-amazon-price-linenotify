///////////////////////////////////////////////////////////////
// Gmailチェックフラグ
///////////////////////////////////////////////////////////////
// 全メール転送したい場合
// cell = ''

// 指定ラベルを転送したい場合
cell = 'Gmailボット'
// console.log(cell)
///////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////
// 転送対象メールの時間処理フィルタ
///////////////////////////////////////////////////////////////
var date = new Date() ;
var unixTime = date.getTime();//UNIX TIMEに変換
var now = Math.floor(unixTime/1000);
var term = now - 300; //Gmailのafterフィルター用 現在時刻から5分（300秒）前
var tereEnd = now - 120; //スレッド受信時間用 現在時刻から2分前（120秒）前


///////////////////////////////////////////////////////////////
// GmailチェックFunctionを、1分間隔で起動
///////////////////////////////////////////////////////////////

function getMail2(){

  // 指定した内容でメール受信
  if(cell === ''){
    // ラベルフィルタなし/全メール転送
    var FindSubject = '-label:LineBot after:'+term;

  }else{
    // ラベルフィルタあり/指定メールのみ転送
    var FindSubject = '-label:LineBot label:'+cell+' after:'+term;

  }

  // 直近のGmailサーチ
  var myThreads = GmailApp.search(FindSubject,0,1);
  //スレッドからメールを取得し二次元配列に格納
  var myMessages = GmailApp.getMessagesForThreads(myThreads);

  // 転送済みメールには、LineBotラベルをつける実装（LineBotラベルなければ作成）
  var target_label = 'LineBot';
  var mail_by_label = GmailApp.getUserLabelByName(target_label);
  if(!mail_by_label){
    GmailApp.createLabel('LineBot');
  }

  // 直近の転送対象のGmail処理
  for(var i=0;i<myMessages.length;i++){
    for(var j=0;j<myMessages[i].length;j++){

        ///////////////////////////////////////////////////////////
        // 各メールからメッセージの抽出
        ///////////////////////////////////////////////////////////
        // --★タイトル
        // var strSubject = "\n\n■タイトル:\n["+myMessages[i][j].getSubject()+"]\nスレッド番号["+j+"]";
        var strSubject = "\n\n■タイトル:\n"+myMessages[i][j].getSubject().split(':「')[0]+"\nスレッド番号["+j+"]";

        // --★本文
        var strMessage0 = myMessages[i][j].getPlainBody();
        // console.log(strMessage0)

        var strMessage1 = strMessage0.split('からのお知らせ')[1]
        var strMessage_1 = strMessage1.split('Amazon.co.jp')[0]
        console.log(strMessage_1)


        // --★HTMLボディ
        var strMessage00 = myMessages[i][j].getBody();
        // console.log(strMessage00)

        // --★Asin for URL -- カット
        strMessage009 = decodeURI(strMessage00)
        console.log(strMessage009)

        var asin = Parser
        .data(strMessage009)
        .from('asin=')
        .to('&')
        .build();
        console.log(asin)
        // asin = "B08LH5MMX2"

        url = "https://www.amazon.co.jp/gp/offer-listing/" + asin + "/?condition=new"
        strMessage = "■本文:" + strMessage_1 + "\n\n" + url


        ///////////////////////////////////////////////
        // 商品画像
        var g1 = Parser
        .data(strMessage00)
        .from('<img alt="" style="max-height: 200px; max-width: 200px; padding: 0px 6px 6px 0; float: left;border: none;" src="')
        .to('">')
        .build();
        console.log(g1)

        // 価格画像
        var g2 = Parser
        .data(strMessage00)
        .from('<img style="padding-top:15px" src="')
        .to('">')
        .build();
        console.log(g2)
        ///////////////////////////////////////////////


        ///////////////////////////////////////////////////////////////
        // メールIDあり（出力しない）
        var mailID = myMessages[i][j].getId();

        // 時間抽出
        var strDate = myMessages[i][j].getDate();
        var mailunixTime = strDate.getTime();//UNIX TIMEに変換
        var mailTime = Math.floor(mailunixTime/1000); //ミリ秒を秒に変換


       ///////////////////////////////////////////////////////////////
       // 直近メールの転送処理
       if(tereEnd < mailTime){

          // LINE Notifyに、プッシュ通知する
          line_push1(strSubject,strMessage, g2);
          line_push2(strSubject,strMessage, g1);

          //通知済みのメッセージにラベルをつける
          var label_treated = GmailApp.getUserLabelByName('LineBot');
          myThreads[i].addLabel(label_treated);
        }

    }
  }

}


///////////////////////////////////////////////////////////////
// LINE Notifyに、プッシュ通知する
///////////////////////////////////////////////////////////////

function line_push1(strSubject,strMessage, g2) {

  var token = ['LINE Notifyのトークン'];

  var content =  strSubject + "\n\n" + strMessage

  var options = {
    "method" : "post",
    "payload" : {"message": content,
                  "imageThumbnail" : g2, //最大240x240pxのJPG画像
                  "imageFullsize" : g2,  //最大1024x1024pxのJPG画像
                },
    "headers": {"Authorization": "Bearer " + token}
  };

  // プッシュ通知
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);

}


function line_push2(strSubject,strMessage, g1) {

  var token = ['LINE Notifyのトークン'];

  var content2 = "\n" + "▼商品画像"
  var options = {
    "method" : "post",
    "payload" : {
      　　　　　　　"message": content2,
                  "imageThumbnail" : g1, //最大240x240pxのJPG画像
                  "imageFullsize" : g1,  //最大1024x1024pxのJPG画像
                },
    "headers": {"Authorization": "Bearer " + token}
  };

  // プッシュ通知
  UrlFetchApp.fetch("https://notify-api.line.me/api/notify", options);

}
