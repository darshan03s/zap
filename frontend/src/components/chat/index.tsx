import { ArrowUp, Loader, Paperclip, Trash } from 'lucide-react';
import { useState } from 'react'
import "./chatStyles.css"
import { useWebContainer } from '@/features/react-wc-workspace/webcontainer/useWebContainer';
import { v4 as uuidv4 } from 'uuid';
import { useTerminal } from '@/features/react-wc-workspace/terminal/useTerminal';
import { devLog } from '@/utils';
import { parseZapArtifact } from './chat-utils';
import { MemoizedMarkdown } from './memoized-markdown';

const chatId = uuidv4();

const Chat = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const chatUrl = `${baseUrl}/template-chat`;

    const [userPromptText, setUserPromptText] = useState("");
    const [markdownContent, setMarkdownContent] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const { webContainer, ensureDirectoryExists } = useWebContainer();
    const [projectName, setProjectName] = useState("Project");
    const { inputProcess, setShowTerminal } = useTerminal();

    const handleSendPrompt = async () => {
        if (userPromptText.trim() === "") return;

        const userPrompt = userPromptText;
        setUserPromptText("");
        setIsStreaming(true);
        setMarkdownContent(""); // Clear previous content
        
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


            setShowTerminal(true);
            const { fileObject, projectName, commandsArr, infoContent } = parseZapArtifact(chunks);
            if (infoContent) {
                setMarkdownContent(infoContent);
            }
            setProjectName(projectName);
            const command = commandsArr.join(" && ");
            command.concat(`\\r`);
            inputProcess?.write(command);

            for (const [filePath, content] of Object.entries(fileObject)) {
                await ensureDirectoryExists(filePath);
                devLog(`Writing file: ${filePath} `);
                await webContainer?.fs.writeFile(filePath, content);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsStreaming(false);
        }
    };
    
    return (
        <div className="chat-section h-full flex flex-col gap-2 rounded-lg text-black dark:text-white">
            <div className="chat flex-1 flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="chat-header flex items-center justify-center h-[30px] border-b border-gray-300 dark:border-gray-700">
                    <h1 className='text-sm font-bold'>{projectName}</h1>
                </div>

                <div className="chat-content overflow-y-auto break-words p-2 hide-scrollbar text-sm">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        {markdownContent && (
                            <MemoizedMarkdown 
                                content={markdownContent} 
                                id={chatId} 
                            />
                        )}
                    </div>
                </div>
            </div>

            <div className="prompt-container h-[150px] flex flex-col gap-1 border border-gray-300 dark:border-gray-700 rounded-lg">
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
                        <button className="text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-gray-200 dark:bg-black rounded-full p-2">
                            <Paperclip size={16} />
                        </button>
                    </div>

                    <div className="prompt-actions-right flex items-center gap-2">
                        <button className="send-prompt text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-gray-200 dark:bg-black rounded-full p-2"
                            onClick={() => {
                                handleSendPrompt();
                            }}
                            disabled={isStreaming}
                        >
                            {isStreaming ? <Loader size={16} className="animate-spin" /> : <ArrowUp size={16} />}
                        </button>

                        {import.meta.env.DEV ? <>
                            <button className="text-black hover:text-gray-500 transition-colors duration-200 dark:text-white bg-gray-200 dark:bg-black rounded-full p-2"
                                onClick={() => {
                                    setMarkdownContent("");
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