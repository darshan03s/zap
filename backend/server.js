import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { GoogleGenAI } from "@google/genai";
import { basePrompt, getSystemPrompt } from "./llm/prompts.js";
import starterTemplateXML from "./project-templates/templates/reacttsx-xml.js";
import starterTemplateWC from "./project-templates/templates/reacttsx-wc.js";
import authenticate from "./middlewares/authenticate.js";
import {
    createMessage,
    getMessagesHistory,
    addProjectFiles,
    getProjectFiles,
    createChat,
    getAllChats,
} from "./utils/supabaseUtils.js";
import { GEMINI_API_KEY, PORT } from "./constants.js";
import { chatWithGemini } from "./llm/chat.js";
const app = express();

app.use(express.json());
app.use(cors());

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

app.post("/create-chat", authenticate, async (req, res) => {
    const { chat_id } = req.body;
    const user_id = req.user.id;

    const chat = await createChat(user_id, chat_id);
    if (!chat) {
        return res.status(400).json({
            errorMessage: "Server error creating chat.",
        });
    }
    res.json(chat);
});

app.post("/chat", authenticate, async (req, res) => {
    if (!ai) {
        return res.status(500).json({
            errorMessage: "AI service is not available.",
        });
    }

    const { prompt, chat_id } = req.body;
    if (!prompt) {
        return res.status(400).json({
            errorMessage: "Prompt is missing from the request body.",
        });
    }

    if (!chat_id) {
        return res.status(400).json({
            errorMessage: "Chat ID is missing from the request body.",
        });
    }

    const user_id = req.user.id;

    const messagesHistory = await getMessagesHistory(user_id, chat_id);

    let messages = [];

    const systemPrompt = getSystemPrompt();

    if (messagesHistory && messagesHistory.length === 0) {
        messages.push({
            role: "user",
            parts: [{ text: prompt }],
        });
        await createMessage(user_id, chat_id, "user", [
            {
                text: `${basePrompt}\n\n${prompt}\n\nHere is the project template:\n\n${starterTemplateXML}`,
            },
        ]);
    } else {
        messages = messagesHistory.map((message) => {
            return {
                role: message.role,
                parts: message.parts,
            };
        });
    }
    messages.push({ role: "user", parts: [{ text: prompt }] });
    await createMessage(user_id, chat_id, "user", [{ text: prompt }]);

    try {
        const modelReply = await chatWithGemini(
            res,
            ai,
            messages,
            systemPrompt
        );
        await createMessage(user_id, chat_id, "model", [{ text: modelReply }]);
    } catch (error) {
        console.error("Error during AI content generation:", error);
        res.status(500).send(
            "An error occurred while generating the AI response."
        );
    }
});

app.get("/all-chats", authenticate, async (req, res) => {
    const user_id = req.user.id;
    try {
        const chats = await getAllChats(user_id);
        res.json({ chats });
    } catch (error) {
        console.error("Error during chats retrieval:", error);
        res.status(500).json({
            errorMessage: "An error occurred while retrieving chats.",
        });
    }
});

app.post("/project-files", authenticate, async (req, res) => {
    const { project_id, chat_id, template } = req.body;
    const user_id = req.user.id;

    if (!project_id || !chat_id) {
        return res.status(400).json({
            errorMessage:
                "Project ID or Chat ID are missing from the request body.",
        });
    }

    if (!template) {
        return res.status(400).json({
            errorMessage: "Template is missing from the request body.",
        });
    }

    const projectFiles = await getProjectFiles(user_id, project_id, chat_id);
    if (!projectFiles) {
        if (template === "reacttsx") {
            await addProjectFiles(
                user_id,
                project_id,
                chat_id,
                starterTemplateWC
            );
            res.json({
                files: starterTemplateWC,
            });
        } else {
            res.status(400).json({
                errorMessage: "Invalid template.",
            });
        }
    } else {
        res.json({
            files: projectFiles.files,
        });
    }
});

app.post("/messages", authenticate, async (req, res) => {
    const { chat_id } = req.body;
    if (!chat_id) {
        return res.status(400).json({
            errorMessage: "Chat ID is missing from the request body.",
        });
    }

    const user_id = req.user.id;

    try {
        let messagesHistory = await getMessagesHistory(user_id, chat_id);
        messagesHistory = messagesHistory.map((message) => {
            return {
                id: message.id,
                role: message.role,
                content: message.parts[0].text,
            };
        });
        const slicedMessagesHistory = messagesHistory.slice(1);
        res.json({
            messagesHistory: slicedMessagesHistory,
        });
    } catch (error) {
        console.error("Error during messages history retrieval:", error);
        res.status(500).json({
            errorMessage:
                "An error occurred while retrieving messages history.",
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `[${new Date().toLocaleString()}] Server is running on port ${PORT}`
    );
});
