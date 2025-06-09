import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, FilePlus2, FolderPlusIcon, ListCollapseIcon, ListTreeIcon, RotateCcw, SquareArrowOutUpRight, SquareTerminal, Trash, X } from 'lucide-react'
import Editor from './editor-and-preview/Editor'
import Preview from './editor-and-preview/Preview'
import FileTree, { type FileTreeRef } from './webcontainer/FileTree'
import { useWebContainer } from './webcontainer/useWebContainer'
import type { WebContainerFiles } from './webcontainer/types'
import XTermTerminal from './terminal/XTermTerminal'
import { useTerminal } from './terminal/useTerminal'

const WCWorkspace = () => {
    const [explorerWidth, setExplorerWidth] = useState(250) // Initial width in pixels
    const [isResizing, setIsResizing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const [terminalHeight, setTerminalHeight] = useState(200) // Initial terminal height
    const [isTerminalResizing, setIsTerminalResizing] = useState(false)
    const [showTerminal, setShowTerminal] = useState(false)
    const [showCode, setShowCode] = useState(true)
    const [filterText, setFilterText] = useState('')
    const fileTreeRef = useRef<FileTreeRef>(null)
    const [deleteTerminal, setDeleteTerminal] = useState(false)
    const [url, setUrl] = useState('')
    const [previewUrl, setPreviewUrl] = useState('')
    const { wcFiles, wcReady, webContainer, wcServerUrl, initialMount, setInitialMount } = useWebContainer()
    const { fitAddon } = useTerminal();

    useEffect(() => {
        if (wcServerUrl) {
            setPreviewUrl(wcServerUrl)
            setUrl(wcServerUrl)
        }
    }, [wcServerUrl])

    useEffect(() => {
        if (webContainer && !initialMount) {
            webContainer.mount(wcFiles as WebContainerFiles).then(() => {
                console.log('Files mounted')
                setInitialMount(true)
            })
        }
    }, [initialMount])

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

    return (
        <div ref={containerRef} className='w-full h-full flex flex-row relative rounded-lg border border-gray-300 dark:border-gray-700'>
            {/* Explorer Panel */}
            <div
                className={`explorer h-full rounded-r-none overflow-y-auto hide-scrollbar bg-gray-50 dark:bg-gray-900 relative rounded-lg ${isTransitioning ? 'transition-all duration-300 ease-in-out' : ''}`}
                style={{ width: `${explorerWidth}px` }}
            >
                <div className="explorer-header h-10 flex items-center justify-between px-2 py-2">
                    <button onClick={handleCollapseExplorer}>
                        {isCollapsed ? null : (
                            <ChevronLeft className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                        )}
                    </button>
                </div>
                {
                    !isCollapsed && (
                        <div className="explorer-main p-2 h-full">
                            <div className='flex gap-2 items-center w-full'>
                                <div className="filter-items flex-1 ">
                                    <input type="text" className='w-full h-full outline-none bg-gray-300 dark:bg-gray-700 rounded-md p-1 px-2 text-xs text-gray-500 dark:text-gray-200' placeholder='Search'
                                        value={filterText}
                                        onChange={handleFilterItems}
                                    />
                                </div>

                                <div className="collapse-expand text-gray-500 dark:text-gray-300 flex gap-1 items-center select-none">
                                    <button className='p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150'
                                        title='Collapse All'
                                        onClick={handleCollapseAll}
                                    >
                                        <ListCollapseIcon size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150'
                                        title='Expand All'
                                        onClick={handleExpandAll}
                                    >
                                        <ListTreeIcon size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150'
                                        title='Add File'
                                        onClick={handleAddFile}
                                    >
                                        <FilePlus2 size={14} />
                                    </button>
                                    <button className='p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150'
                                        title='Add Folder'
                                        onClick={handleAddFolder}
                                    >
                                        <FolderPlusIcon size={14} />
                                    </button>
                                </div>
                            </div>

                            <div className='file-tree mt-2 text-sm w-full h-full overflow-y-auto hide-scrollbar select-none'>
                                <FileTree ref={fileTreeRef} filterText={filterText} />
                            </div>
                        </div>
                    )
                }

                {/* Right Resize Handle */}
                <div
                    className={`absolute top-0 right-0 w-1 h-full cursor-col-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors duration-150 ${isResizing ? 'bg-blue-500 bg-opacity-50' : ''
                        }`}
                    onMouseDown={handleMouseDown}
                    title="Drag to resize"
                />
            </div>

            {/* Terminal and Preview */}
            <div
                className={`preview-and-terminal ${explorerWidth === 0 ? 'rounded-l-lg' : 'rounded-l-none'} rounded-r-lg h-full bg-gray-100 dark:bg-gray-800 hide-scrollbar relative flex flex-col ${isTransitioning ? 'transition-all duration-300 ease-in-out' : ''}`}
                style={{ width: `calc(100% - ${explorerWidth}px)` }}
            >

                <div className="preview-header w-full h-10 bg-gray-200 dark:bg-gray-800 flex items-center justify-between px-4">
                    <div className="preview-header-left flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 rounded-lg">
                        {isCollapsed ? (
                            <button onClick={handleCollapseExplorer}>
                                <ChevronRight className='w-4 h-4 text-gray-500 dark:text-gray-400' />
                            </button>
                        ) : null}
                        <button onClick={() => setShowCode(true)}>
                            <span className={`${showCode ? 'bg-white/50 text-black p-1 rounded-xl px-2' : 'p-1 px-2'}`}>
                                Code
                            </span>
                        </button>
                        <hr className='h-5 border-l border-gray-300 dark:border-gray-500' />
                        <button onClick={() => setShowCode(false)}>
                            <span className={`${!showCode ? 'bg-white/50 text-black p-1 rounded-xl px-2' : 'p-1 px-2'}`}>
                                Preview
                            </span>
                        </button>
                    </div>

                    <div className={`preview-header-center items-center gap-2 flex-1 max-w-[700px] px-4 ${!showCode ? 'xl:flex' : 'hidden'}`}>
                        <div
                            className={`bg-gray-300 dark:bg-gray-700 rounded-xl p-1 text-xs text-gray-500 dark:text-gray-200 focus:outline-none flex-1 h-7 truncate px-2 text-center min-w-0 flex items-center`}>
                            <div className="addressbar-right flex items-center gap-1">
                                <button className={`p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150 flex-shrink-0`}
                                    onClick={() => {
                                        window.open(url || "", "_blank")
                                    }}
                                >
                                    <SquareArrowOutUpRight className='text-gray-500 dark:text-gray-400 size-4' />
                                </button>
                                <button className={`p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors duration-150 flex-shrink-0`}
                                    onClick={() => {
                                        if (wcServerUrl) {
                                            setPreviewUrl(wcServerUrl)
                                        } else {
                                            setPreviewUrl(url)
                                        }
                                    }}
                                >
                                    <RotateCcw className='text-gray-500 dark:text-gray-400 size-4' />
                                </button>

                                <hr className='h-5 border-l border-gray-400 dark:border-gray-500' />

                            </div>
                            <div className="addressbar-input w-full flex-1">
                                <input type="text" className='w-full h-full outline-none bg-gray-300 dark:bg-gray-700 rounded-md p-1 px-2 text-xs text-gray-500 dark:text-gray-200 '
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

                    <div className="preview-header-right flex items-center gap-2">
                        <button onClick={() => {
                            if (deleteTerminal) {
                                setDeleteTerminal(false);
                                setShowTerminal(true);
                            } else {
                                setShowTerminal(!showTerminal)
                            }
                        }}>
                            <SquareTerminal className='size-5 text-gray-500 dark:text-gray-400' />
                        </button>
                        <span title='Webcontainer ready status' className={`webcontainer-readt-indicator size-4 rounded-full ${wcReady ? 'bg-green-500/60' : 'bg-red-500/60'}`}></span>
                    </div>
                </div>
                <div className="preview-and-code flex-1 overflow-y-auto hide-scrollbar">
                    <div className={`code ${showCode ? 'block' : 'hidden'}`}>
                        <Editor />
                    </div>
                    <div className={`preview w-full h-full ${!showCode ? 'block' : 'hidden'}`}>
                        <Preview url={previewUrl} />
                    </div>
                </div>

                {deleteTerminal ? null :
                    <>
                        <div
                            className={`${showTerminal ? 'block' : 'hidden'} terminal font-mono border-t border-white/20 w-full sticky bottom-0 right-0 flex flex-col hide-scrollbar`}
                            style={{ height: `${terminalHeight}px` }}
                        >
                            {/* Top Resize Handle */}
                            <div
                                className={`absolute top-0 left-0 w-full h-1 cursor-row-resize bg-transparent hover:bg-blue-500 hover:bg-opacity-50 transition-colors duration-150 ${isTerminalResizing ? 'bg-blue-500 bg-opacity-50' : ''
                                    }`}
                                onMouseDown={handleTerminalMouseDown}
                                title="Drag to resize"
                            />

                            <div className="terminal-header border-b border-white/10 bg-gray-950 flex items-center justify-between flex-shrink-0">
                                <div className="terminal-header-left py-1 px-2 text-sm font-extrabold text-gray-500 dark:text-gray-400">
                                    JSH
                                </div>

                                <div className="terminal-header-right px-2 flex items-center gap-4">
                                    <button
                                        onClick={() => setDeleteTerminal(true)}
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
                    </>}
            </div>
        </div>
    )
}

export default WCWorkspace;
