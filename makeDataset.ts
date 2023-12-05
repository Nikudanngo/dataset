import fs from "fs";
import path from "path";
import JSONL from "jsonl-parse-stringify";

interface Message {
  role: "user" | "assistant";
  content: string;
}
export interface Dataset {
  messages: Message[];
}
interface ParsedMd {
  title: string;
  content: string;
}

const input = fs.readFileSync(path.resolve(__dirname, "./mdData/allData.md"), "utf-8").replace(/##+/g, "");
const linesText = input.split("\#").filter((line) => line !== "");

const parsedMd: ParsedMd[] = linesText.map((line) => {
  const [title, ...content] = line.split("\n").map((line) => line.trim());
  return { title, content: content.join("\n") };
});

const wikiToDataset = (parsedMd: ParsedMd[]): Dataset[] => {
  const datasets = parsedMd.map((line) => {
    const messages: Message[] = [
      { role: "user", content: line.title.replace("->", ",") + "について教えて" },
      { role: "assistant", content: line.content.replace(/\n/g, "") },
    ];
    console.log(messages);
    return { messages };
  });
  return datasets;
};

const saveDataset = (dataset: Dataset[]) => {
  fs.writeFileSync(path.resolve(__dirname, "./dataset/dataset.json"), JSON.stringify(dataset, null, 2));
  fs.writeFileSync(path.resolve(__dirname, "./dataset/dataset.jsonl"), JSONL.stringify(dataset));
};

const dataset = wikiToDataset(parsedMd);
saveDataset(dataset);

