import { AvatarFallback, AvatarImage, Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth';
import { Link, useNavigate } from 'react-router-dom';
import { DarkModeToggleButton } from '@/features/dark-mode';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import type { Session } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import supabase from '@/lib/supabase';
import { Button, buttonVariants } from '@/components/ui/button';
import { LogOutIcon, SettingsIcon, LogInIcon } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import Logo from '@/components/logo';

const SignInButton = () => {
    const navigate = useNavigate();
    return <button
        onClick={() => {
            navigate("/auth");
        }}
        className="text-accent-foreground bg-accent dark:text-accent-foreground dark:bg-accent colors-smooth rounded-full px-3 p-2 text-sm flex items-center gap-2"
    >
        <LogInIcon className='w-4 h-4' />
        Sign In
    </button>
}

const UserButton = ({ session }: { session: Session }) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Avatar className="cursor-pointer size-8">
                    <AvatarImage
                        src={session.user.user_metadata.avatar_url}
                    />
                    <AvatarFallback className="select-none dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth">
                        {session.user.user_metadata.name?.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </PopoverTrigger>
            <PopoverContent className={cn("w-70 overflow-y-auto hide-scrollbar p-3 py-4")} align='end'>
                <div className='user-menu space-y-3 w-full'>
                    <div className='user-menu-header w-full flex items-center gap-4'>
                        <Avatar className="size-10">
                            <AvatarImage
                                src={session.user.user_metadata.avatar_url}
                            />
                            <AvatarFallback className="select-none dark:bg-accent dark:text-accent-foreground bg-accent text-accent-foreground colors-smooth">
                                {session.user.user_metadata.name?.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                        <div className='flex flex-col'>
                            <span className='text-sm font-medium'>
                                {session.user.user_metadata.name}
                            </span>
                            <span className='text-xs text-muted-foreground'>
                                {session.user.email}
                            </span>
                        </div>
                    </div>
                    <Separator />
                    <div className='user-menu-actions w-full flex flex-col gap-4'>
                        <Link to="/settings"
                            className={cn(buttonVariants({ variant: 'outline' }), "w-full border-none")}>
                            <SettingsIcon className='w-4 h-4' />
                            Settings
                        </Link>
                        <Button
                            className={cn("w-full border-none flex items-center gap-2")}
                            variant="default"
                            onClick={() => {
                                supabase.auth.signOut();
                            }}>
                            <LogOutIcon className='w-4 h-4' />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>);
}

const Header = () => {
    const { session, authLoading } = useAuth();

    return (
        <header className="flex items-center justify-between p-2 h-[60px] dark:bg-background dark:text-foreground bg-background text-foreground px-4 colors-smooth">
            <div className="header-left">
                <Link to="/">
                    <Logo />
                </Link>
            </div>
            <div className="header-right flex items-center gap-2">
                <div className="auth">
                    {authLoading ? <div className="w-8 h-8 bg-accent rounded-full animate-pulse" /> : session ? <UserButton session={session} /> : <SignInButton />}
                </div>
                <DarkModeToggleButton />
            </div>
        </header>
    );
}

export default Header;