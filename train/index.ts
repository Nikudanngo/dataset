import OpenAI from "openai";
const fs = require('fs');
const openai = new OpenAI({
  // env
  apiKey: process.env.OPENAI_API_KEY,
});

const title = "poisonous-insect";

async function main() {
  const upload_file = await openai.files.create({
    file: fs.createReadStream('./dataset/dataset.jsonl'),
    purpose: "fine-tune",
  });
  console.log(upload_file);

  const fineTune = await openai.fineTuning.jobs.create(
    {
      training_file: upload_file.id,
      model: "gpt-3.5-turbo",
      suffix: title,
    }
  );
  console.log(fineTune);
}

main().catch(error => {
  console.error('An error occurred:', error);
});
