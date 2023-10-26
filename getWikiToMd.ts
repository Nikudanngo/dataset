import axios from "axios";
const fs = require("fs");
const path = require("path");

const api_url = "https://ja.wikipedia.org/w/api.php";

// input.txtを読み込み
const input = fs.readFileSync(path.resolve(__dirname, "./input.txt"), "utf-8") as string;

// apiリクエスト
const Request = async (title: string) => {
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
    console.log(error);
    return "not found";
  }
};

// まず#REDIRECT or #転送を含むか確認
// 含む場合true
const IsRedirect = (content: string) => {
  const match = content.match(/#REDIRECT|#転送/);
  const isRedirect = match ? true : false;
  return isRedirect;
};

// responseが#redirectの場合、redirect先のtitleを返す
// #REDIRECT or #転送
const GetRedirectTitle = (content: string) => {
  const match = content.match(/#REDIRECT|#転送/);
  const redirectTitle = match ? content.match(/\[\[(.*?)\]\]/)?.[1] : "not";
  return redirectTitle as string;
};

// jsonとして保存
const SaveJson = (title: string, content: string) => {
  fs.writeFileSync(path.resolve(__dirname, `./jsonData/${title}.json`), JSON.stringify(content));
};

// すでに./jsonData/にfetchしたjsonがあるか確認
const IsExistJsonData = (title: string) => {
  const files = fs.readdirSync(path.resolve(__dirname, "./jsonData/"));
  const isExist = files.includes(`${title}.json`);
  return isExist;
};


// ./mdData/$title.txtに保存
const SaveMd = (title: string, content: string) => {
  fs.writeFileSync(path.resolve(__dirname, `./mdData/${title}.md`), `# ${title} \n${content}`);
};

// ./mdData/allData.mdに追記して保存
const AppendSaveMd = (title: string, content: string) => {
  fs.appendFileSync(path.resolve(__dirname, `./mdData/allData.md`), `# ${title} \n${content}\n`);
};

// .mdの中に# $titleがすでに保存されているか確認
const IsExistMdData = (title: string) => {
  const allData = fs.readFileSync(path.resolve(__dirname, `./mdData/allData.md`), "utf-8");
  const isExist = allData.match(new RegExp(`^# ${title}`, "m")) ? true : false;
  return isExist;
};

// wikiTextの中身を整形
const ParseWikiText = (content: string) => {
  // {{~}}を削除
  const deleteBrace = content.replace(/{{[\s\S]*?}}/g, "");
  // 参考文献以降を削除
  const deleteReference = deleteBrace.replace(/(参考文献|脚注)[\s\S]*/g, "");
  // <>,[[w:~]],[http~],[[(File:|画像)~thumb]]を削除
  const deleteTag = deleteReference.replace(/<[\s\S]*?>|\[\[:?w:.*?\]\]|\[http.*?\]|\[(File:|画像:|ファイル:|Image:|file|image:).*?thumb/g, "");
  // [,],',",{,} を削除
  const deleteSymbol = deleteTag.replace(/'|"|\[|\]|\{|\}/g, "");
  // #を*に変換
  const convertSharp = deleteSymbol.replace(/#/g, "*");
  // 空白と\nを削除
  const deleteBlank = convertSharp.replace(/\s|\\n/g, "");
  // ===~===を ### ~ に変換
  const convertTripleEqual = deleteBlank.replace(/===(.*?)===/g, "\n### $1\n");
  // ==~==を ## ~ に変換
  const convertDoubleEqual = convertTripleEqual.replace(/==(.*?)==/g, "\n## $1\n");
  // =を削除
  const deleteEqual = convertDoubleEqual.replace(/=/g, "");
  return deleteEqual;
};


const main = async () => {
  const titles = input.split("\n").map((line) => line.trim());
  for (const title of titles) {
    if (title === "") continue;
    if (await IsExistMdData(title)) {
      console.log(`skip ${title}`);
      continue;
    }
    if (await IsExistJsonData(title)) {
      const content = fs.readFileSync(path.resolve(__dirname, `./jsonData/${title}.json`), "utf-8");
      console.log(`${title} existed in ./jsonData/`);
      const parseWikiText = ParseWikiText(content);
      AppendSaveMd(title, parseWikiText);
      continue;
    }
    console.log(`fetching ${title} and appending to ./mdData/allData.md`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const content = await Request(title);
    // redirectの場合
    if (IsRedirect(content)) {
      const redirectTitle = GetRedirectTitle(content);
      console.log(`redirect to ${redirectTitle}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const redirectContent = await Request(redirectTitle);
      SaveJson(redirectTitle, redirectContent);
      const parseWikiText = ParseWikiText(redirectContent);
      AppendSaveMd(`${title}->${redirectTitle}`, parseWikiText);
      continue;
    }
    SaveJson(title, content);
    const parseWikiText = ParseWikiText(content);
    AppendSaveMd(title, parseWikiText);
  }
};

main();
