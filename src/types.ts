export type FileType = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'text';

export interface FileNode {
    id: string;
    name: string;
    type: 'file' | 'folder';
    content?: string;
    fileType?: FileType;
    children?: FileNode[];
    path: string;
    isOpen?: boolean;
    parent?: string;
}

export interface Project {
    id: string;
    name: string;
    files: FileNode[];
    activeFileId: string | null;
    createdAt: number;
    lastModified: number;
}

export interface EditorTab {
    id: string;
    fileId: string;
    fileName: string;
    fileType: FileType;
    isDirty: boolean;
    projectId: string;
}

export interface EditorSettings {
    theme: 'vs-dark' | 'light';
    fontSize: number;
    fontFamily: string;
    tabSize: number;
    wordWrap: 'on' | 'off';
    minimap: boolean;
    lineNumbers: boolean;
    autoSave: boolean;
    autoSaveDelay: number;
}

export interface AppState {
    projects: Project[];
    activeProjectId: string | null;
    openTabs: EditorTab[];
    activeTabId: string | null;
    settings: EditorSettings;
    sidebarWidth: number;
    showPreview: boolean;
    previewUrl: string;
}

export type ContextMenuAction =
    | 'new-file'
    | 'new-folder'
    | 'rename'
    | 'delete'
    | 'duplicate'
    | 'download';

export interface ContextMenuPosition {
    x: number;
    y: number;
}

export interface ContextMenuItem {
    label: string;
    action: ContextMenuAction;
    icon?: string;
    disabled?: boolean;
    divider?: boolean;
}
