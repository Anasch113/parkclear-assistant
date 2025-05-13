import { useState, useEffect } from "react";
import axios from "axios";

import send from "/accelerate.png";
import user from "./assets/user.png";
import bot from "/car.png";
import loadingIcon from "/car-animation.webm";
import { DotLottieReact, } from '@lottiefiles/dotlottie-react';
// import loadingIcon from "./assets/loader.svg";

function App() {
    const [input, setInput] = useState("");
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        document.querySelector(".layout").scrollTop =
            document.querySelector(".layout").scrollHeight;
    }, [posts]);

    const fetchBotResponse = async () => {
        // Filter messages to keep a clean chat history for OpenAI
        const history = posts
            .filter((p) => p.type === "user" || p.type === "bot")
            .map((p) => ({
                role: p.type === "user" ? "user" : "assistant",
                content: p.post,
            }));

        // Add the current user input at the end
        history.push({
            role: "user",
            content: input,
        });

        const { data } = await axios.post(
            `${import.meta.env.VITE_SERVER_URL}`,
            { history },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("data from server", data);
        return data;
    };


    const autoTypingBotResponse = (text) => {
        let index = 0;

        setPosts((prevState) => {
            return [
                ...prevState,
                {
                    type: "bot",
                    post: "",
                },
            ];
        });

        const interval = setInterval(() => {
            setPosts((prevState) => {
                const updatedPosts = [...prevState];
                const lastIndex = updatedPosts.length - 1;

                if (index < text.length) {
                    updatedPosts[lastIndex] = {
                        ...updatedPosts[lastIndex],
                        post: updatedPosts[lastIndex].post + text.charAt(index),
                    };
                    index++;
                } else {
                    clearInterval(interval);
                }

                return updatedPosts;
            });
        }, 20);
    };

    const onSubmit = () => {
        if (input.trim() === "") return;
        updatePosts(input); // User message
        updatePosts("loading...", false, true); // Show loading spinner
        setInput("");

        fetchBotResponse().then((res) => {
            console.log(res.bot.trim());

            // Remove the loading post
            setPosts((prevPosts) => {
                const newPosts = [...prevPosts];
                // Remove the last "loading" post
                if (newPosts.length && newPosts[newPosts.length - 1].type === "loading") {
                    newPosts.pop();
                }
                return newPosts;
            });

            // Then start typing animation
            updatePosts(res.bot.trim(), true);
        });
    };

    const updatePosts = (post, isBot, isLoading) => {
        if (isBot) {
            autoTypingBotResponse(post);
        } else {
            setPosts((prevState) => {
                return [
                    ...prevState,
                    {
                        type: isLoading ? "loading" : "user",
                        post,
                    },
                ];
            });
        }
    };

    const onKeyUp = (e) => {
        if (e.key === "Enter" || e.which === 13) {
            onSubmit();
        }
    };

    return (
        <main className="chatGPT-app  ">

            <div className=" flex  items-center md:flex-row flex-col md:gap-0 gap-10 w-full p-2 mb-10 mt-5 ">
                <img className=" md:my-4 my-2 md:ml-8 w-40" src="/ParkClear-new.png" alt="logo" />

                <div className="flex items-center flex-col w-full md:mt-0 ">
                    {/* Center Heading with Bot Image */}
                    <div className="  flex items-center justify-center md:space-x-3  max-[500px]:w-full ">
                        <p className="text-[#05ACC0] text-xl md:text-4xl font-extrabold ">
                            How can I help <span className="text-[#FF6600]">you today?</span>

                        </p>
                        <img src={bot} className="w-8 h-8 md:w-12 md:h-12" alt="bot" />
                    </div>
                    <span className="w-10/12">
                        <p className=" text-center my-2">Your intelligent parking companion — ParkClear Assistant provides instant help for tickets, appeals, routes, and more. Save time, reduce fines, and drive confidently with AI-powered support.</p>
                    </span>

                </div>


            </div>


            <section className=" h-[520px]  flex flex-col items-center md:px-10 px-2  bg-[#FFFAF1] rounded-2xl py-4">

                <div className="layout w-2/3 mb-2">
                    {posts.map((post, index) => (
                        <div
                            key={index}
                            className={`chat-bubble ${post.type === "bot" || post.type === "loading"
                                ? "bot"
                                : ""
                                }`}
                        >
                            <div className="avatar">
                                <img
                                    src={
                                        post.type === "bot" ||
                                            post.type === "loading"
                                            ? bot
                                            : user
                                    }
                                />
                            </div>
                            {post.type === "loading" ? (
                                <div className="loader">
                                    <DotLottieReact
                                        src="https://lottie.host/07c67b99-5af1-415f-9a5e-5e23ecdab40c/eimpOB8RWt.lottie"
                                        loop
                                        autoplay
                                        className="md:w-56 w-24 h-20"
                                    />
                                </div>
                            ) : (
                                <div className="post">{post.post}</div>
                            )}
                        </div>
                    ))}
                </div>
                <footer className="md:w-2/3 w-full flex items-center justify-center bg-[#FFFAF1] text-black mb-2 border border-gray-300">
                    <input
                        className="composebar"
                        value={input}
                        autoFocus
                        type="text"
                        placeholder="Start chatting… "
                        onChange={(e) => setInput(e.target.value)}
                        onKeyUp={onKeyUp}
                    />
                    <div className="send-button" onClick={onSubmit}>
                        <img src={send} />
                    </div>
                </footer>
            </section>

        </main>
    );
}

export default App;
