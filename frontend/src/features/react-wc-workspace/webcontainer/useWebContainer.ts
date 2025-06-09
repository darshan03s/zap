import { useContext } from "react"
import WebContainerContext from "./WebContainerContext"

export const useWebContainer = () => {
    const context = useContext(WebContainerContext)
    if (!context) {
        throw new Error('useWebContainer must be used within a WebContainerProvider')
    }
    return context
}