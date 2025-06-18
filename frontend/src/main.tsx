import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "@/App";
import "@/index.css";
import { DarkModeProvider } from "@/features/dark-mode";
import WebContainerProvider from "@/features/react-wc-workspace/webcontainer/WebContainerProvider";
import TerminalProvider from "@/features/react-wc-workspace/terminal/TerminalProvider";
import { RootProvider } from "@/contexts/root-context";
import AuthProvider from "./features/auth/AuthProvider";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <AuthProvider>
      <RootProvider>
        <DarkModeProvider>
          <WebContainerProvider>
            <TerminalProvider>
              <App />
            </TerminalProvider>
          </WebContainerProvider>
        </DarkModeProvider>
      </RootProvider>
    </AuthProvider>
  </BrowserRouter>
);
