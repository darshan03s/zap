import { useRootContext } from "@/contexts/root-context";
import ChatSection from "./components/ChatSection";
import { DarkModeToggleButton } from "@/features/dark-mode";
import WCWorkspace from "@/features/react-wc-workspace";
import { useWebContainer } from "@/features/react-wc-workspace/webcontainer/useWebContainer";
import { HomeIcon, Sidebar } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const Chat = () => {
    const { setInitializeWebContainer } = useWebContainer();
    const { id: chatId } = useParams();
    const { isSidebarOpen, setIsSidebarOpen } = useRootContext();
    const [hideChatSection, setHideChatSection] = useState<boolean>(false)

    useEffect(() => {
        setInitializeWebContainer(true)
    }, [chatId])

    return (
        <>
            <div className="main min-h-screen w-full flex items-center px-2 gap-2 dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth">
                <div className="left-bar h-screen w-[30px] dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth py-2">
                    <div className="flex flex-col justify-between h-full">
                        <div className="left-bar-top flex flex-col gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link to="/" className="rounded-full dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth flex justify-center items-center size-8">
                                        <HomeIcon size={16} />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    Home
                                </TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            setIsSidebarOpen(!isSidebarOpen);
                                        }}
                                        className="rounded-full dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth flex justify-center items-center size-8">
                                        <Sidebar size={16} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right" align="center">
                                    See chats
                                </TooltipContent>
                            </Tooltip>
                        </div>

                        <div className="left-bar-bottom flex flex-col gap-2">
                            <DarkModeToggleButton />
                        </div>

                    </div>
                </div>
                <div className="flex items-center gap-2 justify-between flex-1">
                    <div className={`main-left w-[30%] h-screen py-2 ${hideChatSection ? 'hidden' : ''}`}>
                        <ChatSection chatId={chatId!} />
                    </div>
                    <div className="main-right flex-1 h-screen rounded-lg py-2">
                        <WCWorkspace hideChatSection={hideChatSection} setHideChatSection={setHideChatSection} />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chat;
