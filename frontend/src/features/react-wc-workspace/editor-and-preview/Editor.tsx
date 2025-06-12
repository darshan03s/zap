import { useWebContainer } from "../webcontainer/useWebContainer";
import CodeMirrorEditor from "./CodeMirrorEditor";

const Editor = () => {
    const { selectedFile } = useWebContainer();

    return (
        <div className="w-full h-full">
            {selectedFile ?
                <CodeMirrorEditor />
                :
                null
            }
        </div>
    );
};

export default Editor;