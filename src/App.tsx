import { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import EditorArea from './components/EditorArea';
import PreviewPanel from './components/PreviewPanel';
import SplitPane from './components/SplitPane';
import ContextMenu from './components/ContextMenu';
import SettingsModal from './components/SettingsModal';
import type {
    AppState,
    EditorTab,
    FileNode,
    ContextMenuPosition,
    EditorSettings,
} from './types';
import {
    createSampleProject,
    generateId,
    createFileNode,
    findNodeById,
    deleteNode,
    renameNode,
    updateFileContent,
    toggleFolder,
    addNodeToParent,
    downloadProjectAsZip,
    generatePreviewHTML,
    flattenFileTree,
} from './utils';
import './App.css';

const STORAGE_KEY = 'visual-code-online-state';
const DEFAULT_SETTINGS: EditorSettings = {
    theme: 'vs-dark',
    fontSize: 14,
    fontFamily: 'JetBrains Mono',
    tabSize: 2,
    wordWrap: 'on',
    minimap: true,
    lineNumbers: true,
    autoSave: true,
    autoSaveDelay: 1000,
};

function App() {
    const [previewFull, setPreviewFull] = useState(false);
    const togglePreviewFull = () => setPreviewFull(p => !p);

    const [state, setState] = useState<AppState>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                // If parsing fails, use default
            }
        }

        const initialProject = createSampleProject();
        return {
            projects: [initialProject],
            activeProjectId: initialProject.id,
            openTabs: [],
            activeTabId: null,
            settings: DEFAULT_SETTINGS,
            sidebarWidth: 250,
            showPreview: true,
            previewUrl: '',
        };
    });

    const [contextMenu, setContextMenu] = useState<{
        position: ContextMenuPosition;
        node: FileNode | null;
    } | null>(null);

    const [showSettings, setShowSettings] = useState(false);
    const [appTheme, setAppTheme] = useState<'dark' | 'light'>('dark');
    const [inputPrompt, setInputPrompt] = useState<{
        type: 'file' | 'folder' | 'rename';
        parentId: string | null;
        nodeId?: string;
    } | null>(null);

    const activeProject = state.projects.find(p => p.id === state.activeProjectId);
    const activeTab = state.openTabs.find(t => t.id === state.activeTabId);
    const currentFile = activeTab && activeProject
        ? findNodeById(activeProject.files, activeTab.fileId)
        : null;

    // Auto-save to localStorage
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        }, 500);
        return () => clearTimeout(timer);
    }, [state]);

    // Update app theme
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', appTheme);
    }, [appTheme]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ctrl+S: Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSaveAll();
            }
            // Ctrl+W: Close tab
            if ((e.ctrlKey || e.metaKey) && e.key === 'w') {
                e.preventDefault();
                if (state.activeTabId) {
                    handleCloseTab(state.activeTabId);
                }
            }
            // Ctrl+N: New file
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                handlePromptNewFile(null);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [state.activeTabId]);

    const updateProject = useCallback((updater: (files: FileNode[]) => FileNode[]) => {
        if (!activeProject) return;

        setState(prev => ({
            ...prev,
            projects: prev.projects.map(p =>
                p.id === activeProject.id
                    ? { ...p, files: updater(p.files), lastModified: Date.now() }
                    : p
            ),
        }));
    }, [activeProject]);

    const handleFileSelect = (fileId: string) => {
        if (!activeProject) return;

        const file = findNodeById(activeProject.files, fileId);
        if (!file || file.type !== 'file') return;

        // Check if tab already exists
        const existingTab = state.openTabs.find(t => t.fileId === fileId);
        if (existingTab) {
            setState(prev => ({ ...prev, activeTabId: existingTab.id }));
            return;
        }

        // Create new tab
        const newTab: EditorTab = {
            id: generateId(),
            fileId: file.id,
            fileName: file.name,
            fileType: file.fileType!,
            isDirty: false,
            projectId: activeProject.id,
        };

        setState(prev => ({
            ...prev,
            openTabs: [...prev.openTabs, newTab],
            activeTabId: newTab.id,
        }));
    };

    const handleFolderToggle = (folderId: string) => {
        updateProject(files => toggleFolder(files, folderId));
    };

    const handleCodeChange = (code: string) => {
        if (!activeTab || !currentFile) return;

        // Update file content
        updateProject(files => updateFileContent(files, activeTab.fileId, code));

        // Mark tab as dirty
        setState(prev => ({
            ...prev,
            openTabs: prev.openTabs.map(tab =>
                tab.id === activeTab.id ? { ...tab, isDirty: true } : tab
            ),
        }));

        // Auto-save
        if (state.settings.autoSave) {
            const timer = setTimeout(() => {
                handleSaveTab(activeTab.id);
            }, state.settings.autoSaveDelay);
            return () => clearTimeout(timer);
        }
    };

    const handleSaveTab = (tabId: string) => {
        setState(prev => ({
            ...prev,
            openTabs: prev.openTabs.map(tab =>
                tab.id === tabId ? { ...tab, isDirty: false } : tab
            ),
        }));
    };

    const handleSaveAll = () => {
        setState(prev => ({
            ...prev,
            openTabs: prev.openTabs.map(tab => ({ ...tab, isDirty: false })),
        }));
    };

    const handleCloseTab = (tabId: string) => {
        const newTabs = state.openTabs.filter(t => t.id !== tabId);
        const newActiveId = tabId === state.activeTabId
            ? newTabs[newTabs.length - 1]?.id || null
            : state.activeTabId;

        setState(prev => ({
            ...prev,
            openTabs: newTabs,
            activeTabId: newActiveId,
        }));
    };

    const handleContextMenu = (e: React.MouseEvent, node: FileNode) => {
        e.preventDefault();
        setContextMenu({
            position: { x: e.clientX, y: e.clientY },
            node,
        });
    };

    const handlePromptNewFile = (parentId: string | null) => {
        setInputPrompt({ type: 'file', parentId });
        setContextMenu(null);
    };

    const handlePromptNewFolder = (parentId: string | null) => {
        setInputPrompt({ type: 'folder', parentId });
        setContextMenu(null);
    };

    const handlePromptRename = (nodeId: string) => {
        setInputPrompt({ type: 'rename', parentId: null, nodeId });
        setContextMenu(null);
    };

    const handleConfirmInput = (name: string) => {
        if (!inputPrompt || !name.trim()) {
            setInputPrompt(null);
            return;
        }

        if (inputPrompt.type === 'rename' && inputPrompt.nodeId) {
            updateProject(files => renameNode(files, inputPrompt.nodeId!, name));

            // Update tab name if open
            setState(prev => ({
                ...prev,
                openTabs: prev.openTabs.map(tab =>
                    tab.fileId === inputPrompt.nodeId
                        ? { ...tab, fileName: name }
                        : tab
                ),
            }));
        } else {
            const parentPath = inputPrompt.parentId && activeProject
                ? findNodeById(activeProject.files, inputPrompt.parentId)?.path || ''
                : '';

            const newNode = createFileNode(
                name,
                inputPrompt.type === 'file' ? 'file' : 'folder',
                parentPath
            );

            updateProject(files => addNodeToParent(files, inputPrompt.parentId, newNode));
        }

        setInputPrompt(null);
    };

    const handleDelete = () => {
        if (!contextMenu?.node) return;

        const nodeId = contextMenu.node.id;
        updateProject(files => deleteNode(files, nodeId));

        // Close tabs for deleted files
        const flatFiles = flattenFileTree(activeProject?.files || []);
        const deletedFileIds = flatFiles
            .filter(f => f.id === nodeId || f.path.startsWith(contextMenu.node!.path + '/'))
            .map(f => f.id);

        setState(prev => ({
            ...prev,
            openTabs: prev.openTabs.filter(tab => !deletedFileIds.includes(tab.fileId)),
        }));

        setContextMenu(null);
    };

    const handleDuplicate = () => {
        if (!contextMenu?.node || contextMenu.node.type !== 'file') return;

        const original = contextMenu.node;
        const newName = `${original.name.split('.')[0]}_copy.${original.name.split('.')[1] || 'txt'}`;
        const duplicate = { ...original, id: generateId(), name: newName };

        updateProject(files => addNodeToParent(files, null, duplicate));
        setContextMenu(null);
    };

    const handleDownloadFile = () => {
        if (!contextMenu?.node) return;

        const node = contextMenu.node;
        const content = node.type === 'file' ? node.content || '' : '';
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = node.name;
        a.click();
        URL.revokeObjectURL(url);

        setContextMenu(null);
    };

    const handleDownloadProject = async () => {
        if (activeProject) {
            await downloadProjectAsZip(activeProject);
        }
    };

    const handleTogglePreview = () => {
        setState(prev => ({ ...prev, showPreview: !prev.showPreview }));
    };

    const handleToggleTheme = () => {
        const newTheme = appTheme === 'dark' ? 'light' : 'dark';
        setAppTheme(newTheme);
        setState(prev => ({
            ...prev,
            settings: {
                ...prev.settings,
                theme: newTheme === 'dark' ? 'vs-dark' : 'light',
            },
        }));
    };

    const handleRefreshPreview = () => {
        // Force re-render
        setState(prev => ({ ...prev, previewUrl: generateId() }));
    };

    const handleNewProject = () => {
        const newProject = createSampleProject();
        setState(prev => ({
            ...prev,
            projects: [...prev.projects, newProject],
            activeProjectId: newProject.id,
            openTabs: [],
            activeTabId: null,
        }));
    };

    const handleSettingsSave = (settings: EditorSettings) => {
        setState(prev => ({ ...prev, settings }));
    };

    const previewHtml = activeProject ? generatePreviewHTML(activeProject) : '';
    const hasUnsavedChanges = state.openTabs.some(tab => tab.isDirty);

    return (
        <>
            <Navbar
                projectName={activeProject?.name || 'No Project'}
                onNewProject={handleNewProject}
                onOpenSettings={() => setShowSettings(true)}
                onDownloadProject={handleDownloadProject}
                onTogglePreview={handleTogglePreview}
                onToggleTheme={handleToggleTheme}
                showPreview={state.showPreview}
                isDarkTheme={appTheme === 'dark'}
                onSaveAll={handleSaveAll}
                hasUnsavedChanges={hasUnsavedChanges}
            />

            <div className="app-content">
                {!previewFull && (
                    <Sidebar
                    files={activeProject?.files || []}
                    activeFileId={currentFile?.id || null}
                    onFileSelect={handleFileSelect}
                    onFolderToggle={handleFolderToggle}
                    onContextMenu={handleContextMenu}
                    onNewFile={() => handlePromptNewFile(null)}
                    onNewFolder={() => handlePromptNewFolder(null)}
                    width={state.sidebarWidth}
                    />
                )}

                {previewFull ? (
                    <div style={{ display: 'flex', flex: 1, minWidth: 0, height: '100%' }}>
                        <PreviewPanel
                            html={previewHtml}
                            onRefresh={handleRefreshPreview}
                            onToggleExpand={togglePreviewFull}
                        />
                    </div>
                ) : state.showPreview ? (
                    // Use SplitPane when preview is visible so user can resize editor/preview
                    <>
                        {/* lazy import the component above */}
                        {/* @ts-ignore */}
                        {/* Render SplitPane with EditorArea on left and PreviewPanel on right */}
                        {/* eslint-disable-next-line react/jsx-no-undef */}
                        <div style={{ display: 'flex', flex: 1, minWidth: 0, height: '100%' }}>
                            {/* SplitPane expects exactly two children */}
                            {/* @ts-ignore */}
                            <SplitPane rightInitialWidth={400} minRight={200} minLeft={300}>
                                <EditorArea
                                    tabs={state.openTabs}
                                    activeTabId={state.activeTabId}
                                    onTabChange={(tabId) => setState(prev => ({ ...prev, activeTabId: tabId }))}
                                    onTabClose={handleCloseTab}
                                    onCodeChange={handleCodeChange}
                                    currentCode={currentFile?.content || ''}
                                    theme={state.settings.theme}
                                    fontSize={state.settings.fontSize}
                                    fontFamily={state.settings.fontFamily}
                                />

                                <PreviewPanel
                                    html={previewHtml}
                                    onRefresh={handleRefreshPreview}
                                    onToggleExpand={togglePreviewFull}
                                />
                            </SplitPane>
                        </div>
                    </>
                ) : (
                    <EditorArea
                        tabs={state.openTabs}
                        activeTabId={state.activeTabId}
                        onTabChange={(tabId) => setState(prev => ({ ...prev, activeTabId: tabId }))}
                        onTabClose={handleCloseTab}
                        onCodeChange={handleCodeChange}
                        currentCode={currentFile?.content || ''}
                        theme={state.settings.theme}
                        fontSize={state.settings.fontSize}
                        fontFamily={state.settings.fontFamily}
                    />
                )}
            </div>

            {contextMenu && (
                <ContextMenu
                    position={contextMenu.position}
                    node={contextMenu.node}
                    onNewFile={() => handlePromptNewFile(contextMenu.node!.id)}
                    onNewFolder={() => handlePromptNewFolder(contextMenu.node!.id)}
                    onRename={() => handlePromptRename(contextMenu.node!.id)}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                    onDownload={handleDownloadFile}
                    onClose={() => setContextMenu(null)}
                />
            )}

            {showSettings && (
                <SettingsModal
                    settings={state.settings}
                    onSave={handleSettingsSave}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {inputPrompt && (
                <div className="modal-overlay">
                    <div className="modal-content input-modal">
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {inputPrompt.type === 'rename'
                                    ? 'Rename'
                                    : `New ${inputPrompt.type === 'file' ? 'File' : 'Folder'}`}
                            </h2>
                        </div>
                        <div className="modal-body">
                            <input
                                type="text"
                                placeholder={inputPrompt.type === 'file' ? 'filename.txt' : 'folder-name'}
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleConfirmInput(e.currentTarget.value);
                                    } else if (e.key === 'Escape') {
                                        setInputPrompt(null);
                                    }
                                }}
                                className="input-modal-field"
                            />
                        </div>
                        <div className="modal-footer">
                            <button
                                className="modal-btn modal-btn-secondary"
                                onClick={() => setInputPrompt(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-btn modal-btn-primary"
                                onClick={(e) => {
                                    const input = e.currentTarget.parentElement?.previousElementSibling
                                        ?.querySelector('input') as HTMLInputElement;
                                    if (input) {
                                        handleConfirmInput(input.value);
                                    }
                                }}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
