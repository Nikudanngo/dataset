// input:ドクガ|ドクガは、チョウ目ドクガ科に属する昆虫です。北海道では南西部の草原に生息しています。ドクガの特徴は次のとおりです: 鱗翅目の仲間 幼虫が持っている毒針毛が皮膚炎を起こす 幼虫は5月～6月頃に見られ、体色は黒く、背や側面にオレンジ色の班紋がある 成虫は6月～8月頃に現れ、黄褐色で20～30ミリメートル程度の大きさになる 初期の幼虫は体長1センチ未満で終齢幼虫になると約3.5 - 4.0センチ サクラ・ウメ・ツツジのほか、多くの植物を食害する ドクガの幼虫が持っている毒針毛に触れると、かゆみをともなって赤く腫れ、1日～2日後にかゆみの強い赤い発疹ができます。かゆみは2～3週間続きます。症状のあらわれ方や程度には個人差があります。 ドクガの幼虫は成熟すると分散するのに対して、チャドクガの毛虫は全生育期間を通じて、集団生活を続けるという習性の違いもあります
// output:{ "messages": [{ "role": "user", "content": "inputA" }, { "role": "assistant", "content": "inputB" }]; }
// この形式のデータセットを生成したい
import fs from "fs";
import path from "path";
import JSONL from "jsonl-parse-stringify";

interface Message {
  role: "user" | "assistant";
  content: string;
}
interface Dataset {
  messages: Message[];
}

const input = fs.readFileSync(path.resolve(__dirname, "./input.txt"), "utf-8");
const linesText = input.split("\n").filter((line) => line !== "");

const wikiToDataset = (lines: string[]): Dataset[] => {
  const datasets = lines.map((line) => {
    const [inputA, inputB] = line.split("|");
    const messages: Message[] = [
      { role: "user", content: inputA },
      { role: "assistant", content: inputB },
    ];
    console.log(messages);
    return { messages };
  });
  return datasets;
};

const saveDataset = (dataset: Dataset[]) => {
  fs.writeFileSync(path.resolve(__dirname, "./jsonData/dataset.json"), JSON.stringify(dataset, null, 2));
  fs.writeFileSync(path.resolve(__dirname, "./jsonData/dataset.jsonl"), JSONL.stringify(dataset));
};

const dataset = wikiToDataset(linesText);
saveDataset(dataset);
