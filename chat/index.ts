import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// const model = "ft:gpt-3.5-turbo-1106:personal:cookbug30epoch:8jsON4Zw";
const model = "gpt-3.5-turbo-1106";
const title = "ドクガ";

const response = await openai.chat.completions.create({
  model: model,
  messages: [
    {
      "role": "system",
      "content": "入力された虫の名前を使った虫料理のレシピを生成するAIです。200トークン以内で教えて"
    },
    {
      "role": "user",
      "content": title + "について簡単に教えて。あと" + title + "を利用した虫料理のレシピを教えて"
    }
  ],
});

console.log(response);

//今日の日付yyyy-mm-dd-hh-mmを取得
const date = new Date();
const year = date.getFullYear();
const month = date.getMonth() + 1;
const day = date.getDate();
const hour = date.getHours();
const minute = date.getMinutes();
const now = `${year}-${month}-${day}-${hour}-${minute}`;




// ./out.jsonに出力
fs.writeFileSync(path.resolve(`./chat/out-${model}-${title}-${now}.json`), JSON.stringify(response, null, 2));
