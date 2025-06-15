import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

export default function Sidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <div className="sidebar-trigger fixed top-[50%] left-1 h-full z-50">
                    <button className="sidebar-trigger-button">
                        <ArrowRight size={28} className="dark:text-white dark:bg-gray-800 text-black bg-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700  colors-smooth rounded-full p-2" />
                    </button>
                </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px]">
                <SheetHeader className="">
                    <SheetTitle className="text-2xl font-bold text-center">Projects</SheetTitle>
                    <Button className="w-full">New Project</Button>
                    <Separator className="" />
                </SheetHeader>
                <div className="projects-list overflow-y-auto h-full hide-scrollbar px-2">
                    
                </div>
                <SheetFooter>
                    <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>CN</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <p className="text-sm font-medium">John Doe</p>
                            <p className="text-xs text-gray-500">john.doe@example.com</p>
                        </div>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}
