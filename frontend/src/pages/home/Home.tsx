import Sidebar from "@/components/sidebar";
import { useRootContext } from "@/contexts/root-context";
import { Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import Header from "@/components/header";

const PromptWindow = () => {
  const newChatId = uuidv4();
  const navigate = useNavigate();
  const [userPromptText, setUserPromptText] = useState("");
  const { setInitialPromptText } = useRootContext();

  const handleStartChat = () => {
    if (userPromptText.trim() === "") {
      return;
    }
    setInitialPromptText(userPromptText);
    navigate(`/chat/${newChatId}`);
  }
  return <div className="prompt-container h-[150px] flex flex-col gap-1 
  dark:bg-secondary dark:text-secondary-foreground bg-secondary text-secondary-foreground colors-smooth
  rounded-3xl">
    <TextArea handleStartChat={handleStartChat} userPromptText={userPromptText} setUserPromptText={setUserPromptText} />
    <div className="prompt-actions h-10 px-3 pb-3 flex items-center justify-between">
      <div className="prompt-actions-left flex items-center gap-2">
        <button className="text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2
        ">
          <Paperclip size={16} className="" />
        </button>
      </div>

      <div className="prompt-actions-right flex items-center gap-2">
        <button className="send-prompt text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2"
          onClick={() => {
            handleStartChat();
          }}
        >
          <Send size={16} className="" />
        </button>
      </div>

    </div>
  </div>
}

const TextArea = ({ handleStartChat, userPromptText, setUserPromptText }: { handleStartChat: () => void, userPromptText: string, setUserPromptText: (text: string) => void }) => {
  return <textarea id="user-prompt-area" className="w-full h-full flex-1 resize-none px-4 py-4 mb-2 hide-scrollbar focus:border-none focus:outline-none placeholder:text-sm text-sm"
    placeholder="Enter your prompt here... (For example: 'Create a todo app')"
    onChange={(e) => setUserPromptText(e.target.value)}
    value={userPromptText}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleStartChat();
      }
    }}
  ></textarea>
}

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen h-full">
      <Sidebar />
      <Header />
      <main className="flex-1 flex justify-center items-center dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth">
        <div className="home-center flex flex-col gap-16 justify-between items-center w-[800px] h-[300px]">
          <div className="home-center-cta">
            <h1 className="text-6xl font-sans font-bold dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth text-wrap">
              <AnimatedGradientText speed={1}>
                Create Websites with Zap
              </AnimatedGradientText>
            </h1>
          </div>
          <div className="home-center-prompt-window w-full h-[150px] flex-1 rounded-3xl">
            <PromptWindow />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home