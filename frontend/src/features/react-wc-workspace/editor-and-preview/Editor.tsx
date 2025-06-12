import { Editor as MonacoEditor } from '@monaco-editor/react';
import { useWebContainer } from '../webcontainer/useWebContainer';
import { useState, useEffect } from 'react';
import { useDarkMode } from '@/features/dark-mode/useDarkMode';
import { mapExtToLanguage } from './utils';

const Editor = () => {
    const { selectedFile, webContainer } = useWebContainer();
    const [language, setLanguage] = useState<string>("plaintext");
    const [value, setValue] = useState<string>("");
    const { isDarkMode } = useDarkMode();

    function handleEditorChange(value: string | undefined) {
        setValue(value || "");
        if (selectedFile) {
            webContainer?.fs.writeFile(selectedFile.path, value || "");
        }
    }

    useEffect(() => {
        if (!selectedFile) return;
        const language = mapExtToLanguage(selectedFile?.name.split(".").pop() || "plaintext");
        const value = selectedFile?.contents || ``;
        setLanguage(language);
        setValue(value);
    }, [selectedFile]);

    return (
        <div className="w-full h-full">
            <MonacoEditor
                key={selectedFile?.name}
                height={'100vh'}
                language={language}
                theme={isDarkMode ? 'vs-dark' : 'vs'}
                onChange={handleEditorChange}
                value={value}
                path={selectedFile?.path}
                options={{
                    wordWrap: "on",
                    suggest: {
                        showKeywords: true,
                        showSnippets: true,
                    },
                    quickSuggestions: {
                        other: true,
                        comments: true,
                        strings: true,
                    },
                    wordBasedSuggestions: "allDocuments",
                    parameterHints: { enabled: true },
                    fontFamily: "Cascadia Code",
                }}
            />
        </div>
    );
};

export default Editor;