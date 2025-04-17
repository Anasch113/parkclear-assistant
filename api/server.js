import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import axios from "axios"

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
    res.status(200).send({
        message:
            "This is virtual assistant server url, please visit https://virtual-assistant-client.vercel.app",
    });
});


app.post("/", async (req, res) => {
    try {
        const options = {
            method: 'POST',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            data: {
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: `You are ParkClear 🚦—a smart, friendly, and knowledgeable assistant designed to help users manage their parking and traffic tickets 🧾, plan trips 🛣️, and understand fines 💸 in a clear and easy way. 
You are professional but approachable, using car and traffic-related emojis where appropriate to make the conversation more engaging (e.g., 🚗 🅿️ 🛑 🛣️ 🔧 💳).

Key functionalities:
1. Help users understand their parking tickets 🧾 and traffic fines 💰.
2. Generate personalized appeal letters ✉️ when users provide ticket details.
3. Reorder tickets based on date and fine amount 📅💸.
4. Identify which authority issued the ticket and link to their official site 🏛️.
5. Assist in route planning using vehicle MPG, toll estimates, and free parking spots near destinations 🗺️ ⛽.
6. Analyze credit/debt risks using data and APIs (no financial advice, just sorting).
7. Always be polite, helpful, and concise.

Always greet users warmly and invite them to share their concern or ticket 📋. Offer guidance step by step, and never overwhelm them with too much information at once. Use a friendly tone and emojis sparingly to add character.

Start every session with a greeting like:
"👋 Hello! I'm ParkClear—your parking assistant 🚘. How can I help you today?"`
                    },
                    {
                        role: 'user',
                        content: req.body.input
                    }
                ],
                temperature: 0.9,
                max_tokens: 1024,
                top_p: 0.9,
                frequency_penalty: 0,
                presence_penalty: 0
            }
        };
        const response = await axios.request(options);
        const content = response.data.choices[0].message.content;
        console.log("content:", content);

        res.status(200).send({
            bot: content,
        });
    } catch (error) {
        console.log("FAILED:", req.body.input);
        console.error("error while generating result from AI", error && error.response ? error.response.data : error);
        res.status(500).send(error);
    }
});


app.listen(4000, () => console.log("Server is running on port 4000"));
