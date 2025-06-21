import { useEffect, useState } from 'react';
import CodeMirror, { type Extension } from '@uiw/react-codemirror';
import * as themes from '@uiw/codemirror-themes-all';
import { acceptCompletion, autocompletion } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { langs } from '@uiw/codemirror-extensions-langs';
import { useTheme } from '@/features/theme';
import { useWebContainer } from '../webcontainer/useWebContainer';
import { mapExtToLanguage } from './utils';
import CodeMirrorMerge from 'react-codemirror-merge';
import './cmStyles.css';

const Original = CodeMirrorMerge.Original;
const Modified = CodeMirrorMerge.Modified;

const CodeMirrorEditor = ({ showDiff }: { showDiff: boolean }) => {
    const { selectedFile, webContainer } = useWebContainer();
    const [value, setValue] = useState("");
    const [language, setLanguage] = useState<string>("");
    const { theme: currentTheme } = useTheme();
    const lightTheme = themes.vscodeLight;
    const darkTheme = themes.aura;
    const [theme, setTheme] = useState<"light" | "dark" | "none" | Extension>(currentTheme === "dark" ? darkTheme : lightTheme);
    const originalContent = selectedFile?.contents || ``;

    useEffect(() => {
        if (!selectedFile) return;
        const language = mapExtToLanguage(selectedFile?.name.split(".").pop() || "");
        const value = selectedFile?.contents || ``;
        setLanguage(language);
        setValue(value);
    }, [selectedFile]);


    const getLanguageExtension = () => {
        switch (language) {
            case 'tsx':
                return langs.tsx();
            case 'jsx':
                return langs.jsx();
            case 'javascript':
                return langs.javascript();
            case 'typescript':
                return langs.typescript();
            case 'html':
                return langs.html();
            case 'css':
                return langs.css();
            case 'json':
                return langs.json();
            case 'yaml':
                return langs.yaml();
            case 'markdown':
                return langs.markdown();
            case 'xml':
                return langs.xml();
            case 'sass':
                return langs.sass();
            case 'python':
                return langs.python();
            default:
                return langs.javascript();
        }
    };

    const extensions = [
        getLanguageExtension(),
        autocompletion({
            closeOnBlur: false,
            defaultKeymap: true,
            icons: true,
        }),
        keymap.of([{ key: 'Tab', run: acceptCompletion }]),
        EditorView.lineWrapping,
    ];

    useEffect(() => {
        setTheme(currentTheme === "dark" ? darkTheme : lightTheme);
    }, [currentTheme, lightTheme, darkTheme]);

    const onChange = (val: string) => {
        setValue(val || "");
        if (selectedFile) {
            webContainer?.fs.writeFile(selectedFile.path, val || "");
        }
    };

    if (showDiff) {
        return <CodeMirrorMerge theme={theme} orientation="a-b">
            <Original
                readOnly={true}
                value={originalContent}
                extensions={extensions}
                basicSetup={{
                    autocompletion: true,
                    lineNumbers: true,
                    foldGutter: true,
                    allowMultipleSelections: true,
                    syntaxHighlighting: true,
                }}
            />
            <Modified
                readOnly={true}
                value={value}
                extensions={extensions}
            />
        </CodeMirrorMerge>
    }

    return <CodeMirror
        className='text-sm'
        value={value}
        height="600px"
        extensions={extensions}
        onChange={onChange}
        lang={language}
        basicSetup={{
            autocompletion: true,
            lineNumbers: true,
            foldGutter: true,
            allowMultipleSelections: true,
            syntaxHighlighting: true,
        }}
        theme={theme} />;
}

export default CodeMirrorEditor;