import ChatLayout from "@/components/chat";
import { DarkModeToggleButton } from "@/features/dark-mode";
import WCWorkspace from "@/features/react-wc-workspace";
import { useWebContainer } from "@/features/react-wc-workspace/webcontainer/useWebContainer";
import { HomeIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const Chat = () => {
    const { setInitializeWebContainer } = useWebContainer();
    const { id: chatId } = useParams();

    useEffect(() => {
        setInitializeWebContainer(true)
    }, [chatId])

    return (
        <>
            <div className="main min-h-screen w-full flex items-center px-2 gap-2 bg-white dark:bg-gray-900">
                <div className="left-bar h-screen w-[30px] text-black dark:text-white py-2">
                    <div className="flex flex-col justify-between h-full">
                        <div className="left-bar-top flex flex-col gap-2">
                            <Link to="/" className="rounded-full size-6 bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-300 flex justify-center items-center">
                                <HomeIcon size={14} />
                            </Link>
                        </div>

                        <div className="left-bar-bottom flex flex-col gap-2">
                            <DarkModeToggleButton />
                        </div>

                    </div>
                </div>
                <div className="flex items-center gap-2 justify-between flex-1">
                    <div className="main-left w-[30%] h-screen py-2">
                        <ChatLayout chatId={chatId!} />
                    </div>
                    <div className="main-right w-[70%] h-screen rounded-lg py-2">
                        <WCWorkspace />
                    </div>
                </div>
            </div>
        </>
    );
};

export default Chat;
