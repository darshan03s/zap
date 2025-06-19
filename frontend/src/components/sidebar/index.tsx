import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import { EllipsisVertical, PenSquareIcon, PlusIcon, Trash } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useRootContext } from "@/contexts/root-context"
import type { Chat } from "@/contexts/root-context/RootContext"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { useAuth } from "@/features/auth"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

const ChatTab = ({ chat }: { chat: Chat }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [chatTitle, setChatTitle] = useState(chat.title);
    const { session } = useAuth();
    const { setChats } = useRootContext();

    async function renameChat() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/rename`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ chat_id: chat.chat_id, title: chatTitle }),
        });

        if (!response.ok) {
            toast.error("Failed to rename chat");
            return;
        }

        const data = await response.json();

        if (data.errorMessage) {
            toast.error(data.errorMessage);
            return;
        }

        toast.success("Chat renamed successfully");
        setChatTitle(data.title);
        setChats(prevChats => prevChats.map(chat => chat.chat_id === data.chat_id ? data : chat));
    }

    async function deleteChat() {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat/delete`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ chat_id: chat.chat_id }),
        });

        if (!response.ok) {
            toast.error("Failed to delete chat");
            return;
        }

        toast.success("Chat deleted successfully");
        setChats(prevChats => prevChats.filter(c => c.chat_id !== chat.chat_id));
    }

    return (
        <div className={cn(buttonVariants({ variant: "ghost" }), "w-full flex items-center justify-between")}>
            {isRenaming ? (
                <Input
                    value={chatTitle}
                    className="shadow-none border-none h-[28px]"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setChatTitle(e.target.value);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter") {
                            setIsRenaming(false);
                            renameChat();
                        }
                    }}
                />
            ) : (
                <Link
                    to={`/chat/${chat.chat_id}`}
                    className={"flex-1 text-left"}
                >
                    {chatTitle}
                </Link>
            )}
            <Popover>
                <PopoverTrigger asChild>
                    <button
                        className=""
                    >
                        <EllipsisVertical size={16} />
                    </button>
                </PopoverTrigger>
                <PopoverContent
                    align="start"
                    className="w-35 text-sm p-2 rounded-xl"
                >
                    <button
                        className="flex items-center gap-4 hover:bg-muted w-full p-2 rounded-xl px-3"
                        onClick={() => {
                            setIsRenaming(true);
                        }}
                    >
                        <PenSquareIcon size={18} />
                        <span className="">
                            Rename
                        </span>
                    </button>

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <button
                                className="flex items-center gap-4 text-red-500 hover:bg-muted w-full p-2 rounded-xl px-3"
                            >
                                <Trash size={18} />
                                <span className="">
                                    Delete
                                </span>
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure you want to delete the chat</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-red-500 hover:bg-red-600 text-white"
                                    onClick={() => {
                                        deleteChat();
                                    }}
                                >Delete</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </PopoverContent>
            </Popover>
        </div>
    );
};


export default function Sidebar() {
    const { chats, isSidebarOpen, setIsSidebarOpen } = useRootContext();

    return (
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="left" className="w-[300px]">
                <SheetHeader className="pb-0">
                    <SheetTitle className="text-2xl font-bold text-center">Chats</SheetTitle>
                    <Button className="w-full">
                        <PlusIcon className="w-4 h-4" />
                        New Chat
                    </Button>
                    <Separator className="" />
                </SheetHeader>
                <div className="projects-list overflow-y-auto h-full hide-scrollbar px-2 space-y-2">
                    {chats?.map((chat) => (
                        <ChatTab key={chat.chat_id} chat={chat} />
                    ))}
                </div>
                <SheetFooter className="pt-0 flex items-center justify-center">
                    Zap
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
