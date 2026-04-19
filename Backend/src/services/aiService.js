const { GoogleGenerativeAI } = require("@google/genai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getAIAnalysis = async (stats) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // 프롬프트: 데이터 기반으로 페르소나와 제약사항 부여
        const prompt = `
            사용자의 이번 주 자세 데이터:
            - 평균 점수: ${stats.avgScore}점
            - 지난주 대비 개선율: ${stats.improvement}%
            - 주로 자세가 무너지는 시간: ${stats.badTime}

            위 데이터를 바탕으로 대시보드 상단에 들어갈 리포트를 작성해줘.
            조건:
            1. 첫 줄은 "어깨 균형이 지난주 대비 ${stats.improvement}% 개선되었어요!"와 같은 형식으로 긍정적인 성과를 강조할 것.
            2. 두 줄째는 "오후 ${stats.badTime}경 집중력이 떨어질 때..."와 같이 구체적인 피드백과 해결책을 제시할 것.
            3. 문구는 친절하고 명확하게 딱 두 줄만 작성해.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("Gemini 분석 중 오류:", error);
        return "데이터 분석 중입니다. 잠시만 기다려 주세요!"; // Fallback 문구
    }
};

module.exports = { getAIAnalysis };