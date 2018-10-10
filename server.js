'use strict';

require('dotenv').config();
const moment = require('moment');
const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3000;

const config = {
    channelSecret: process.env.CHANNEL_SECRET,
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
    console.log(req.body.events);
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {

  if(event.type == 'postback'){
    // 設定したデータを取得
    const data = event.postback.data
    
    // 日付オブジェクトの取得
    const params = event.postback.params

    // 終日の場合
    if(params['date'] != null){
      console.log("nullではない")
      console.log(params)
      const date = params['date']
      console.log(date)

      // gcalLinkの作成
      var createEvent = require('./createEvent')
      var startMoment = moment(date);
      var startDate = startMoment.format("YYYYMMDD")
      var endMoment = startMoment.add(1, 'days');
      var endDate = endMoment.format("YYYYMMDD")
      console.log(startDate)
      console.log(endDate)
      let url = createEvent(startDate, endDate)
      console.log(url)

      return client.replyMessage(event.replyToken,
        {
          type: "text",
          text: url
        })
      }
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userId = event.source.userId;
  const reqMessage = event.message.text;
  let groupId = event.source.groupId;
  
  console.log(reqMessage)
  if(reqMessage == '予定作成'){
    return client.replyMessage(event.replyToken,
      {
        type: 'template',
        altText: '予定を作成します',
        template: {
            type: 'buttons',
            title: '予定作成',
            text: '予定の期間を選択してください',
            actions: [
                { label: '終日の予定', 
                "type": "datetimepicker",
                  "data":"storeId=12345",
                  "mode":"date",
              },
              { label: 'それ以外の予定', type: 'datetimepicker', data: 'storeId=231',"mode": "datetime"},
            ]
        }
      }  
      
    );
  }

  if(reqMessage == '終日の予定'){
    return client.replyMessage(event.replyToken,
      {
        "type": "text",
        "text": "何月の予定ですか？",
        "quickReply": {
          "items": [
            {
              "type": "action",
              "action": {  
                "type":"datetimepicker",
                "label":"Select date",
                "data":"storeId=12345",
                "mode":"datetime",
                "initial":"2017-12-25t00:00",
                "max":"2018-01-24t23:59",
                "min":"2017-12-25t00:00"
             }
            }
           
           
          ]
        }
      }
    )
  }
  
}

app.listen(PORT);
console.log(`Server running at ${PORT}`);