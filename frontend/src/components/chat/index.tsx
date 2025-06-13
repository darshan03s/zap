import { Loader, MoveUp, Paperclip, Trash } from 'lucide-react';
import { useEffect, useState } from 'react'
import * as smd from "streaming-markdown"
import "./chatStyles.css"

const Chat = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const chatUrl = `${baseUrl}/template`;

    const [userPromptText, setUserPromptText] = useState("");
    const [parser, setParser] = useState<smd.Parser | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);

    useEffect(() => {
        const element = document.getElementById("chat-markdown")
        const renderer = smd.default_renderer(element!)
        const parser = smd.parser(renderer)
        setParser(parser);
    }, []);

    const handleSendPrompt = async () => {
        if (userPromptText.trim() === "") return;

        const userPrompt = userPromptText;
        setUserPromptText("");
        setIsStreaming(true);
        try {
            const response = await fetch(
                chatUrl,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ prompt: userPrompt, id: "1" }),
                }
            );


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
                throw new Error("ReadableStream not supported");
            }

            const decoder = new TextDecoder();


            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                smd.parser_write(parser!, chunk);
            }

        } catch (error) {
            console.error(error);
        } finally {
            smd.parser_end(parser!)
            setIsStreaming(false);
        }
    };
    return (
        <div className="chat-section h-full flex flex-col gap-2 rounded-lg text-black dark:text-white">
            <div className="chat h-[450px] flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="chat-header flex items-center justify-center h-[30px] border-b border-gray-300 dark:border-gray-700">
                    <h1 className='text-sm font-bold'>Project</h1>
                </div>

                <div className="chat-content flex-1 overflow-y-auto break-words p-2 hide-scrollbar text-sm">
                    <div id="chat-markdown"></div>
                </div>
            </div>

            <div className="prompt-container flex-1 flex flex-col gap-1 border border-gray-300 dark:border-gray-700 rounded-lg">
                <textarea id="user-prompt-area" className="w-full h-full flex-1 resize-none p-1 px-3 py-3 hide-scrollbar focus:border-none focus:outline-none placeholder:text-sm text-sm" placeholder="Enter your prompt here..."
                    onChange={(e) => setUserPromptText(e.target.value)}
                    value={userPromptText}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendPrompt();
                        }
                    }}
                ></textarea>
                <div className="prompt-actions h-10 px-2 flex items-center justify-between">
                    <div className="prompt-actions-left flex items-center gap-2">
                        <button className="text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-black rounded-full p-2">
                            <Paperclip size={16} />
                        </button>
                    </div>

                    <div className="prompt-actions-right flex items-center gap-2">
                        <button className="send-prompt text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-black rounded-full p-2"
                            onClick={() => {
                                handleSendPrompt();
                            }}
                            disabled={isStreaming}
                        >
                            {isStreaming ? <Loader size={16} className="animate-spin" /> : <MoveUp size={16} />}
                        </button>

                        {import.meta.env.DEV ? <>
                            <button className="text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-black rounded-full p-2"
                                onClick={() => {
                                    const element = document.getElementById("chat-markdown")
                                    element!.innerHTML = "";
                                }}
                            >
                                <Trash size={16} />
                            </button>
                        </> : null}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Chat