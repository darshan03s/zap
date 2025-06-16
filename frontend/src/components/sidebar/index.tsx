import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowRight, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipTrigger } from "../ui/tooltip"
import { TooltipContent } from "@radix-ui/react-tooltip"

export default function Sidebar() {
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
                        <TooltipContent side="right" align="center" className="tooltip-content">
                            See chats
                        </TooltipContent>
                    </Tooltip>
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
                <SheetHeader className="">
                    <SheetTitle className="text-2xl font-bold text-center">Chats</SheetTitle>
                    <Button className="w-full">
                        <PlusIcon className="w-4 h-4" />
                        New Chat
                    </Button>
                    <Separator className="" />
                </SheetHeader>
                <div className="projects-list overflow-y-auto h-full hide-scrollbar px-2">
                </div>
                <SheetFooter>
                    <div className="flex items-center justify-center gap-4">
                        Zap
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
