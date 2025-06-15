import { useState, useEffect, useRef } from 'react'
import { WebContainer, type FSWatchCallback } from '@webcontainer/api'
import { type WebContainerFiles } from './types'
import WebContainerContext from './WebContainerContext'

declare global {
    interface Window {
        __webContainer: WebContainer | undefined
    }
}

const WebContainerProvider = ({ children }: { children: React.ReactNode }) => {
    const [webContainer, setWebContainer] = useState<WebContainer | null>(
        window.__webContainer || null
    )
    const [wcFiles, setWcFiles] = useState<WebContainerFiles>({})
    const [error, setError] = useState<string | null>(null)
    const [wcReady, setWcReady] = useState<boolean>(false)
    const [wcServerUrl, setWcServerUrl] = useState<string | undefined>(undefined)
    const [selectedFile, setSelectedFile] = useState<{
        name: string
        contents: string
        path: string
    } | null>(null)
    const [initialMount, setInitialMount] = useState<boolean>(false)
    const [initializeWebContainer, setInitializeWebContainer] = useState<boolean>(false)

    const isMounted = useRef(true)

    useEffect(() => {
        return () => {
            isMounted.current = false
        }
    }, [])

    useEffect(() => {
        if (window.__webContainer) {
            setWebContainer(window.__webContainer)
            setWcReady(true)
            return
        }
        if (webContainer) return

        if (!initializeWebContainer) return

        const initWebContainer = async () => {
            try {
                if (!window.crossOriginIsolated) {
                    throw new Error(
                        'Cross-origin isolation is required for WebContainer. Please ensure your server is configured with the correct headers.'
                    )
                }

                const container = await WebContainer.boot()
                window.__webContainer = container
                if (!isMounted.current) return

                setWebContainer(container)
                setError(null)
                setWcReady(true)

                // Load initial file system tree
                const initialTree = await getFileSystemTree(container)
                if (!isMounted.current) return
                setWcFiles(initialTree)
            } catch (err) {
                console.error('Failed to initialize WebContainer:', err)
                if (!isMounted.current) return
                setError(err instanceof Error ? err.message : 'Failed to initialize WebContainer')
            }
        }

        initWebContainer()
    }, [initializeWebContainer])

    useEffect(() => {
        if (!webContainer) return

        const onServerReady = (_port: number, url: string) => {
            console.log('Server ready', url)
            if (isMounted.current) setWcServerUrl(url)
        }

        const onFsChange = (_event: string, filename?: string) => {
            if (
                typeof filename === 'string' &&
                !filename.startsWith('node_modules') &&
                !filename.startsWith('.vite') &&
                !filename.startsWith('.next') &&
                !filename.startsWith('.git')
            ) {
                // Debounce or throttle could be added here if needed
                getFileSystemTree(webContainer).then((updatedFsTree) => {
                    if (isMounted.current) setWcFiles(updatedFsTree)
                })
            }
        }

        webContainer.on('server-ready', onServerReady)
        webContainer.fs.watch('/', { recursive: true }, onFsChange as FSWatchCallback)

    }, [webContainer])

    async function getFileSystemTree(
        webcontainerInstance: WebContainer,
        path: string = ''
    ): Promise<WebContainerFiles> {
        const tree: WebContainerFiles = {}
        const entries = await webcontainerInstance.fs.readdir(path, {
            withFileTypes: true,
        })

        for (const entry of entries) {
            if (entry.name === 'node_modules') continue
            const fullPath = path ? `${path}/${entry.name}` : entry.name
            if (entry.isDirectory()) {
                tree[entry.name] = {
                    directory: await getFileSystemTree(webcontainerInstance, fullPath),
                }
            } else {
                const contents = await webcontainerInstance.fs.readFile(fullPath, 'utf8')
                tree[entry.name] = { file: { contents } }
            }
        }

        return tree
    }

    const ensureDirectoryExists = async (filePath: string) => {
        const pathParts = filePath.split('/');
        const dirParts = pathParts.slice(0, -1);

        if (dirParts.length === 0) return;

        const dirPath = dirParts.join('/');

        try {
            await webContainer?.fs.mkdir(dirPath, { recursive: true });
        } catch (error: unknown) {
            const fsError = error as { code?: string; message: string };
            if (fsError.code !== 'EEXIST') {
                console.error('Failed to create directory:', fsError);
                throw error;
            }
        }
    };

    return (
        <WebContainerContext.Provider
            value={{
                webContainer,
                setWebContainer,
                wcFiles,
                setWcFiles,
                error,
                wcReady,
                wcServerUrl,
                selectedFile,
                setSelectedFile,
                initialMount,
                setInitialMount,
                ensureDirectoryExists,
                initializeWebContainer,
                setInitializeWebContainer,
            }}
        >
            {children}
        </WebContainerContext.Provider>
    )
}

export default WebContainerProvider
