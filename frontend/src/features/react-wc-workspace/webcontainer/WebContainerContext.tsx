import type { WebContainer } from "@webcontainer/api"
import { createContext } from "react"
import type { WebContainerFiles } from "./types"

const WebContainerContext = createContext<{
    webContainer: WebContainer | null
    setWebContainer: (webContainer: WebContainer | null) => void
    wcFiles: WebContainerFiles
    setWcFiles: (wcFiles: WebContainerFiles) => void
    error: string | null
    wcReady: boolean
    wcServerUrl: string | undefined
    initialMount: boolean
    setInitialMount: (initialMount: boolean) => void
    selectedFile: {
        name: string
        contents: string
        path: string
    } | null
    setSelectedFile: (selectedFile: {
        name: string
        contents: string
        path: string
    } | null) => void
}>({
    webContainer: null,
    setWebContainer: () => { },
    wcFiles: {},
    setWcFiles: () => { },
    error: null,
    wcReady: false,
    wcServerUrl: undefined,
    initialMount: false,
    setInitialMount: () => { },
    selectedFile: null,
    setSelectedFile: () => { }
})

export default WebContainerContext;