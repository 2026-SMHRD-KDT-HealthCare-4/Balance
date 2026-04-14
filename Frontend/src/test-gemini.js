const { GoogleGenerativeAI } = require("@google/genai");
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // 혹은 gemini-3-flash
  const result = await model.generateContent("연결 성공했니?");
  console.log(result.response.text());
}

run();