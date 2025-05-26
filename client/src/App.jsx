
import { useState, useEffect } from "react";
import axios from "axios";

import send from "/accelerate.png";
import user from "./assets/user.png";
import bot from "/car.png";
import loadingIcon from "/car-animation.webm";
import { DotLottieReact, } from '@lottiefiles/dotlottie-react';
import { IoIosArrowRoundForward } from "react-icons/io";
// import loadingIcon from "./assets/loader.svg";

function App() {
    const [input, setInput] = useState("");
    const [posts, setPosts] = useState([]);
    const [darkMode, setDarkMode] = useState(false);



    useEffect(() => {
        document.querySelector(".layout").scrollTop =
            document.querySelector(".layout").scrollHeight;
    }, [posts]);





    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    }, [darkMode]);



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
        <main className="chatGPT-app min-h-screen  transition-colors duration-300 bg-white dark:bg-gray-900 text-black dark:text-white">



            <div className="flex md:items-center justify-between md:flex-row md:gap-0 gap-10 w-full  border-b dark:border-gray-800">

                <div className="relative px-2 flex items-center md:block">
                    <img
                        className="md:my-4 my-2 md:ml-8 w-40"
                        src="/ParkClear-new.png"
                        alt="logo"
                    />

                    {/* Assistant Badge */}
                    <span className="ml-3 md:ml-0 md:absolute md:top-4 md:-right-24 bg-gray-100 dark:bg-gray-800 text-black dark:text-white text-sm max-[500px]:text-xs px-3 py-1 rounded-xl shadow">
                        Assistant
                    </span>
                </div>

                <div className="px-2 flex items-center">

                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className="bg-gray-300 dark:bg-gray-700 md:px-4 md:py-2  p-1 rounded-md text-black dark:text-white max-[500px]:text-xs"
                    >
                        {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
                    </button>

                </div>

                {/* Other content */}
            </div>



            <section className=" h-[550px]  flex flex-col items-center  px-10  rounded-2xl py-6">

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
                                <div
                                    className="post"
                                    dangerouslySetInnerHTML={{ __html: post.post }}
                                ></div>

                            )}
                        </div>
                    ))}
                </div>


            </section>
            <div className="flex w-full items-center justify-center gap-2 border-t dark:border-gray-800 pt-8 max-[500px]:px-2">

                <input
                    className="md:w-2/3 w-full flex items-center justify-center bg-transparent mb-2 border border-gray-300 dark:border-gray-800  rounded-md  outline-none px-4 py-5 dark:bg-gray-900 text-black dark:text-white "
                    value={input}
                    autoFocus
                    type="text"
                    placeholder="Ask ParkClear Assistant... "
                    onChange={(e) => setInput(e.target.value)}
                    onKeyUp={onKeyUp}
                />


                <div className="flex items-center justify-center cursor-pointer py-5 px-3 rounded-md bg-gray-200 dark:bg-gray-800" onClick={onSubmit}>
                    <IoIosArrowRoundForward className="text-black dark:text-white" size={25} />
                </div>
            </div>
        </main>
    );
}

export default App;
