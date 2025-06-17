import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowRight, EllipsisVertical, PenSquareIcon, PlusIcon, Trash } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import { useRootContext } from "@/contexts/root-context"
import type { Chat } from "@/contexts/root-context/RootContext"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

const ChatTab = ({ chat }: { chat: Chat }) => {
    return (
        <div className={cn(buttonVariants({ variant: "ghost" }), "w-full flex items-center justify-between")}>
            <Link
                to={`/chat/${chat.chat_id}`}
                className={"flex-1 text-left"}
            >
                {chat.title}
            </Link>
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
                    >
                        <PenSquareIcon size={18} />
                        <span className="">
                            Rename
                        </span>
                    </button>
                    <button
                        className="flex items-center gap-4 text-red-500 hover:bg-muted w-full p-2 rounded-xl px-3"
                    >
                        <Trash size={18} />
                        <span className="">
                            Delete
                        </span>
                    </button>
                </PopoverContent>
            </Popover>
        </div>
    );
};


export default function Sidebar() {
    const { chats } = useRootContext();

    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="sidebar-trigger fixed top-[50%] left-1 h-full z-50">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="sidebar-trigger-button">
                                <ArrowRight size={28} className="text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" align="center">
                            See chats
                        </TooltipContent>
                    </Tooltip>
                </div>
            </SheetTrigger>
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
