import * as fs from 'fs';
import * as path from 'path';

const input = fs.readFileSync(path.resolve(__dirname, "./evalsData/input.txt"), "utf-8") as string;

interface Input {
  role: string;
  content: string;
}

interface Recipe {
  input: Input[];
  ideal: string;
}

function generateJSONL(insect: string, methods: string): string {
  const recipe: Recipe = {
    input: [
      {
        role: "system",
        content: "あなたは入力された虫の名前を使った虫料理のレシピを生成するAIです。",
      },
      {
        role: "user",
        content: insect + "を使った虫料理を200トークン以内で教えて",
      },
    ],
    ideal: methods,
  };
  return JSON.stringify(recipe);
}

function addToJSONLFile(filename: string, data: string) {
  fs.appendFileSync(filename, data + '\n');
}

const main = () => {
  // ./evalsData/main.jsonlを空にする
  fs.writeFileSync(path.resolve(__dirname, `./evalsData/main.jsonl`), "");
  // input.txtを読み込んで、main.jsonlに追記
  const lines = input.split('\n');
  for (const line of lines) {
    if (line === "") continue;
    const [insect, methods] = line.split('|');
    const recipe = generateJSONL(insect, methods);
    addToJSONLFile('./evalsData/main.jsonl', recipe);
  }
  const mainData = fs.readFileSync(path.resolve(__dirname, `./evalsData/main.jsonl`), "utf-8");
  console.log(mainData);
};

main();