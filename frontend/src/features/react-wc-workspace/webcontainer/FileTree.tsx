import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import { Folder, FolderOpen, File, ChevronRight, ChevronDown, FilePlus2, FolderPlusIcon, MoreVertical, Trash2, Edit3 } from 'lucide-react'
import { type WebContainerFiles, type FileNode as FileNodeType, type DirectoryNode } from './types'
import { useWebContainer } from './useWebContainer'

interface FileTreeProps {
    filterText: string
}

export interface FileTreeRef {
    expandAll: () => void
    collapseAll: () => void
    addFile: (path?: string) => void
    addFolder: (path?: string) => void
}

interface ParsedFileNode {
    name: string
    type: 'file' | 'directory'
    children?: WebContainerFiles
    contents?: string
}

interface AddingState {
    path: string
    type: 'file' | 'folder'
    name: string
}

interface RenamingState {
    path: string
    type: 'file' | 'folder'
    oldName: string
    newName: string
}

const FileTree = forwardRef<FileTreeRef, FileTreeProps>(({ filterText }, ref) => {
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
    const [addingState, setAddingState] = useState<AddingState | null>(null)
    const [renamingState, setRenamingState] = useState<RenamingState | null>(null)
    const [openDropdown, setOpenDropdown] = useState<string | null>(null)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { wcFiles, setSelectedFile, selectedFile, webContainer } = useWebContainer()

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Parse the files object into a more workable format
    const parseFiles = (filesObj: WebContainerFiles): ParsedFileNode[] => {
        if (!filesObj) return []
        const nodes = Object.entries(filesObj).map(([name, value]: [string, FileNodeType | DirectoryNode]) => {
            if ('file' in value) {
                return {
                    name,
                    type: 'file' as const,
                    contents: value.file.contents
                }
            } else if ('directory' in value) {
                return {
                    name,
                    type: 'directory' as const,
                    children: value.directory
                }
            }
            return {
                name,
                type: 'file' as const,
                contents: ''
            }
        })

        // Sort: directories first, then files, both alphabetically
        return nodes.sort((a, b) => {
            if (a.type === b.type) {
                return a.name.localeCompare(b.name)
            }
            return a.type === 'directory' ? -1 : 1
        })
    }

    const fileTree = parseFiles(wcFiles as WebContainerFiles)

    // Filter function to check if a node or its children match the filter
    const matchesFilter = (node: ParsedFileNode, filter: string, path: string = ''): boolean => {
        if (!filter) return true

        const currentPath = path ? `${path}/${node.name}` : node.name

        // Check if current node name matches
        if (node.name.toLowerCase().includes(filter.toLowerCase())) {
            return true
        }

        // For directories, check if any children match
        if (node.type === 'directory' && node.children) {
            const childNodes = parseFiles(node.children)
            return childNodes.some(child => matchesFilter(child, filter, currentPath))
        }

        return false
    }

    // Filter the tree based on filterText
    const filterTree = (nodes: ParsedFileNode[], filter: string, path: string = ''): ParsedFileNode[] => {
        if (!filter) return nodes

        return nodes.filter(node => {
            const currentPath = path ? `${path}/${node.name}` : node.name

            if (matchesFilter(node, filter, path)) {
                // If it's a directory, recursively filter its children
                if (node.type === 'directory' && node.children) {
                    const childNodes = parseFiles(node.children)
                    const filteredChildren = filterTree(childNodes, filter, currentPath)

                    // Convert back to the original format
                    const filteredChildrenObj: WebContainerFiles = {}
                    filteredChildren.forEach(child => {
                        if (child.type === 'file') {
                            filteredChildrenObj[child.name] = {
                                file: { contents: child.contents || '' }
                            }
                        } else {
                            filteredChildrenObj[child.name] = {
                                directory: child.children || {}
                            }
                        }
                    })

                    return {
                        ...node,
                        children: filteredChildrenObj
                    }
                }
                return node
            }
            return false
        }).filter(Boolean)
    }

    const filteredTree = filterTree(fileTree, filterText)

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev)
            if (newSet.has(path)) {
                newSet.delete(path)
            } else {
                newSet.add(path)
            }
            return newSet
        })
    }

    const expandAll = () => {
        const getAllPaths = (nodes: ParsedFileNode[], currentPath: string = ''): string[] => {
            const paths: string[] = []
            nodes.forEach(node => {
                if (node.type === 'directory') {
                    const path = currentPath ? `${currentPath}/${node.name}` : node.name
                    paths.push(path)
                    if (node.children) {
                        const childNodes = parseFiles(node.children)
                        paths.push(...getAllPaths(childNodes, path))
                    }
                }
            })
            return paths
        }

        const allPaths = getAllPaths(filteredTree)
        setExpandedFolders(new Set(allPaths))
    }

    const collapseAll = () => {
        setExpandedFolders(new Set())
    }

    const addFile = (path: string = '') => {
        setAddingState({
            path,
            type: 'file',
            name: ''
        })
    }

    const addFolder = (path: string = '') => {
        setAddingState({
            path,
            type: 'folder',
            name: ''
        })
    }

    const handleCreateItem = async () => {
        if (!addingState || !addingState.name.trim() || !webContainer) return

        const { path, type, name } = addingState
        const fullPath = path ? `${path}/${name}` : name

        try {
            if (type === 'file') {
                await webContainer.fs.writeFile(fullPath, '')
            } else {
                await webContainer.fs.mkdir(fullPath, { recursive: true })
            }
            setAddingState(null)
        } catch (error) {
            console.error(`Failed to create ${type}:`, error)
        }
    }

    const handleCancelAdd = () => {
        setAddingState(null)
    }

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreateItem()
        } else if (e.key === 'Escape') {
            handleCancelAdd()
        }
    }

    const handleDelete = async (path: string, type: 'file' | 'directory') => {
        if (!webContainer) return

        try {
            if (type === 'file') {
                await webContainer.fs.rm(path)
            } else {
                await webContainer.fs.rm(path, { recursive: true })
            }
            setOpenDropdown(null)
            // Clear selected file if it was deleted
            if (selectedFile?.path === path) {
                setSelectedFile(null)
            }
        } catch (error) {
            console.error(`Failed to delete ${type}:`, error)
        }
    }

    const handleRename = (path: string, type: 'file' | 'folder', oldName: string) => {
        setRenamingState({
            path: path.replace(`/${oldName}`, '').replace(oldName, ''),
            type,
            oldName,
            newName: oldName
        })
        setOpenDropdown(null)
    }

    const handleRenameConfirm = async () => {
        if (!renamingState || !renamingState.newName.trim() || !webContainer) return

        const { path, oldName, newName } = renamingState
        const oldPath = path ? `${path}/${oldName}` : oldName
        const newPath = path ? `${path}/${newName}` : newName

        try {
            await webContainer.fs.rename(oldPath, newPath)
            setRenamingState(null)
            // Update selected file if it was renamed
            if (selectedFile?.path === oldPath) {
                setSelectedFile({
                    ...selectedFile,
                    name: newName,
                    path: newPath
                })
            }
        } catch (error) {
            console.error(`Failed to rename:`, error)
        }
    }

    const handleRenameCancel = () => {
        setRenamingState(null)
    }

    const handleRenameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleRenameConfirm()
        } else if (e.key === 'Escape') {
            handleRenameCancel()
        }
    }

    useImperativeHandle(ref, () => ({
        expandAll,
        collapseAll,
        addFile,
        addFolder
    }))

    const renderNode = (node: ParsedFileNode, depth: number = 0, path: string = '') => {
        const currentPath = path ? `${path}/${node.name}` : node.name
        const isExpanded = expandedFolders.has(currentPath)
        const paddingLeft = depth * 16
        const isRenaming = renamingState && renamingState.path === (path || '') && renamingState.oldName === node.name

        // Render file
        if (node.type === 'file') {
            if (isRenaming) {
                return (
                    <div
                        key={currentPath}
                        className="flex items-center gap-1 py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        style={{ paddingLeft: `${paddingLeft + 8}px` }}
                    >
                        <File size={16} className="text-blue-500 flex-shrink-0" />
                        <input
                            type="text"
                            value={renamingState.newName}
                            onChange={(e) => setRenamingState({ ...renamingState, newName: e.target.value })}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={handleRenameCancel}
                            className="text-sm bg-transparent border-b border-gray-400 outline-none flex-1"
                            autoFocus
                        />
                    </div>
                )
            }

            return (
                <div
                    key={currentPath}
                    className={`flex items-center gap-1 py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer rounded text-gray-700 dark:text-gray-300 group ${selectedFile?.name === node.name ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
                    style={{ paddingLeft: `${paddingLeft + 8}px` }}
                >
                    <div
                        className="flex items-center gap-1 flex-1"
                        onClick={() => {
                            setSelectedFile({
                                name: node.name,
                                contents: node.contents || "",
                                path: currentPath
                            })
                        }}
                    >
                        <File size={16} className="text-blue-500 flex-shrink-0" />
                        <span className="text-sm max-w-[160px] truncate">{node.name}</span>
                    </div>
                    <div className="relative">
                        <button
                            className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                                e.stopPropagation()
                                setOpenDropdown(openDropdown === currentPath ? null : currentPath)
                            }}
                        >
                            <MoreVertical size={12} className="text-gray-500 dark:text-gray-400" />
                        </button>
                        {/* File Options */}
                        {openDropdown === currentPath && (
                            <div
                                ref={dropdownRef}
                                className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 px-1 z-10 min-w-[120px]"
                            >
                                <button
                                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-md"
                                    onClick={() => handleRename(currentPath, 'file', node.name)}
                                >
                                    <Edit3 size={12} />
                                    Rename
                                </button>
                                <button
                                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                    onClick={() => handleDelete(currentPath, 'file')}
                                >
                                    <Trash2 size={12} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        const childNodes = node.children ? parseFiles(node.children) : []
        const filteredChildNodes = filterTree(childNodes, filterText, currentPath)

        // Render directory
        if (node.name === "node_modules") return null;

        if (isRenaming) {
            return (
                <div key={currentPath}>
                    <div
                        className="flex items-center gap-1 py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                        style={{ paddingLeft: `${paddingLeft}px` }}
                    >
                        <div className="flex items-center gap-1 flex-1">
                            {isExpanded ? (
                                <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                            ) : (
                                <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                            )}
                            <Folder size={16} className="text-yellow-500 flex-shrink-0" />
                            <input
                                type="text"
                                value={renamingState.newName}
                                onChange={(e) => setRenamingState({ ...renamingState, newName: e.target.value })}
                                onKeyDown={handleRenameKeyDown}
                                onBlur={handleRenameCancel}
                                className="text-sm bg-transparent border-b border-gray-400 outline-none flex-1"
                                autoFocus
                            />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div key={currentPath}>
                <div
                    className="flex items-center gap-1 py-1 px-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300 group"
                    style={{ paddingLeft: `${paddingLeft}px` }}
                >
                    <div className="flex items-center gap-1 flex-1 cursor-pointer" onClick={() => toggleFolder(currentPath)}>
                        {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                        ) : (
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                        )}
                        {isExpanded ? (
                            <FolderOpen size={16} className="text-yellow-500 flex-shrink-0" />
                        ) : (
                            <Folder size={16} className="text-yellow-500 flex-shrink-0" />
                        )}
                        <span className="text-sm max-w-[100px] truncate">{node.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="relative">
                            <button
                                className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setOpenDropdown(openDropdown === currentPath ? null : currentPath)
                                }}
                            >
                                <MoreVertical size={12} className="text-gray-500 dark:text-gray-400" />
                            </button>
                            {/* Directory Options */}
                            {openDropdown === currentPath && (
                                <div
                                    ref={dropdownRef}
                                    className="absolute right-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded shadow-lg py-1 px-1 z-10 min-w-[120px]"
                                >
                                    <button
                                        className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenDropdown(null)
                                            setExpandedFolders(prev => {
                                                const newSet = new Set(prev)
                                                newSet.add(currentPath)
                                                return newSet
                                            })
                                            addFolder(currentPath)
                                        }}
                                    >
                                        <FolderPlusIcon size={12} />
                                        Add Folder
                                    </button>
                                    <button
                                        className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-md"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setOpenDropdown(null)
                                            setExpandedFolders(prev => {
                                                const newSet = new Set(prev)
                                                newSet.add(currentPath)
                                                return newSet
                                            })
                                            addFile(currentPath)
                                        }}
                                    >
                                        <FilePlus2 size={12} />
                                        Add File
                                    </button>
                                    <button
                                        className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-md"
                                        onClick={() => handleRename(currentPath, 'folder', node.name)}
                                    >
                                        <Edit3 size={12} />
                                        Rename
                                    </button>
                                    <button
                                        className="w-full px-3 py-1 text-left text-xs hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600 dark:text-red-400"
                                        onClick={() => handleDelete(currentPath, 'directory')}
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                {isExpanded && (
                    <div>
                        {/* Render adding input if it matches this path */}
                        {addingState && addingState.path === currentPath && (
                            <div
                                className="flex items-center gap-1 py-1 px-2 rounded text-gray-700 dark:text-gray-300"
                                style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
                            >
                                {addingState.type === 'file' ? (
                                    <File size={16} className="text-blue-500 flex-shrink-0" />
                                ) : (
                                    <Folder size={16} className="text-yellow-500 flex-shrink-0" />
                                )}
                                <input
                                    type="text"
                                    value={addingState.name}
                                    onChange={(e) => setAddingState({ ...addingState, name: e.target.value })}
                                    onKeyDown={handleInputKeyDown}
                                    onBlur={handleCancelAdd}
                                    placeholder={`Enter ${addingState.type} name`}
                                    className="text-sm bg-transparent border-b border-gray-400 outline-none flex-1"
                                    autoFocus
                                />
                            </div>
                        )}
                        {filteredChildNodes.map(child =>
                            renderNode(child, depth + 1, currentPath)
                        )}
                    </div>
                )}
            </div>
        )
    }

    // Auto-expand filtered results
    useEffect(() => {
        if (filterText) {
            expandAll()
        }
    }, [filterText])

    return (
        <div className="file-tree">
            {/* Render adding input at root level */}
            {addingState && addingState.path === '' && (
                <div className="flex items-center gap-1 py-1 px-2 rounded text-gray-700 dark:text-gray-300">
                    {addingState.type === 'file' ? (
                        <File size={16} className="text-blue-500 flex-shrink-0" />
                    ) : (
                        <Folder size={16} className="text-yellow-500 flex-shrink-0" />
                    )}
                    <input
                        type="text"
                        value={addingState.name}
                        onChange={(e) => setAddingState({ ...addingState, name: e.target.value })}
                        onKeyDown={handleInputKeyDown}
                        onBlur={handleCancelAdd}
                        placeholder={`Enter ${addingState.type} name`}
                        className="text-sm bg-transparent border-b border-gray-400 outline-none flex-1"
                        autoFocus
                    />
                </div>
            )}
            {filteredTree.map(node => renderNode(node))}
            {filteredTree.length === 0 && filterText && (
                <div className="text-gray-500 dark:text-gray-400 text-sm p-2 text-center">
                    No files match "{filterText}"
                </div>
            )}
        </div>
    )
})

FileTree.displayName = 'FileTree'

export default FileTree