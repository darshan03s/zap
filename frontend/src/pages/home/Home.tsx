import { useRootContext } from "@/contexts/root-context";
import { ArrowRight, Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text";
import Header from "@/components/header";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { toast } from "sonner";
import { useAuth } from "@/features/auth";

const PromptWindow = () => {
  const newChatId = uuidv4();
  const navigate = useNavigate();
  const [userPromptText, setUserPromptText] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const { setInitialPromptText, setInitialSelectedImages } = useRootContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session, authLoading } = useAuth();

  useEffect(() => {
    if (session && !authLoading) {
      if (localStorage.getItem("initialPromptText")) {
        setUserPromptText(localStorage.getItem("initialPromptText") || "");
        setInitialPromptText(localStorage.getItem("initialPromptText") || "");
        localStorage.removeItem("initialPromptText");
      }
    }
  }, [session, authLoading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedImages(Array.from(files));
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartChat = () => {
    if (!session) {
      localStorage.setItem("initialPromptText", userPromptText);
      navigate("/auth");
      return;
    }
    if (userPromptText.trim() === "") {
      toast.error("Please enter a prompt")
      return;
    }
    setInitialPromptText(userPromptText);
    setInitialSelectedImages(selectedImages);
    navigate(`/chat/${newChatId}`);
  }

  return <div className="prompt-container h-full flex flex-col gap-1 
  dark:bg-secondary dark:text-secondary-foreground bg-secondary text-secondary-foreground colors-smooth
  rounded-3xl relative">
    {selectedImages.length > 0 && (
      <div className="selected-images-preview p-2">
        <div className="flex gap-2 flex-wrap">
          {selectedImages.map((file, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-16 h-16 object-cover rounded-lg border border-border"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    )}
    <TextArea handleStartChat={handleStartChat} userPromptText={userPromptText} setUserPromptText={setUserPromptText} />
    <div className="prompt-actions h-10 px-3 pb-3 flex items-center justify-between">
      <div className="prompt-actions-left flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2"
              onClick={() => {
                fileInputRef.current?.click();
              }}
            >
              <Paperclip size={16} className="" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Add images
          </TooltipContent>
        </Tooltip>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple={true}
          id="file-input"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      <div className="prompt-actions-right flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <button className="send-prompt text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2"
              onClick={() => {
                handleStartChat();
              }}
            >
              <Send size={16} className="" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="center">
            Send prompt
          </TooltipContent>
        </Tooltip>
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
  const { isSidebarOpen, setIsSidebarOpen } = useRootContext();

  return (
    <div className="flex flex-col min-h-screen h-full">
      <div className="sidebar-trigger fixed top-[50%] left-1 h-full z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setIsSidebarOpen(!isSidebarOpen);
              }}
              className="sidebar-trigger-button"
            >
              <ArrowRight size={28} className="text-primary-foreground bg-primary dark:text-primary-foreground dark:bg-primary colors-smooth rounded-full p-2" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" align="center">
            See chats
          </TooltipContent>
        </Tooltip>
      </div>
      <Header />
      <main className="flex-1 flex justify-center items-center dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth">
        <div className="home-center flex flex-col gap-16 justify-between items-center w-[800px] h-[300px] -translate-y-12">
          <div className="home-center-cta space-y-2">
            <h1 className="text-6xl font-sans font-bold dark:bg-background dark:text-foreground bg-background text-foreground colors-smooth text-wrap selection:bg-secondary selection:text-secondary-foreground">
              <AnimatedGradientText speed={1}>
                Create Websites with Zap
              </AnimatedGradientText>
            </h1>
            <p className="text-sm text-muted-foreground text-center">
              <AnimatedShinyText>
                Zap allows you to create websites by prompting AI.
              </AnimatedShinyText>
            </p>
          </div>
          <div className="home-center-prompt-window w-full h-full flex-1 rounded-3xl relative">
            <div className="absolute -inset-2 bg-primary rounded-3xl blur-md opacity-50 dark:opacity-100" />
            <PromptWindow />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Home