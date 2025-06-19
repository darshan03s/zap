import { useEffect, useRef, useState } from 'react'
import { useWebContainer } from '@/features/react-wc-workspace/webcontainer/useWebContainer';
import { v4 as uuidv4 } from 'uuid';
import { devLog } from '@/utils';
import { parseZapArtifact } from './chat-utils';
import { MemoizedMarkdown } from './memoized-markdown';
import { useRootContext } from '@/contexts/root-context';
import { ArrowUp, Loader, Paperclip, Trash } from 'lucide-react';
import { useAuth } from '@/features/auth';
import { toast } from 'sonner';
import { type Chat } from '@/contexts/root-context/RootContext';

export interface Message {
    id: string;
    role: 'user' | 'model';
    content: string;
    isLoading?: boolean;
}

const ChatSection = ({ chatId }: { chatId: string }) => {
    const baseUrl = import.meta.env.VITE_API_URL;
    const chatUrl = `${baseUrl}/chat`;
    const messagesHistoryUrl = `${baseUrl}/chat/messages`;
    const createChatUrl = `${baseUrl}/chat/create`;
    const projectFilesUrl = `${baseUrl}/chat/project-files`;
    const updateProjectFilesUrl = `${baseUrl}/chat/update-project-files`;
    const [messages, setMessages] = useState<Message[]>([]);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const { webContainer, ensureDirectoryExists, wcReady, setWcFiles, getFileSystemTree } = useWebContainer();
    const [projectName, setProjectName] = useState<string>("Project");
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { initialPromptText } = useRootContext();
    const [userPromptText, setUserPromptText] = useState<string>(initialPromptText);
    const { session } = useAuth();
    const [startChat, setStartChat] = useState<boolean>(false);
    const [chat, setChat] = useState<Chat | null>(null);
    const { setChats } = useRootContext();

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    async function createChat() {
        const response = await fetch(createChatUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ chat_id: chatId })
        });

        if (!response.ok) {
            toast.error("Error creating chat");
        }

        const data = await response.json();
        if (data.errorMessage) {
            toast.error(data.errorMessage);
        } else {
            return data;
        }
    }

    const fetchMessagesHistory = async () => {
        const response = await fetch(messagesHistoryUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ chat_id: chatId })
        });
        if (!response.ok) {
            toast.error("Error fetching messages history");
            return;
        }
        const data = await response.json();
        if (data.errorMessage) {
            toast.error(data.errorMessage);
        } else {
            setMessages(data.messagesHistory);
        }
    };

    async function getProjectFiles(project_id: string) {
        const response = await fetch(projectFilesUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ project_id: project_id, chat_id: chatId, template: "reacttsx" }),
        });

        if (!response.ok) {
            toast.error("Error fetching project files");
        }

        const data = await response.json();
        if (data.errorMessage) {
            toast.error(data.errorMessage);
        } else {
            setWcFiles(data.files);
        }
    }

    async function chatInit() {
        const chat = await createChat();
        await fetchMessagesHistory();
        await getProjectFiles(chat.project_id);
        setChat(chat);
        setStartChat(true);
        setProjectName(chat.title);
    }

    useEffect(() => {
        chatInit();
    }, [chatId]);

    useEffect(() => {
        if (!wcReady || !startChat) return;
        setTimeout(() => {
            handleSendPrompt();
        }, 500);
    }, [wcReady, startChat]);

    const updateWCFiles = async (fileObject: Record<string, string>) => {
        for (const [filePath, content] of Object.entries(fileObject)) {
            await ensureDirectoryExists(filePath);
            devLog(`Writing file: ${filePath} `);
            await webContainer?.fs.writeFile(filePath, content);
        }
    }

    const updateProjectFiles = async (project_id: string, chat_id: string) => {
        if (!webContainer) return;
        const newWCFiles = await getFileSystemTree(webContainer);
        if (!newWCFiles) return;
        const response = await fetch(updateProjectFilesUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`
            },
            body: JSON.stringify({ project_id: project_id, chat_id: chat_id, files: newWCFiles })
        });

        if (!response.ok) {
            toast.error("Error updating project files");
        }

        const data = await response.json();
        if (data.errorMessage) {
            toast.error(data.errorMessage);
            return;
        }

        return;
    }

    const handleSendPrompt = async () => {
        if (userPromptText.trim() === "") return;
        if (!chat) return;

        const userPrompt = userPromptText;
        const userMessageId = uuidv4();
        const aiMessageId = uuidv4();

        setMessages(prev => [...prev, {
            id: userMessageId,
            role: 'user',
            content: userPrompt
        }]);

        setMessages(prev => [...prev, {
            id: aiMessageId,
            role: 'model',
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
                        "Authorization": `Bearer ${session?.access_token}`
                    },
                    body: JSON.stringify({ prompt: userPrompt, chat_id: chatId, project_id: chat?.project_id }),
                }
            );

            if (!response.ok) {
                toast.error("Error sending prompt");
            }

            const reader = response.body?.getReader();
            if (!reader) {
                toast.error("ReadableStream not supported");
                return;
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
            setChats(prev => prev.map(chat =>
                chat.chat_id === chatId
                    ? { ...chat, title: projectName }
                    : chat
            ));

            commandsArr.forEach(command => {
                setMessages(prev => [...prev, {
                    id: uuidv4(),
                    role: 'model',
                    content: `\`\`\`shell\n${command}\n\`\`\``,
                    isLoading: false
                }]);
            });

            await updateWCFiles(fileObject);
            await updateProjectFiles(chat.project_id, chatId);
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
        <div className="chat-section h-full flex flex-col gap-2 rounded-lg dark:text-foreground text-foreground colors-smooth">
            <div className="chat flex-1 flex flex-col border border-border dark:border-border colors-smooth rounded-lg min-h-0">
                <div className="chat-header flex items-center justify-center min-h-[40px] h-[40px] bg-secondary dark:bg-secondary colors-smooth rounded-t-lg">
                    <h1 className='text-sm font-bold'>{projectName}</h1>
                </div>

                <div className="chat-content overflow-y-auto break-words p-4 hide-scrollbar text-sm space-y-4 bg-background dark:bg-background colors-smooth" ref={chatContainerRef}>
                    {messages.map((message) => (
                        <div key={message.id} className="message-container">
                            {message.role === 'user' ? (
                                <div className="user-message flex justify-end">
                                    <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg max-w-[80%] break-words colors-smooth">
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
                                        <div className="prose prose-sm max-w-none dark:prose-invert bg-secondary dark:bg-secondary rounded-lg colors-smooth">
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

            <div className="prompt-container h-[150px] flex flex-col gap-1 bg-secondary dark:bg-secondary rounded-lg colors-smooth">
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
                        <button className="text-primary-foreground hover:text-primary-foreground/50 colors-smooth dark:text-primary-foreground bg-primary dark:bg-primary rounded-full p-2">
                            <Paperclip size={16} className="" />
                        </button>
                    </div>

                    <div className="prompt-actions-right flex items-center gap-2">
                        <button className="send-prompt text-primary-foreground hover:text-primary-foreground/50 colors-smooth dark:text-primary-foreground bg-primary dark:bg-primary rounded-full p-2"
                            onClick={() => {
                                handleSendPrompt();
                            }}
                            disabled={isStreaming}
                        >
                            {isStreaming ? <Loader size={16} className="animate-spin opacity-50" /> : <ArrowUp size={16} className="" />}
                        </button>

                        {import.meta.env.DEV ? <>
                            <button className="text-primary-foreground hover:text-primary-foreground/50 colors-smooth dark:text-primary-foreground bg-primary dark:bg-primary rounded-full p-2"
                                onClick={() => {
                                    setMessages([]);
                                }}
                            >
                                <Trash size={16} className="" />
                            </button>
                        </> : null}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ChatSection;