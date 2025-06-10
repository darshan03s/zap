import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
import WCWorkspace from "@/features/react-wc-workspace";
import { MoveUp, Paperclip } from "lucide-react";
import { useState } from "react";
const Home = () => {
  const [userPrompt, setUserPrompt] = useState("");
  const [chatContent, setChatContent] = useState("");

  const handleSendPrompt = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: userPrompt }),
        }
      );

      setUserPrompt("");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported");
      }

      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setChatContent((chatContent) => chatContent + chunk);
      }

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <div
        className="header bg-gray-100 dark:bg-gray-900 dark:text-white flex items-center justify-between px-2 w-full h-[40px]">
        <div className="header-left"></div>
        <div className="header-right">
          <DarkModeToggleButton />
        </div>
      </div>
      <div className="main min-h-[calc(100vh-40px)] w-full flex items-center gap-4 justify-between px-8 py-4 bg-white dark:bg-gray-900">
        <div className="main-left w-[30%] h-[600px] flex flex-col gap-2 rounded-lg text-black dark:text-white">
          <div className="chat h-[450px] flex flex-col border border-gray-200 dark:border-gray-800">
            <div className="chat-header flex items-center justify-center h-[30px] border-b border-gray-200 dark:border-gray-800">
              <h1>Chat</h1>
            </div>

            <div className="chat-content flex-1 overflow-y-auto break-words p-2 hide-scrollbar text-sm">
              {chatContent}
            </div>
          </div>

          <div className="prompt-container flex-1 flex flex-col gap-1 border border-gray-200 dark:border-gray-800">
            <textarea id="user-prompt-area" className="w-full h-full flex-1 resize-none p-1 hide-scrollbar focus:border-none focus:outline-none placeholder:text-sm text-sm" placeholder="Enter your prompt here..."
              onChange={(e) => setUserPrompt(e.target.value)}
              value={userPrompt}
            ></textarea>
            <div className="prompt-actions h-10 px-2 flex items-center justify-between">
              <button className="text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-black rounded-full p-2">
                <Paperclip size={16} />
              </button>

              <button className="send-prompt text-gray-500 hover:text-gray-700 bg-gray-200 dark:bg-black rounded-full p-2"
                onClick={() => {
                  handleSendPrompt();
                }}
              >
                <MoveUp size={16} />
              </button>
            </div>
          </div>
        </div>
        <div className="main-right w-[70%] h-[600px] rounded-lg">
          <WCWorkspace />
        </div>
      </div>
    </>
  );
};

export default Home;
