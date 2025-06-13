import { useWebContainer } from "../webcontainer/useWebContainer";
import CodeMirrorEditor from "./CodeMirrorEditor";

const Editor = ({ explorerWidth }: { explorerWidth: number }) => {
    const { selectedFile } = useWebContainer();

    return (
        <div className="editor-container h-full flex flex-col">
            <div className="editor-header sticky top-0 z-10 bg-white dark:bg-gray-900">
                {selectedFile ?
                    <>
                        <div className="flex flex-col h-full">
                            <div className="editor-header bg-gray-100 dark:bg-gray-900 h-6 flex items-center justify-between px-2 dark:text-gray-200 text-black text-xs font-mono">
                                {selectedFile.path}
                            </div>
                        </div>
                        <div className={`editor-content overflow-auto flex-1 ${explorerWidth >= 250 ? 'rounded-br-lg' : 'rounded-br-lg rounded-bl-lg'}`}>
                            <CodeMirrorEditor />
                        </div>
                    </>
                    :
                    null
                }
            </div>


        </div>
    );
};

export default Editor;