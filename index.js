import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';

const app = express();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const GEMINI_MODEL = "gemini-2.5-flash-lite";
// const GEMINI_MODEL = "gemini-1.5-flash";
// const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// app.post('/api/chat', async (req, res) => {
//     const { conversation }  = req.body;

//     try {
//         if(!Array.isArray(conversation)) throw new Error('Messages must be an Arrray!');

//         const contents = conversation.map(({ role, text }) => ({
//             role,
//             parts: [{ text }]
//         }));

//         const response = await ai.models.generateContent({
//             model: GEMINI_MODEL,
//             contents,
//             config: {
//                 temperature:0.9,
//                 systemInstruction: "Jawab hanya menggunakan bahasa indonesia dan hanya seputar kesehatan.",
//             },
//         });

//         res.status(200).json({ result: response.text });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// })

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (
            !Array.isArray(conversation) ||
            conversation.some(m => !m.role || !m.text)
        ) {
            return res.status(400).json({ error: "Invalid conversation format" });
        }

        const contents = conversation.map(({ role, text }) => ({
            role: role === "assistant" ? "model" : role,
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.7,
                systemInstruction: "Kamu adalah asisten kesehatan. Jawab hanya dalam bahasa Indonesia."
            },
        });

        const result =
            response.candidates?.[0]?.content?.parts?.[0]?.text || "";

        res.status(200).json({ result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
})

const PORT = 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));