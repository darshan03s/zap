import { ArrowUp, Loader, Paperclip, Trash } from 'lucide-react';
import { useEffect, useRef, useState } from 'react'
import "./chatStyles.css"
import { useWebContainer } from '@/features/react-wc-workspace/webcontainer/useWebContainer';
import { v4 as uuidv4 } from 'uuid';
import { devLog } from '@/utils';
import { parseZapArtifact } from './chat-utils';
import { MemoizedMarkdown } from './memoized-markdown';

const chatId = uuidv4();

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    isLoading?: boolean;
}

const Chat = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const chatUrl = `${baseUrl}/template-chat`;

    const [userPromptText, setUserPromptText] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const { webContainer, ensureDirectoryExists } = useWebContainer();
    const [projectName, setProjectName] = useState("Project");

    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendPrompt = async () => {
        if (userPromptText.trim() === "") return;

        const userPrompt = userPromptText;
        const userMessageId = uuidv4();
        const aiMessageId = uuidv4();

        setMessages(prev => [...prev, {
            id: userMessageId,
            type: 'user',
            content: userPrompt
        }]);

        setMessages(prev => [...prev, {
            id: aiMessageId,
            type: 'ai',
            content: '',
            isLoading: true
        }]);

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
                    body: JSON.stringify({ prompt: userPrompt, id: chatId }),
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

            let chunks = "";
            while (true) {
                const { done, value } = await reader.read();

                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                chunks += chunk;
            }

            const { fileObject, projectName, commandsArr, infoContent } = parseZapArtifact(chunks);

            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, content: infoContent || '', isLoading: false }
                    : msg
            ));

            setProjectName(projectName);

            commandsArr.forEach(command => {
                setMessages(prev => [...prev, {
                    id: uuidv4(),
                    type: 'ai',
                    content: `\`\`\`shell\n${command}\n\`\`\``,
                    isLoading: false
                }]);
            });

            for (const [filePath, content] of Object.entries(fileObject)) {
                await ensureDirectoryExists(filePath);
                devLog(`Writing file: ${filePath} `);
                await webContainer?.fs.writeFile(filePath, content);
            }

        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(msg =>
                msg.id === aiMessageId
                    ? { ...msg, content: 'Sorry, an error occurred while processing your request.', isLoading: false }
                    : msg
            ));
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="chat-section h-full flex flex-col gap-2 rounded-lg text-black dark:text-white">
            <div className="chat flex-1 flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg min-h-0">
                <div className="chat-header flex items-center justify-center min-h-[40px] h-[40px] bg-gray-200 dark:bg-gray-800">
                    <h1 className='text-sm font-bold'>{projectName}</h1>
                </div>

                <div className="chat-content overflow-y-auto break-words p-4 hide-scrollbar text-sm space-y-4" ref={chatContainerRef}>
                    {messages.map((message) => (
                        <div key={message.id} className="message-container">
                            {message.type === 'user' ? (
                                <div className="user-message flex justify-end">
                                    <div className="bg-blue-500 text-white px-4 py-2 rounded-lg max-w-[80%] break-words">
                                        {message.content}
                                    </div>
                                </div>
                            ) : (
                                <div className="ai-message">
                                    {message.isLoading ? (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm max-w-none dark:prose-invert">
                                            {message.content && (
                                                <MemoizedMarkdown
                                                    content={message.content}
                                                    id={message.id}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="prompt-container h-[150px] flex flex-col gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg">
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
                        <button className="text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-white dark:bg-gray-900 rounded-full p-2">
                            <Paperclip size={16} className="opacity-50" />
                        </button>
                    </div>

                    <div className="prompt-actions-right flex items-center gap-2">
                        <button className="send-prompt text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-white dark:bg-gray-900 rounded-full p-2"
                            onClick={() => {
                                handleSendPrompt();
                            }}
                            disabled={isStreaming}
                        >
                            {isStreaming ? <Loader size={16} className="animate-spin opacity-50" /> : <ArrowUp size={16} className="opacity-50" />}
                        </button>

                        {import.meta.env.DEV ? <>
                            <button className="text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-white dark:bg-gray-900 rounded-full p-2"
                                onClick={() => {
                                    setMessages([]);
                                }}
                            >
                                <Trash size={16} className="opacity-50" />
                            </button>
                        </> : null}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default Chat