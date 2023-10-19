import axios from "axios";
const fs = require("fs");
const path = require("path");

const api_url = "https://ja.wikipedia.org/w/api.php";

// apiリクエスト
const request = async (title) => {
  const params = {
    "action": "query",
    "format": "json",
    "prop": "revisions",
    "titles": title, // 取得したいページのタイトルを指定
    "rvprop": "content"
  };
  const response = await axios.get(api_url, { params });
  const pages = response.data.query.pages;
  const pageId = Object.keys(pages)[0];
  const content = pages[pageId].revisions[0]["*"] as string;
  return content;
};

// ./wikiData/$title.txtに保存
const saveMd = async (title, content) => {
  fs.writeFileSync(path.resolve(__dirname, `./wikiData/${title}.md`), `# ${title} \n${content}`);
};

// ./wikiData/allData.mdに追記して保存
const appendSaveMd = async (title, content) => {
  fs.appendFileSync(path.resolve(__dirname, `./wikiData/allData.md`), `# ${title} \n${content}\n`);
};

// .mdの中に# $titleがすでに保存されているか確認
const isExistMd = async (title: string) => {
  const allData = fs.readFileSync(path.resolve(__dirname, `./wikiData/allData.md`), "utf-8");
  const isExist = allData.includes(`# ${title}`);
  return isExist;
};

// wikiTextの中身を整形
const ParseWikiText = async (content) => {
  // {{}}の中身を削除
  const deleteBrace = content.replace(/{{[\s\S]*?}}/g, "");
  // 参考文献以降を削除
  const deleteReference = deleteBrace.replace(/参考文献[\s\S]*/, "");
  // 空白を削除
  const deleteBlank = deleteReference.replace(/\s+/g, "");
  // =, [] ,' を削除
  const deleteEqual = deleteBlank.replace(/=|'|\[|\]/g, "");
  return deleteEqual;
};

const main = async () => {
  const titles = ["ドクガ", "タランチュラ"];
  for (const title of titles) {
    console.log(title);
    if (await isExistMd(title)) {
      console.log("skip");
      continue;
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const content = await request(title);
    const parseWikiText = await ParseWikiText(content);
    appendSaveMd(title, parseWikiText);
  }
};

main();