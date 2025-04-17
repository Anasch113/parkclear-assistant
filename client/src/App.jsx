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
        const { data } = await axios.post(

            `${import.meta.env.VITE_SERVER_URL}`,
            { input },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        console.log("data from server", data)
        return data;
    };

    const autoTypingBotResponse = (text) => {
        let index = 0;
        let interval = setInterval(() => {
            if (index < text.length) {
                setPosts((prevState) => {
                    let lastItem = prevState.pop();
                    if (lastItem.type !== "bot") {
                        prevState.push({
                            type: "bot",
                            post: text.charAt(index - 1),
                        });
                    } else {
                        prevState.push({
                            type: "bot",
                            post: lastItem.post + text.charAt(index - 1),
                        });
                    }
                    return [...prevState];
                });
                index++;
            } else {
                clearInterval(interval);
            }
        }, 20);
    };

    const onSubmit = () => {
        if (input.trim() === "") return;
        updatePosts(input);
        updatePosts("loading...", false, true);
        setInput("");
        fetchBotResponse().then((res) => {
            console.log(res.bot.trim());
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

            <div className=" flex items-center md:flex-row flex-col md:gap-0 gap-10 w-full p-2 mb-16">
                <img className=" my-4 ml-8 w-40 h-10" src="/ParkClear 1.png" alt="logo" />

                <div className="flex items-center justify-between w-full md:mt-0 mt-4 ">


                    {/* Center Heading with Bot Image */}
                    <div className="absolute md:left-1/2 transform md:-translate-x-1/2 flex items-center md:space-x-3  max-[500px]:w-full ">
                        <p className="text-[#05ACC0] text-xl md:text-4xl font-bold">
                            How can I help <span className="text-[#FF6600]">you today?</span>
                        </p>
                        <img src={bot} className="w-8 h-8 md:w-12 md:h-12" alt="bot" />
                    </div>
                </div>

            </div>


            <section className=" h-[520px]  flex flex-col items-center md:px-10 px-2   ">

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
                <footer className="md:w-2/3 w-full flex items-center justify-center bg-gray-100 text-black">
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
