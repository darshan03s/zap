import { GEMINI_THINKING_BUDGET, GEMINI_MODELS } from "../constants.js";

export async function chatWithGemini(
    res,
    gemini,
    messagesHistory,
    systemPrompt
) {
    const stream = await gemini.models.generateContentStream({
        model: GEMINI_MODELS.flash,
        contents: messagesHistory,
        config: {
            systemInstruction: systemPrompt,
            maxOutputTokens: 1_000_000,
            temperature: 0.5,
            thinkingConfig: {
                thinkingBudget: GEMINI_THINKING_BUDGET,
            },
        },
    });

    let modelReply = "";
    for await (const chunk of stream) {
        modelReply += chunk.text;
        res.write(chunk.text);
    }

    res.end();
    return modelReply;
}
