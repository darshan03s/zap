import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FileDiff, FilePlus2, FolderPlusIcon, ListCollapseIcon, ListTreeIcon, Maximize2, Minimize2, RotateCcw, SquareArrowOutUpRight, SquareTerminal, Trash, X } from 'lucide-react'
import Editor from './editor-and-preview/Editor'
import Preview from './editor-and-preview/Preview'
import FileTree, { type FileTreeRef } from './webcontainer/FileTree'
import { useWebContainer } from './webcontainer/useWebContainer'
import type { WebContainerFiles } from './webcontainer/types'
import XTermTerminal from './terminal/XTermTerminal'
import { useTerminal } from './terminal/useTerminal'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const WCWorkspace = ({ hideChatSection, setHideChatSection }: { hideChatSection: boolean, setHideChatSection: (hideChatSection: boolean) => void }) => {
    const [explorerWidth, setExplorerWidth] = useState(0) // Initial width in pixels
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isCollapsed, setIsCollapsed] = useState(true)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [terminalHeight, setTerminalHeight] = useState(200) // Initial terminal height
    const [isTerminalResizing, setIsTerminalResizing] = useState(false)
    const [tab, setTab] = useState('preview')
    const [filterText, setFilterText] = useState('')
    const fileTreeRef = useRef<FileTreeRef>(null)
    const [deleteTerminal, setDeleteTerminal] = useState(false)
    const [url, setUrl] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const { wcFiles, wcReady, webContainer, wcServerUrl, initialMount, setInitialMount, selectedFile } = useWebContainer()
    const { fitAddon, deleteTerminal: exitTerminal, showTerminal, setShowTerminal } = useTerminal();
    const [showDiff, setShowDiff] = useState(false);

    useEffect(() => {
        if (wcServerUrl) {
            setPreviewUrl(wcServerUrl)
            setUrl(wcServerUrl)
        }
    }, [wcServerUrl])

    useEffect(() => {
        if (webContainer && !initialMount && Object.keys(wcFiles).length !== 0) {
            webContainer.mount(wcFiles as WebContainerFiles).then(() => {
                console.log('Files mounted')
                setInitialMount(true)
            })
        }
    }, [initialMount, webContainer, wcFiles, setInitialMount])

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsResizing(true)
        fitAddon?.fit();
    }, [])

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing || !containerRef.current) return
        fitAddon?.fit();

        const containerRect = containerRef.current.getBoundingClientRect()
        const newWidth = e.clientX - containerRect.left

        // Set minimum and maximum width constraints
        const minWidth = 250
        const maxWidth = containerRect.width * 0.45 // Max 80% of container width

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            setExplorerWidth(newWidth)
        }
    }, [isResizing])

    const handleMouseUp = useCallback(() => {
        setIsResizing(false)
    }, [])

    const handleTerminalMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        setIsTerminalResizing(true)
    }, [])

    const handleTerminalMouseMove = useCallback((e: MouseEvent) => {
        if (!isTerminalResizing || !containerRef.current) return

        const containerRect = containerRef.current.getBoundingClientRect()
        const newHeight = containerRect.bottom - e.clientY

        // Set minimum and maximum height constraints
        const minHeight = 100
        const maxHeight = containerRect.height * 0.8 // Max 80% of container height

        if (newHeight >= minHeight && newHeight <= maxHeight) {
            setTerminalHeight(newHeight)
        }
    }, [isTerminalResizing])

    const handleTerminalMouseUp = useCallback(() => {
        setIsTerminalResizing(false)
    }, [])

    // Add global mouse event listeners
    React.useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = 'col-resize'
            document.body.style.userSelect = 'none'
        } else if (isTerminalResizing) {
            document.addEventListener('mousemove', handleTerminalMouseMove)
            document.addEventListener('mouseup', handleTerminalMouseUp)
            document.body.style.cursor = 'row-resize'
            document.body.style.userSelect = 'none'
        } else {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleTerminalMouseMove)
            document.removeEventListener('mouseup', handleTerminalMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('mousemove', handleTerminalMouseMove)
            document.removeEventListener('mouseup', handleTerminalMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }
    }, [isResizing, isTerminalResizing, handleMouseMove, handleMouseUp, handleTerminalMouseMove, handleTerminalMouseUp])

    const handleCollapseExplorer = () => {
        setIsTransitioning(true)
        setExplorerWidth(isCollapsed ? 250 : 0)
        setIsCollapsed(!isCollapsed)

        setTimeout(() => {
            setIsTransitioning(false)
        }, 300)
    }

    useEffect(() => {
        if (!selectedFile) return;
        setTab('code');
    }, [selectedFile]);

    const handleFilterItems = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setFilterText(value)
    }

    const handleCollapseAll = () => {
        fileTreeRef.current?.collapseAll()
    }

    const handleExpandAll = () => {
        fileTreeRef.current?.expandAll()
    }

    const handleAddFile = () => {
        fileTreeRef.current?.addFile()
    }

    const handleAddFolder = () => {
        fileTreeRef.current?.addFolder()
    }

    const handleDeleteTerminal = () => {
        setDeleteTerminal(true)
        exitTerminal()
    }

    return (
        <div ref={containerRef} className='w-full h-full flex flex-row relative rounded-lg border border-border dark:border-border *:colors-smooth'>
            {/* Explorer Panel */}
            <div
                className={`explorer h-full rounded-r-none flex flex-col hide-scrollbar bg-background dark:bg-background relative rounded-lg ${isTransitioning ? 'transition-all! duration-300! ease-in-out!' : ''}`}
                style={{ width: `${explorerWidth}px`, minWidth: 0 }}
            >
                <div className="explorer-header h-10 flex items-center justify-between px-2 py-2">
                    <button onClick={handleCollapseExplorer}>
                        {isCollapsed ? null : (
                            <ChevronLeft className='w-4 h-4 text-secondary-foreground colors-smooth dark:text-secondary-foreground' />
                        )}
                    </button>
                </div>
                {
                    !isCollapsed && (
                        <div className="explorer-main p-2 flex flex-col flex-1 min-h-0">
                            <div className='flex gap-2 items-center w-full'>
                                <div className="filter-items flex-1 ">
                                    <input type="text" className='w-full h-full outline-none bg-secondary dark:bg-secondary rounded-md p-1 px-2 text-xs text-secondary-foreground dark:text-secondary-foreground colors-smooth' placeholder='Search'
                                        value={filterText}
                                        onChange={handleFilterItems}
                                    />
                                </div>

                                <div className="collapse-expand text-secondary-foreground colors-smooth dark:text-secondary-foreground flex gap-1 items-center select-none">
                                    <button className='p-1 rounded-md hover:bg-secondary dark:hover:bg-secondary colors-smooth'
                                        title='Collapse All'
                                        onClick={handleCollapseAll}
                                    >
                                        <ListCollapseIcon size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-secondary dark:hover:bg-secondary colors-smooth'
                                        title='Expand All'
                                        onClick={handleExpandAll}
                                    >
                                        <ListTreeIcon size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-secondary dark:hover:bg-secondary colors-smooth'
                                        title='Add File'
                                        onClick={handleAddFile}
                                    >
                                        <FilePlus2 size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-secondary dark:hover:bg-secondary colors-smooth'
                                        title='Add Folder'
                                        onClick={handleAddFolder}
                                    >
                                        <FolderPlusIcon size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className='file-tree mt-2 text-sm w-full overflow-y-auto flex-1 min-h-0 hide-scrollbar select-none colors-smooth'>
                                <FileTree ref={fileTreeRef} filterText={filterText} />
                            </div>
                        </div>
                    )
                }

                {/* Right Resize Handle */}
                <div
                    className={`absolute top-0 right-0 h-full cursor-col-resize ${isCollapsed ? '' : 'border'} hover:bg-primary hover:bg-opacity-50 hover:w-1 transition-colors duration-150 ${isResizing ? 'bg-primary bg-opacity-50' : ''
                        }`}
                    onMouseDown={handleMouseDown}
                    title="Drag to resize"
                />
            </div>

            {/* Terminal and Preview */}
            <div
                className={`preview-and-terminal flex-1 ${explorerWidth === 0 ? 'rounded-l-lg' : 'rounded-l-none'} rounded-r-lg h-full bg-background dark:bg-background hide-scrollbar relative flex flex-col ${isTransitioning ? 'transition-all duration-300 ease-in-out' : ''}`}
                style={{ width: `calc(100% - ${explorerWidth}px)` }}
            >

                <div className={`preview-header w-full h-10 bg-secondary dark:bg-secondary flex items-center justify-between px-4 colors-smooth ${isCollapsed ? 'rounded-t-lg' : "rounded-tr-lg"}`}>
                    <div className="preview-header-left flex items-center gap-2 text-xs text-secondary-foreground dark:text-secondary-foreground colors-smooth rounded-lg">
                        {isCollapsed ? (
                            <button onClick={handleCollapseExplorer}>
                                <ChevronRight className='w-4 h-4 text-secondary-foreground colors-smooth dark:text-secondary-foreground' />
                            </button>
                        ) : null}
                        <button onClick={() => setTab('code')}>
                            <span className={`p-1 px-2 colors-smooth rounded-2xl ${tab === 'code' ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' : ''}`}>
                                Code
                            </span>
                        </button>
                        <hr className='h-5 border-l border-gray-300 dark:border-gray-500' />
                        <button onClick={() => setTab('preview')}>
                            <span className={`p-1 px-2 colors-smooth rounded-2xl ${tab === 'preview' ? 'bg-primary text-primary-foreground dark:bg-primary dark:text-primary-foreground' : ''}`}>
                                Preview
                            </span>
                        </button>
                    </div>

                    <div className={`preview-header-center items-center gap-2 flex-1 max-w-[700px] px-4 ${tab === 'preview' ? 'xl:flex' : 'hidden'}`}>
                        <div
                            className={`bg-background dark:bg-background rounded-xl p-1 text-xs text-secondary-foreground dark:text-secondary-foreground focus:outline-none flex-1 h-8 truncate px-2 text-center min-w-0 flex items-center colors-smooth`}>
                            <div className="addressbar-right flex items-center gap-1">
                                <button className={`p-1 rounded-lg hover:bg-secondary dark:hover:bg-secondary colors-smooth flex-shrink-0`}
                                    onClick={() => {
                                        window.open(url || "", "_blank")
                                    }}
                                >
                                    <SquareArrowOutUpRight className='text-secondary-foreground colors-smooth dark:text-secondary-foreground size-4' />
                                </button>
                                <button className={`p-1 rounded-lg hover:bg-secondary dark:hover:bg-secondary colors-smooth flex-shrink-0`}
                                    onClick={() => {
                                        if (wcServerUrl) {
                                            setPreviewUrl(wcServerUrl)
                                        } else {
                                            setPreviewUrl(url)
                                        }
                                    }}
                                >
                                    <RotateCcw className='text-secondary-foreground colors-smooth dark:text-secondary-foreground size-4' />
                                </button>

                                <hr className='h-5 border-l border-gray-400 dark:border-gray-500' />

                            </div>
                            <div className="addressbar-input w-full flex-1">
                                <input type="text" className='w-full h-full outline-none bg-background dark:bg-background rounded-md p-1 px-2 text-xs text-secondary-foreground dark:text-secondary-foreground colors-smooth'
                                    placeholder='URL'
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setPreviewUrl(url)
                                        }
                                    }}
                                />
                            </div>
                        </div>

                    </div>

                    <div className="preview-header-right flex items-center gap-3">
                        {tab === "code" ?
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        onClick={() => {
                                            setShowDiff(!showDiff)
                                        }}
                                    >
                                        <FileDiff className={`size-7 text-muted-foreground colors-smooth dark:text-muted-foreground p-1.5 hover:bg-primary/20 rounded-md ${showDiff ? 'bg-primary/20' : ''}`} />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    Show Diff
                                </TooltipContent>
                            </Tooltip>
                            :
                            null}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        setHideChatSection(!hideChatSection)
                                    }}
                                >
                                    {hideChatSection ? <Minimize2 className={`size-7 text-muted-foreground colors-smooth dark:text-muted-foreground p-1.5 hover:bg-primary/20 rounded-md`} /> : <Maximize2 className={`size-7 text-muted-foreground colors-smooth dark:text-muted-foreground p-1.5 hover:bg-primary/20 rounded-md`} />}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {hideChatSection ? "Show Chat" : "Hide Chat"}
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    disabled={!wcReady}
                                    className='disabled:opacity-50 disabled:cursor-not-allowed! '
                                    onClick={() => {
                                        if (deleteTerminal) {
                                            setDeleteTerminal(false);
                                            setShowTerminal(true);
                                        } else {
                                            setShowTerminal(!showTerminal)
                                        }
                                    }}>
                                    <SquareTerminal className={`size-7 text-muted-foreground colors-smooth dark:text-muted-foreground p-1.5 hover:bg-primary/20 rounded-md ${showTerminal ? 'bg-primary/20' : ''}`} />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {showTerminal ? "Hide Terminal" : "Show Terminal"}
                            </TooltipContent>
                        </Tooltip>
                        <span title='Webcontainer ready status' className={`webcontainer-readt-indicator size-4 rounded-full ${wcReady ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                </div>
                <div className={`preview-and-code flex-1 overflow-y-auto hide-scrollbar`}>
                    <div className={`code ${tab === 'code' ? 'block' : 'hidden'}`}>
                        <Editor explorerWidth={explorerWidth} showDiff={showDiff} />
                    </div>
                    <div className={`preview w-full h-full ${tab === 'preview' ? 'block' : 'hidden'}`}>
                        {wcServerUrl ? <Preview url={previewUrl} /> : <div className='w-full h-full flex items-center justify-center'>
                            <p className='text-secondary-foreground dark:text-secondary-foreground colors-smooth font-bold font-mono text-4xl animate-pulse'>Your preview will appear here</p>
                        </div>}
                    </div>
                </div>

                {deleteTerminal ? null :
                    <>
                        <div
                            className={`${showTerminal ? 'block' : 'hidden'} terminal font-mono border-t border-white/20 w-full absolute bottom-0 right-0 flex flex-col hide-scrollbar`}
                            style={{ height: `${terminalHeight}px` }}
                        >
                            {/* Top Resize Handle */}
                            <div
                                className={`absolute top-0 left-0 w-full h-1 cursor-row-resize bg-transparent hover:bg-primary colors-smooth ${isTerminalResizing ? 'bg-primary/20 bg-opacity-50' : ''
                                    }`}
                                onMouseDown={handleTerminalMouseDown}
                                title="Drag to resize"
                            />

                            <div className="terminal-header border-b border-white/10 bg-black flex items-center justify-between flex-shrink-0">
                                <div className="terminal-header-left py-1 px-2 text-sm font-extrabold text-gray-500 dark:text-gray-400">
                                    JSH
                                </div>

                                <div className="terminal-header-right px-2 flex items-center gap-4">
                                    <button
                                        onClick={handleDeleteTerminal}
                                    >
                                        <Trash className='w-4 h-4 text-red-500/80' />
                                    </button>
                                    <button
                                        onClick={() => setShowTerminal(!showTerminal)}
                                    >
                                        <X className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                                    </button>
                                </div>
                            </div>
                            <div className="terminal-content overflow-y-auto hide-scrollbar flex-1 w-full h-full"
                            >
                                <XTermTerminal />
                            </div>
                        </div>
                    </>
                }
            </div>
        </div>
    )
}

export default WCWorkspace;
