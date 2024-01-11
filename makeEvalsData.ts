import * as fs from 'fs';
import * as path from 'path';

const input = fs.readFileSync(path.resolve(__dirname, "./evalsData/input.txt"), "utf-8") as string;

interface Input {
  role: string;
  content: string;
}

interface Recipe {
  input: Input[];
  ideal: string | string[];
}

function generateJSONL(insect: string, methods: string[]): string {
  const recipe: Recipe = {
    input: [
      {
        role: "system",
        content: "Userから入力された虫を安全に食べることができる調理法をAssistant:の続きに提案してください。ただし、AIの解答は繰り返ずに一度だけ答えて。返答は日本語で提供してください。提案された調理法の利点や理由も説明してください。",
      },
      {
        role: "user",
        content: insect,
      },
    ],
    // methodsが一つしかない場合はstringとして
    ideal: methods.length === 1 ? methods[0] : methods,
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
    const methodsArray = methods.split(',');
    const recipe = generateJSONL(insect, methodsArray);
    addToJSONLFile('./evalsData/main.jsonl', recipe);
  }
  const mainData = fs.readFileSync(path.resolve(__dirname, `./evalsData/main.jsonl`), "utf-8");
  console.log(mainData);
};

main();