export default `
<starter_template>
    <file path=".gitignore">
        # Logs
        logs
        *.log
        npm-debug.log*
        yarn-debug.log*
        yarn-error.log*
        pnpm-debug.log*
        lerna-debug.log*
        
        node_modules
        dist
        dist-ssr
        *.local
        
        # Editor directories and files
        .vscode/*
        !.vscode/extensions.json
        .idea
        .DS_Store
        *.suo
        *.ntvs*
        *.njsproj
        *.sln
        *.sw?
        
        .env
    </file>
    <file path="eslint.config.js">
        import js from '@eslint/js'
        import globals from 'globals'
        import reactHooks from 'eslint-plugin-react-hooks'
        import reactRefresh from 'eslint-plugin-react-refresh'
        import tseslint from 'typescript-eslint'
        
        export default tseslint.config(
          { ignores: ['dist'] },
          {
            extends: [js.configs.recommended, ...tseslint.configs.recommended],
            files: ['**/*.{ts,tsx}'],
            languageOptions: {
              ecmaVersion: 2020,
              globals: globals.browser,
            },
            plugins: {
              'react-hooks': reactHooks,
              'react-refresh': reactRefresh,
            },
            rules: {
              ...reactHooks.configs.recommended.rules,
              'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
              ],
              '@typescript-eslint/no-explicit-any': 'warn'
            },
          },
        )
        
    </file>
    <file path="index.html">
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <link rel="icon" type="image/svg+xml" href="/vite.svg" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Vite + React + TS</title>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="/src/main.tsx"></script>
          </body>
        </html>
        
    </file>
    <file path="package.json">
        {
          "name": "reacttsx",
          "private": true,
          "version": "0.0.0",
          "type": "module",
          "scripts": {
            "dev": "vite",
            "build": "tsc -b && vite build",
            "lint": "eslint .",
            "preview": "vite preview"
          },
          "dependencies": {
            "@tailwindcss/vite": "^4.1.10",
            "lucide-react": "^0.514.0",
            "react": "^19.1.0",
            "react-dom": "^19.1.0",
            "react-router-dom": "^7.6.2",
            "tailwindcss": "^4.1.10"
          },
          "devDependencies": {
            "@eslint/js": "^9.25.0",
            "@types/node": "^24.0.1",
            "@types/react": "^19.1.2",
            "@types/react-dom": "^19.1.2",
            "@vitejs/plugin-react": "^4.4.1",
            "eslint": "^9.25.0",
            "eslint-plugin-react-hooks": "^5.2.0",
            "eslint-plugin-react-refresh": "^0.4.19",
            "globals": "^16.0.0",
            "typescript": "~5.8.3",
            "typescript-eslint": "^8.30.1",
            "vite": "^6.3.5"
          }
        }
        
    </file>
    <file path="public/vite.svg">
        // constent not included for brevity
    </file>
    <file path="src/App.tsx">
        import { Routes, Route } from "react-router-dom";
        import Home from "@/pages/Home";
        
        const App = () => {
          return (
            <>
              <Routes>
                <Route path="/" element={<Home />} />
              </Routes>
            </>
          );
        };
        
        export default App;
        
    </file>
    <file path="src/assets/react.svg">
        // constent not included for brevity
    </file>
    <file path="src/features/dark-mode/DarkModeContext.ts">
        import { createContext } from "react";
        
        type DarkModeContextType = {
            isDarkMode: boolean;
            toggleDarkMode: () => void;
            setDarkMode: (value: boolean) => void;
        };
        
        export const DarkModeContext = createContext<DarkModeContextType | undefined>(
            undefined
        );
    </file>
    <file path="src/features/dark-mode/DarkModeProvider.tsx">
        import { useEffect, useState, type ReactNode } from "react";
        import { DarkModeContext } from "./DarkModeContext";
        
        const DARK_MODE_STORAGE_KEY = "theme";
        
        function getInitialDarkMode(): boolean {
          if (typeof window === "undefined") return false; // SSR fallback
          const stored = localStorage.getItem(DARK_MODE_STORAGE_KEY);
          if (stored !== null) return stored === "dark";
          return false;
        }
        
        function applyTheme(isDark: boolean) {
          const html = document.documentElement;
          if (isDark) {
            html.setAttribute("class", "dark");
          } else {
            html.classList.remove("dark");
          }
        }
        
        export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
          const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);
        
          useEffect(() => {
            applyTheme(isDarkMode);
            localStorage.setItem(DARK_MODE_STORAGE_KEY, isDarkMode ? "dark" : "light");
          }, [isDarkMode]);
        
          const toggleDarkMode = () => setIsDarkMode((prev) => !prev);
          const setDarkMode = (value: boolean) => setIsDarkMode(value);
        
          return (
            <DarkModeContext.Provider
              value={{ isDarkMode, toggleDarkMode, setDarkMode }}
            >
              {children}
            </DarkModeContext.Provider>
          );
        };
        
    </file>
    <file path="src/features/dark-mode/DarkModeToggleButton.tsx">
        import { useDarkMode } from "./useDarkMode";
        import { Moon, Sun } from "lucide-react";
        
        const DarkModeToggleButton = () => {
          const { isDarkMode, toggleDarkMode } = useDarkMode();
          return (
            <button
              onClick={toggleDarkMode}
              type="button"
              className="rounded-full size-8 bg-black text-white dark:bg-white dark:text-black flex justify-center items-center"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          );
        };
        
        export default DarkModeToggleButton;
        
    </file>
    <file path="src/features/dark-mode/useDarkMode.ts">
        import { useContext } from "react";
        import { DarkModeContext } from "./DarkModeContext";
        
        export function useDarkMode() {
            const context = useContext(DarkModeContext);
            if (!context)
                throw new Error("useDarkMode must be used within a DarkModeProvider");
            return context;
        }
    </file>
    <file path="src/index.css">
        @import "tailwindcss";
        
        @custom-variant dark (&:where(.dark, .dark *));
        
        button,
        a {
          cursor: pointer;
        }
        
        .hide-scrollbar {
          scrollbar-width: none;
        }
        
    </file>
    <file path="src/main.tsx">
        import { createRoot } from "react-dom/client";
        import { BrowserRouter } from "react-router-dom";
        import App from "@/App";
        import "@/index.css";
        import { DarkModeProvider } from "@/features/dark-mode/DarkModeProvider";
        
        createRoot(document.getElementById("root")!).render(
          <BrowserRouter>
            <DarkModeProvider>
              <App />
            </DarkModeProvider>
          </BrowserRouter>
        );
        
    </file>
    <file path="src/pages/Home.tsx">
        import DarkModeToggleButton from "@/features/dark-mode/DarkModeToggleButton";
        
        const Home = () => {
          return (
            <>
              <div className="fixed bottom-4 left-4">
                <DarkModeToggleButton />
              </div>
              <div className="flex flex-col gap-4 items-center justify-center min-h-screen h-full dark:bg-black">
                <h1 className="text-4xl font-bold dark:text-white">Home</h1>
              </div>
            </>
          );
        };
        
        export default Home;
        
    </file>
    <file path="src/utils/utils.ts">
        export const isDevMode = () => import.meta.env.DEV;
        
        export const devLog = (...args: any[]) => {
            if (isDevMode()) {
                console.log(...args);
            }
        };
        
        export const devError = (...args: any[]) => {
            if (isDevMode()) {
                console.error(...args);
            }
        };
        
    </file>
    <file path="src/vite-env.d.ts">
        /// <reference types="vite/client" />
        
    </file>
    <file path="tsconfig.app.json">
        {
          "compilerOptions": {
            "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.app.tsbuildinfo",
            "target": "ES2020",
            "useDefineForClassFields": true,
            "lib": [
              "ES2020",
              "DOM",
              "DOM.Iterable"
            ],
            "module": "ESNext",
            "skipLibCheck": true,
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": true,
            "verbatimModuleSyntax": true,
            "moduleDetection": "force",
            "noEmit": true,
            "jsx": "react-jsx",
            "strict": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "erasableSyntaxOnly": true,
            "noFallthroughCasesInSwitch": true,
            "noUncheckedSideEffectImports": true,
            "baseUrl": ".",
            "paths": {
              "@/*": [
                "./src/*"
              ]
            }
          },
          "include": [
            "src"
          ]
        }
        
    </file>
    <file path="tsconfig.json">
        {
          "files": [],
          "references": [
            {
              "path": "./tsconfig.app.json"
            },
            {
              "path": "./tsconfig.node.json"
            }
          ],
          "compilerOptions": {
            "baseUrl": ".",
            "paths": {
              "@/*": [
                "./src/*"
              ]
            }
          }
        }
        
    </file>
    <file path="tsconfig.node.json">
        {
          "compilerOptions": {
            "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.node.tsbuildinfo",
            "target": "ES2022",
            "lib": ["ES2023"],
            "module": "ESNext",
            "skipLibCheck": true,
        
            /* Bundler mode */
            "moduleResolution": "bundler",
            "allowImportingTsExtensions": true,
            "verbatimModuleSyntax": true,
            "moduleDetection": "force",
            "noEmit": true,
        
            /* Linting */
            "strict": true,
            "noUnusedLocals": true,
            "noUnusedParameters": true,
            "erasableSyntaxOnly": true,
            "noFallthroughCasesInSwitch": true,
            "noUncheckedSideEffectImports": true
          },
          "include": ["vite.config.ts"]
        }
        
    </file>
    <file path="vite.config.ts">
        import { defineConfig } from 'vite'
        import tailwindcss from '@tailwindcss/vite'
        import react from "@vitejs/plugin-react";
        import path from 'path'
        import { fileURLToPath } from 'url'
        
        const __filename = fileURLToPath(import.meta.url as string)
        const __dirname = path.dirname(__filename)
        
        export default defineConfig({
            plugins: [
                react(),
                tailwindcss(),
            ],
            resolve: {
                alias: {
                    "@": path.resolve(__dirname, "src"),
                },
            },
        })
        
    </file>
</files>

`;
