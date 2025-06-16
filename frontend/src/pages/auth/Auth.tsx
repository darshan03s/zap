import { useAuth } from "@/features/auth";

const Auth = () => {
    const { signInWithGoogle } = useAuth();
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <button
                onClick={signInWithGoogle}
                className="text-accent-foreground bg-accent dark:text-accent-foreground dark:bg-accent colors-smooth rounded-full px-4 p-2 text-lg flex items-center gap-2"
            >
                Sign in with Google
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="icon icon-tabler icons-tabler-filled icon-tabler-brand-google"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 2a9.96 9.96 0 0 1 6.29 2.226a1 1 0 0 1 .04 1.52l-1.51 1.362a1 1 0 0 1 -1.265 .06a6 6 0 1 0 2.103 6.836l.001 -.004h-3.66a1 1 0 0 1 -.992 -.883l-.007 -.117v-2a1 1 0 0 1 1 -1h6.945a1 1 0 0 1 .994 .89c.04 .367 .061 .737 .061 1.11c0 5.523 -4.477 10 -10 10s-10 -4.477 -10 -10s4.477 -10 10 -10z" /></svg>
            </button>
        </div>
    )
}

export default Auth;