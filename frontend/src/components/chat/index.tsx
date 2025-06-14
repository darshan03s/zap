import { ArrowUp, Loader, Paperclip, Trash } from 'lucide-react';
import { useEffect, useState } from 'react'
import * as smd from "streaming-markdown"
import "./chatStyles.css"
import { useWebContainer } from '@/features/react-wc-workspace/webcontainer/useWebContainer';
import { v4 as uuidv4 } from 'uuid';
import { useTerminal } from '@/features/react-wc-workspace/terminal/useTerminal';
import { devLog } from '@/utils';

const chatId = uuidv4();

const Chat = () => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const chatUrl = `${baseUrl}/template-chat`;

    const [userPromptText, setUserPromptText] = useState("");
    const [parser, setParser] = useState<smd.Parser | null>(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const { webContainer, ensureDirectoryExists } = useWebContainer();
    const [projectName, setProjectName] = useState("Project");
    const { inputProcess, setShowTerminal } = useTerminal();

    useEffect(() => {
        const element = document.getElementById("chat-markdown")
        const renderer = smd.default_renderer(element!)
        const parser = smd.parser(renderer)
        setParser(parser);
    }, []);

    function parseZapArtifact(zapArtifactText: string): {
        fileObject: Record<string, string>,
        projectName: string,
        commandsArr: string[],
        infoContent: string
    } {
        const fileObject: Record<string, string> = {};
        const commandsArr: string[] = [];
        let projectName = "";
        let infoContent = "";

        // Extract title from zapArtifact element
        const titleRegex = /<zapArtifact[^>]+title="([^"]+)"/;
        const titleMatch = zapArtifactText.match(titleRegex);
        if (titleMatch) {
            projectName = titleMatch[1];
        }

        const infoRegex = /<info>([\s\S]*?)<\/info>/;
        const infoMatch = zapArtifactText.match(infoRegex);
        if (infoMatch) {
            infoContent = infoMatch[1].trim();
        }

        // Extract file actions
        const fileActionRegex = /<zapAction\s+type="file"\s+filePath="([^"]+)">[\s\S]*?<\/zapAction>/g;
        let match;
        while ((match = fileActionRegex.exec(zapArtifactText)) !== null) {
            const filePath = match[1];
            const fullMatch = match[0];

            const contentStart = fullMatch.indexOf('>') + 1;
            const contentEnd = fullMatch.lastIndexOf('</zapAction>');
            const content = fullMatch.substring(contentStart, contentEnd).trim();

            fileObject[filePath] = content;
        }

        // Extract shell commands
        const shellActionRegex = /<zapAction\s+type="shell">[\s\S]*?<\/zapAction>/g;
        let shellMatch;
        while ((shellMatch = shellActionRegex.exec(zapArtifactText)) !== null) {
            const fullMatch = shellMatch[0];

            const contentStart = fullMatch.indexOf('>') + 1;
            const contentEnd = fullMatch.lastIndexOf('</zapAction>');
            const command = fullMatch.substring(contentStart, contentEnd).trim();

            if (command) {
                commandsArr.push(command);
            }
        }

        return { fileObject, projectName, commandsArr, infoContent };
    }

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
                smd.parser_write(parser!, `${infoContent} `);
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
            smd.parser_end(parser!)
            setIsStreaming(false);
        }
    };
    return (
        <div className="chat-section h-full flex flex-col gap-2 rounded-lg text-black dark:text-white">
            <div className="chat h-[450px] flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg">
                <div className="chat-header flex items-center justify-center h-[30px] border-b border-gray-300 dark:border-gray-700">
                    <h1 className='text-sm font-bold'>{projectName}</h1>
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