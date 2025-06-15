import Sidebar from "@/components/sidebar";
import { useRootContext } from "@/contexts/root-context";
import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton"
import { Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { v4 as uuidv4 } from "uuid";

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
  return <div className="prompt-container h-[150px] flex flex-col gap-1 bg-gray-200 dark:bg-gray-800 rounded-lg colors-smooth">
    <TextArea handleStartChat={handleStartChat} userPromptText={userPromptText} setUserPromptText={setUserPromptText} />
    <div className="prompt-actions h-10 px-2 flex items-center justify-between">
      <div className="prompt-actions-left flex items-center gap-2">
        <button className="text-black hover:text-gray-500  colors-smooth dark:text-white bg-white dark:bg-gray-900 rounded-full p-2">
          <Paperclip size={16} className="opacity-50" />
        </button>
      </div>

      <div className="prompt-actions-right flex items-center gap-2">
        <button className="send-prompt text-black hover:text-gray-500  colors-smooth dark:text-white bg-white dark:bg-gray-900 rounded-full p-2"
          onClick={() => {
            handleStartChat();
          }}
        >
          <Send size={16} className="opacity-50" />
        </button>
      </div>

    </div>
  </div>
}

const TextArea = ({ handleStartChat, userPromptText, setUserPromptText }: { handleStartChat: () => void, userPromptText: string, setUserPromptText: (text: string) => void }) => {
  return <textarea id="user-prompt-area" className="w-full h-full flex-1 resize-none p-1 px-3 py-3 hide-scrollbar focus:border-none focus:outline-none placeholder:text-sm text-sm text-black dark:text-white" placeholder="Enter your prompt here..."
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
      <header className="flex items-center justify-between p-2 h-[50px] dark:bg-gray-900 dark:text-white bg-gray-300 text-gray-900 px-4  colors-smooth">
        <div className="header-left">
          <Link to="/">
            <span className="logo font-bold text-2xl">
              Zap
            </span>
          </Link>
        </div>
        <div className="header-right">
          <DarkModeToggleButton />
        </div>
      </header>

      <main className="flex-1 flex justify-center items-center dark:bg-gray-900 bg-white  colors-smooth">
        <div className="home-center flex flex-col gap-16 justify-between items-center w-[800px] h-[300px]">
          <div className="home-center-cta">
            <h1 className="text-6xl font-bold dark:text-white text-gray-900  colors-smooth">Create Websites with Zap</h1>
          </div>
          <div className="home-center-prompt-window w-full h-full flex-1">
            <PromptWindow />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home