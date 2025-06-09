export interface FileSystemTree {
    [name: string]: FileNode | DirectoryNode;
}

export interface FileNode {
    file: {
        contents: string;
    };
}

export interface DirectoryNode {
    directory: FileSystemTree;
}

export type WebContainerFiles = FileSystemTree;
