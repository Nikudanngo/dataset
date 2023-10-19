import axios from "axios";
const fs = require("fs");
const path = require("path");

const api_url = "https://ja.wikipedia.org/w/api.php";

// input.txtを読み込み
const input = fs.readFileSync(path.resolve(__dirname, "./input.txt"), "utf-8") as string;

// apiリクエスト
const request = async (title: string) => {
  try {
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
  } catch (error) {
    return "not found";
  }
};

// jsonとして保存
const saveJson = async (title: string, content: string) => {
  fs.writeFileSync(path.resolve(__dirname, `./jsonData/${title}.json`), JSON.stringify(content));
};

// すでに./jsonData/にfetchしたjsonがあるか確認
const isExistJson = async (title: string) => {
  const files = fs.readdirSync(path.resolve(__dirname, "./jsonData/"));
  const isExist = files.includes(`${title}.json`);
  return isExist;
};


// ./wikiData/$title.txtに保存
const saveMd = async (title: string, content: string) => {
  fs.writeFileSync(path.resolve(__dirname, `./wikiData/${title}.md`), `# ${title} \n${content}`);
};

// ./wikiData/allData.mdに追記して保存
const appendSaveMd = async (title: string, content: string) => {
  fs.appendFileSync(path.resolve(__dirname, `./wikiData/allData.md`), `# ${title} \n${content}\n`);
};

// .mdの中に# $titleがすでに保存されているか確認
const isExistMd = async (title: string) => {
  const allData = fs.readFileSync(path.resolve(__dirname, `./wikiData/allData.md`), "utf-8");
  const isExist = allData.includes(`# ${title}`);
  return isExist;
};

// wikiTextの中身を整形
const ParseWikiText = async (content: string) => {
  // {{}}の中身を削除
  const deleteBrace = content.replace(/{{[\s\S]*?}}/g, "");
  // 参考文献以降を削除
  const deleteReference = deleteBrace.replace(/(参考|脚注|参照)[\s\S]*/g, "");
  // 空白と\nを削除
  const deleteBlank = deleteReference.replace(/\s|\\n/g, "");
  // =, [] ,'," を削除
  const deleteEqual = deleteBlank.replace(/=|'|"|\[|\]/g, "");
  // <small/></small>の中を削除
  const deleteSmall = deleteEqual.replace(/<small>[\s\S]*?<\/small>/g, "");
  // <ref/>|</ref>,<refname"text">を削除
  const deleteRef = deleteSmall.replace(/<ref>|<\/ref>|<refname[\s\S]*?>/g, "");
  return deleteRef;
};

const main = async () => {
  const titles = input.split("\n").map((line) => line.trim());
  for (const title of titles) {
    if (title === "") continue;
    if (await isExistMd(title)) {
      console.log(`skip ${title}`);
      continue;
    }
    if (await isExistJson(title)) {
      const content = fs.readFileSync(path.resolve(__dirname, `./jsonData/${title}.json`), "utf-8");
      console.log(`${title} existed in ./jsonData/`);
      const parseWikiText = await ParseWikiText(content);
      appendSaveMd(title, parseWikiText);
      continue;
    }
    console.log(`fetching ${title} and save to ./wikiData/${title}.md`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const content = await request(title);
    await saveJson(title, content);
    const parseWikiText = await ParseWikiText(content);
    appendSaveMd(title, parseWikiText);
  }
};

main();
