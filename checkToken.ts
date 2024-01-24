import fs from "fs";
import path from "path";
import { Tiktoken, encoding_for_model } from "tiktoken";
import { Dataset } from "./makeDataset";

interface Message {
  title: string;
  content: string;
}

// データセットを読み込む関数
const loadDataset = () => {
  const datasetPath = path.resolve(__dirname, "./dataset/dataset.json");
  const datasetContent = fs.readFileSync(datasetPath, "utf8");
  return JSON.parse(datasetContent);
};

// データセットからメッセージを取得する関数
const extractMessages = (dataset: Dataset[]) => {
  return dataset.map((data) => {
    const title = data.messages.find((message) => message.role === "user")?.content || "";
    const content = data.messages.find((message) => message.role === "assistant")?.content || "";
    return { title, content };
  });
};

// メッセージを結合してテキストにする関数
const joinMessages = (messages: Message[]) => {
  return messages.map((message) => `${message.title} ${message.content}`);
};

// トークンを数える関数
const countTokens = (prompts: string[], encoder: Tiktoken) => {
  return prompts.map((text) => encoder.encode(text).length);
};

// トークン数が多い順にソートする関数
const sortTokenTitlePairs = (tokenTitlePairs: [string, number][]) => {
  return tokenTitlePairs.slice().sort((a, b) => b[1] - a[1]);
};

// トークン数が4000を超える場合だけを集めたオブジェクトを返す関数
const filterTokensOver4000 = (tokenTitlePairs: [string, number][]) => {
  return tokenTitlePairs.filter(([_, tokenCount]) => tokenCount > 4000);
};

//title,tokenのcsvを作成する関数
const createCsv = (tokenTitlePairs: [string, number][]) => {
  const csv = tokenTitlePairs.map(([title, tokenCount]) => `${title.replaceAll("について教えて", "")},${tokenCount}`).join("\n");
  fs.writeFileSync(path.resolve("./dataset/tokens.csv"), csv);
};

const main = () => {
  const encoder = encoding_for_model("gpt-3.5-turbo");
  const dataset = loadDataset();
  const messages = extractMessages(dataset);
  const texts = joinMessages(messages);
  const tokens = countTokens(texts, encoder);

  // トークン数とタイトルをペアにして配列に格納
  const tokenTitlePairs: [string, number][] = messages.map((message, index) => [message.title, tokens[index]]);

  // トークン数が多い順にソート
  const sortedTokenTitlePairs = sortTokenTitlePairs(tokenTitlePairs);

  // トークン数が4000を超える場合だけを集めたオブジェクト
  const tokensOver4000 = filterTokensOver4000(sortedTokenTitlePairs);

  console.log("Sorted Token Title Pairs:");
  console.log(sortedTokenTitlePairs);
  console.log("Tokens Over 4000:");
  console.log(tokensOver4000);
  // 全トークンの平均を表示
  console.log("Average Token Count:");
  console.log(tokens.reduce((a, b) => a + b) / tokens.length);

  // csvを作成
  createCsv(sortedTokenTitlePairs);

  encoder.free();
};

main();
