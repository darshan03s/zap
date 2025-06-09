import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

app.get("/", (req: Request, res: Response) => {
    if (!GEMINI_API_KEY) {
        res.status(500).send("GEMINI_API_KEY is not set");
        return;
    }
    res.send("Server is running, GEMINI_API_KEY is set");
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
