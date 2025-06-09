import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
