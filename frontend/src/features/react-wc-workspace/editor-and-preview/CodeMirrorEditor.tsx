import { useEffect, useState } from 'react';
import CodeMirror, { type Extension } from '@uiw/react-codemirror';
import * as themes from '@uiw/codemirror-themes-all';
import { acceptCompletion, autocompletion } from '@codemirror/autocomplete';
import { EditorView, keymap } from '@codemirror/view';
import { langs } from '@uiw/codemirror-extensions-langs';
import { useDarkMode } from '@/features/dark-mode/useDarkMode';
import { useWebContainer } from '../webcontainer/useWebContainer';
import { mapExtToLanguage } from './utils';

const CodeMirrorEditor = () => {
    const { selectedFile, webContainer } = useWebContainer();
    const [value, setValue] = useState("");
    const [language, setLanguage] = useState<string>("");

    useEffect(() => {
        if (!selectedFile) return;
        const language = mapExtToLanguage(selectedFile?.name.split(".").pop() || "");
        const value = selectedFile?.contents || ``;
        setLanguage(language);
        setValue(value);
    }, [selectedFile]);


    const extensions = [
        // Languages
        langs.tsx(),
        langs.jsx(),
        langs.javascript(),
        langs.typescript(),
        langs.html(),
        langs.css(),
        langs.json(),
        langs.yaml(),
        langs.markdown(),
        langs.xml(),
        langs.sass(),
        langs.python(),
        // Features
        autocompletion({
            closeOnBlur: false,
            defaultKeymap: true,
            icons: true
        }),
        keymap.of([
            { key: 'Tab', run: acceptCompletion }
        ]),
        EditorView.lineWrapping,
    ];

    const lightTheme = themes.vscodeLight;
    const darkTheme = themes.aura;

    const { isDarkMode } = useDarkMode();
    const [theme, setTheme] = useState<"light" | "dark" | "none" | Extension>(isDarkMode ? darkTheme : lightTheme);

    useEffect(() => {
        setTheme(isDarkMode ? darkTheme : lightTheme);
    }, [isDarkMode, lightTheme, darkTheme]);

    const onChange = (val: string) => {
        setValue(val || "");
        if (selectedFile) {
            webContainer?.fs.writeFile(selectedFile.path, val || "");
        }
    };

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