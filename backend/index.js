import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { basePrompt, getSystemPrompt } from "./llm/prompts.js";
import starterTemplateXML from "./project-templates/templates/reacttsx-xml.js";
import starterTemplateWC from "./project-templates/templates/reacttsx-wc.js";
import exampleResponse from "./llm/example-response.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai;

const GEMINI_MODELS = {
    flash: "gemini-2.5-flash-preview-05-20",
    pro: "gemini-2.5-pro-preview-06-05",
};

const THINKING_BUDGET = 1024;

try {
    console.log("Initializing GoogleGenAI...");
    if (!GEMINI_API_KEY) {
        throw new Error(
            "GEMINI_API_KEY is not set. Please check your .env file."
        );
    }
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("GoogleGenAI initialized successfully.");
} catch (error) {
    console.error("Failed to initialize GoogleGenAI:", error.message);
}

app.get("/", async (req, res) => {
    res.send({
        message: "Server is running",
        ai_initialized: !!ai,
    });
});

const chatHistories = new Map();

function getChatHistory(sessionId) {
    if (!chatHistories.has(sessionId)) chatHistories.set(sessionId, []);
    return chatHistories.get(sessionId);
}

app.post("/chat", async (req, res) => {
    if (!ai) {
        return res.status(500).send("AI service is not available.");
    }

    const { prompt, id } = req.body;

    if (!prompt) {
        return res.status(400).send("Prompt is missing from the request body.");
    }

    if (!id) {
        return res
            .status(400)
            .send("Session ID is missing from the request body.");
    }

    const history = getChatHistory(id);

    history.push({ role: "user", parts: [{ text: prompt }] });

    try {
        const stream = await ai.models.generateContentStream({
            model: GEMINI_MODELS.flash,
            contents: history,
            config: {
                systemInstruction:
                    "You are a helpful assistant that can answer questions and help with tasks. Give shell commands and file contents in markdown format.",
            },
        });

        let assistantReply = "";
        for await (const chunk of stream) {
            assistantReply += chunk.text;
            res.write(chunk.text);
        }

        res.end();

        history.push({ role: "model", parts: [{ text: assistantReply }] });
    } catch (error) {
        console.error("Error during AI content generation:", error);
        res.status(500).send(
            "An error occurred while generating the AI response."
        );
    }
});

const templateChatHistories = new Map();

console.log(templateChatHistories);

function getTemplateChatHistory(sessionId) {
    if (!templateChatHistories.has(sessionId))
        templateChatHistories.set(sessionId, []);
    return templateChatHistories.get(sessionId);
}

app.post("/template-chat", async (req, res) => {
    if (!ai) {
        return res.status(500).send("AI service is not available.");
    }

    const { prompt, id } = req.body;
    if (!prompt) {
        return res.status(400).send("Prompt is missing from the request body.");
    }

    if (!id) {
        return res
            .status(400)
            .send("Session ID is missing from the request body.");
    }

    const history = getTemplateChatHistory(id);
    const systemPrompt = getSystemPrompt();

    // console.log(
    //     `${basePrompt}\n\n${prompt}\n\nHere is the project template:\n\n${starterTemplateXML}\n\n${systemPrompt}`
    // );

    if (history.length === 0) {
        history.push({
            role: "user",
            parts: [
                {
                    text: `${basePrompt}\n\n${prompt}\n\nHere is the project template:\n\n${starterTemplateXML}`,
                },
            ],
        });
    } else {
        history.push({
            role: "user",
            parts: [{ text: prompt }],
        });
    }

    try {
        const stream = await ai.models.generateContentStream({
            model: GEMINI_MODELS.flash,
            contents: history,
            config: {
                systemInstruction: systemPrompt,
                maxOutputTokens: 1_000_000,
                temperature: 0.5,
                thinkingConfig: {
                    thinkingBudget: THINKING_BUDGET,
                },
            },
        });

        let modelReply = "";
        for await (const chunk of stream) {
            modelReply += chunk.text;
            res.write(chunk.text);
        }

        res.end();

        history.push({ role: "model", parts: [{ text: modelReply }] });
        templateChatHistories.set(id, history);
        console.log("Template chat history:", templateChatHistories);
    } catch (error) {
        console.error("Error during AI content generation:", error);
        res.status(500).send(
            "An error occurred while generating the AI response."
        );
    }
});

app.post("/project-template", async (req, res) => {
    const { template } = req.body;
    if (!template) {
        return res
            .status(400)
            .send("Template is missing from the request body.");
    }

    if (template === "reacttsx") {
        res.send(starterTemplateWC);
    } else {
        res.status(400).send("Invalid template.");
    }
});

app.post("/test-response", async (req, res) => {
    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send("Prompt is missing from the request body.");
    }

    res.send(exampleResponse);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
