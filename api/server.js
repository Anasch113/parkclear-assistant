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
            "This is parkClear assitant server",
    });
});





app.post("/", async (req, res) => {
    console.log("request body:", req.body.history);
    try {
        const { history } = req.body;
        const latestMessage = history[history.length - 1]?.content?.toLowerCase() || "";

        console.log("latest message", latestMessage)

        // Basic keyword check to detect appeal request
        const appealKeywords = ['appeal', 'generate an appeal', 'create appeal', 'write an appeal', 'appeal letter',];
        const isAppealRequest = appealKeywords.some(keyword => latestMessage.includes(keyword));

        console.log("isAppealRequest", isAppealRequest)

        if (isAppealRequest) {
            const responseMessage = `Sure! To generate your appeal, please visit ParkClear service:(https://parkclear.co.uk/) 📝.`;

            return res.status(200).send({
                bot: responseMessage
            });
        }

        const messages = [
            {
                role: 'system',
                content: `You are ParkClear 🚦—a smart, friendly, and knowledgeable assistant designed to help users manage their parking and traffic tickets 🧾, plan trips 🛣️, and understand fines 💸 in a clear and easy way. 
Use emojis like 🚗 🅿️ 🛑 🛣️ 🔧 💳 to enhance tone. Never write appeal letters. If user asks for an appeal, guide them to use https://parkclear.co.uk/ instead.`
            },
            ...history
        ];

        console.log("messages", messages)

        const options = {
            method: 'POST',
            url: 'https://api.openai.com/v1/chat/completions',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            data: {
                model: 'gpt-4o-mini',
                messages,
                temperature: 0.7,
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
