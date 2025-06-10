import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { basePrompt, getSystemPrompt } from "../llm/prompts.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

app.get("/", async (req: Request, res: Response) => {
    if (!GEMINI_API_KEY) {
        res.status(500).send("GEMINI_API_KEY is not set");
        return;
    }

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: "Which model are you?",
    });

    res.send({
        message: "Server is running, GEMINI_API_KEY is set",
        gemini_response: response?.text,
    });
});

app.post("/test-template", async (req: Request, res: Response) => {
    const { prompt } = req.body;

    const completePrompt = `${basePrompt}\n\n${prompt}`;

    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash-preview-05-20",
        contents: completePrompt,
        config: {
            systemInstruction: getSystemPrompt(),
        },
    });

    for await (const chunk of response) {
        res.write(chunk.text);
    }

    res.end();
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
