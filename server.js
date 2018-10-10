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
      let createEvent = require('./createEvent')
      let startMoment = moment(date);
      var startDate = startMoment.format("YYYYMMDD")
      //let endMoment = startMoment
      //momentは参照渡し
      let endMoment = startMoment.clone()
      endMoment.add(1, 'days');
      var endDate = endMoment.format("YYYYMMDD")
      console.log(startDate)
      console.log(endDate)
      let url = createEvent(startDate, endDate)
      console.log(url)
      let message = startMoment.format("YYYY年MM月DD日で終日の予定を作成しました")
      return client.replyMessage(event.replyToken,
        [{
          type: "text",
          text: message
        },
        {
          type: 'text',
          text: url
        }])
      }
    
    // 期間を設定する
    if(data == 'startDay'){

      let startTime = params['datetime']
      let data = "endDay&" + startTime
      return client.replyMessage(event.replyToken,
        {
          type: 'template',
          altText: '終了時間を選択してください',
          template: {
              type: 'confirm',
              title: '終了時間の選択',
              text: '終了時間を選択します',
              actions: [
                  { label: 'はい', 
                  "type": "datetimepicker",
                    "data":data,
                    "mode":"datetime",
                },
                { label: 'キャンセル', type: 'message', text: "キャンセル"},
              ]
          }
        }
      )
    }else{
      //2回目のdatetimepicker
      let endTime = params['datetime']
      console.log(endTime)
      let arrayData = data.split('&')
      let startTime = arrayData[1]
      console.log(startTime)

      let startMoment = moment(startTime)
      let endMoment = moment(endTime)

      startTime = startMoment.format("YYYYMMDDTHHmmss")
      endTime = endMoment.format("YYYYMMDDTHHmmss")

      console.log(startTime)
      console.log(endTime)

      // gcalLinkの作成
      let createEvent = require('./createEvent')
      let url = createEvent(startTime, endTime)
      return client.replyMessage(event.replyToken,{
        type: 'text',
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
                  "data":"allDay",
                  "mode":"date",
              },
              { label: 'それ以外の予定', type: 'datetimepicker', data: 'startDay',"mode": "datetime"},
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