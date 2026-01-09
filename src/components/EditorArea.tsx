import type { FC, MouseEvent } from 'react';
import Editor from '@monaco-editor/react';
import { X, Circle } from 'lucide-react';
import type { EditorTab } from '../types';
import { getMonacoLanguage, getFileIcon } from '../utils';
import './EditorArea.css';

interface EditorAreaProps {
    tabs: EditorTab[];
    activeTabId: string | null;
    onTabChange: (tabId: string) => void;
    onTabClose: (tabId: string) => void;
    onCodeChange: (code: string) => void;
    currentCode: string;
    theme: 'vs-dark' | 'light';
    fontSize: number;
    fontFamily: string;
}

const EditorArea: FC<EditorAreaProps> = ({
    tabs,
    activeTabId,
    onTabChange,
    onTabClose,
    onCodeChange,
    currentCode,
    theme,
    fontSize,
    fontFamily,
}) => {
    const activeTab = tabs.find(tab => tab.id === activeTabId);

    const handleTabClick = (tabId: string, e: MouseEvent) => {
        e.stopPropagation();
        onTabChange(tabId);
    };

    const handleTabClose = (tabId: string, e: MouseEvent) => {
        e.stopPropagation();
        onTabClose(tabId);
    };

    const handleTabMiddleClick = (tabId: string, e: MouseEvent) => {
        if (e.button === 1) { // Middle mouse button
            e.preventDefault();
            onTabClose(tabId);
        }
    };

    return (
        <div className="editor-area">
            <div className="editor-tabs">
                {tabs.map(tab => (
                    <div
                        key={tab.id}
                        className={`editor-tab ${tab.id === activeTabId ? 'active' : ''} ${tab.isDirty ? 'dirty' : ''
                            }`}
                        onClick={(e) => handleTabClick(tab.id, e)}
                        onMouseDown={(e) => handleTabMiddleClick(tab.id, e)}
                    >
                        <span className="editor-tab-icon">
                            {getFileIcon({
                                name: tab.fileName,
                                type: 'file',
                                fileType: tab.fileType,
                                id: tab.fileId,
                                path: tab.fileName
                            })}
                        </span>
                        <span className="editor-tab-name">{tab.fileName}</span>
                        {tab.isDirty && (
                            <Circle size={8} className="editor-tab-dirty-indicator" fill="currentColor" />
                        )}
                        <button
                            className="editor-tab-close"
                            onClick={(e) => handleTabClose(tab.id, e)}
                            data-tooltip="Close (Ctrl+W)"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="editor-content">
                {activeTab ? (
                    <Editor
                        height="100%"
                        language={getMonacoLanguage(activeTab.fileType)}
                        value={currentCode}
                        onChange={(value) => onCodeChange(value || '')}
                        theme={theme}
                        options={{
                            fontSize,
                            fontFamily,
                            minimap: { enabled: true },
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth',
                            cursorSmoothCaretAnimation: 'on',
                            fontLigatures: true,
                            lineNumbers: 'on',
                            renderWhitespace: 'selection',
                            tabSize: 2,
                            insertSpaces: true,
                            formatOnPaste: true,
                            formatOnType: true,
                        }}
                        loading={
                            <div className="editor-loading">
                                <div className="spinner"></div>
                                <p>Loading Editor...</p>
                            </div>
                        }
                    />
                ) : (
                    <div className="editor-empty">
                        <div className="editor-empty-content">
                            <h2>Welcome to Visual Code Online! 🚀</h2>
                            <p>Select a file from the sidebar to start editing</p>
                            <div className="editor-empty-tips">
                                <h3>Quick Tips:</h3>
                                <ul>
                                    <li>🎨 Toggle theme with the sun/moon icon</li>
                                    <li>👁️ Enable live preview to see your changes</li>
                                    <li>📁 Right-click files for more options</li>
                                    <li>💾 Auto-save is enabled by default</li>
                                    <li>⬇️ Download your project as ZIP anytime</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorArea;
