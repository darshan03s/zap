import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { basePrompt, getSystemPrompt } from "./llm/prompts.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

let ai;
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

app.post("/chat", async (req, res) => {
    if (!ai) {
        return res.status(500).send("AI service is not available.");
    }

    const { prompt } = req.body;
    console.log("Received prompt:", prompt);

    if (!prompt) {
        return res.status(400).send("Prompt is missing from the request body.");
    }

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-05-20",
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        for await (const chunk of response) {
            res.write(chunk.text);
        }

        res.end();
    } catch (error) {
        console.error("Error during AI content generation:", error);
        res.status(500).send(
            "An error occurred while generating the AI response."
        );
    }
});

app.post("/test-template", async (req, res) => {
    if (!ai) {
        return res.status(500).send("AI service is not available.");
    }

    const { prompt } = req.body;
    if (!prompt) {
        return res.status(400).send("Prompt is missing from the request body.");
    }

    const completePrompt = `${basePrompt}\n\n${prompt}`;

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash-preview-05-20",
            contents: [{ role: "user", parts: [{ text: completePrompt }] }],
            config: {
                systemInstruction: getSystemPrompt(),
            },
        });

        for await (const chunk of response) {
            res.write(chunk.text);
        }

        res.end();
    } catch (error) {
        console.error("Error during AI content generation:", error);
        res.status(500).send(
            "An error occurred while generating the AI response."
        );
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
