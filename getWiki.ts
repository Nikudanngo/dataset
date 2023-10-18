import axios from "axios";
const api_url = "https://ja.wikipedia.org/w/api.php";
const title = "ドクガ";

const params = {
  "action": "query",
  "format": "json",
  "prop": "revisions",
  "titles": title, // 取得したいページのタイトルを指定
  "rvprop": "content"
};

// apiリクエスト
const request = async () => {
  const response = await axios.get(api_url, { params });
  const pages = response.data.query.pages;
  const pageId = Object.keys(pages)[0];
  const content = pages[pageId].revisions[0]["*"];
  console.log(content);
  return content;
};

// ./wikiData/$title.txtに保存
const save = async () => {
  const content = await request();
  const fs = require("fs");
  const path = require("path");
  fs.writeFileSync(path.resolve(__dirname, `./wikiData/${title}.txt`), content);
};

save();