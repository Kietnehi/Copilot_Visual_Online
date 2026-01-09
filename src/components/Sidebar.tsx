import type { FC, MouseEvent } from 'react';
import { useState } from 'react';
import {
    ChevronRight,
    ChevronDown,
    File,
    Folder,
    FolderOpen,
    Copy,
    Plus,
    Search
} from 'lucide-react';
import type { FileNode } from '../types';
import { getFileIcon, copyToClipboard } from '../utils';
import './Sidebar.css';

interface SidebarProps {
    files: FileNode[];
    activeFileId: string | null;
    onFileSelect: (fileId: string) => void;
    onFolderToggle: (folderId: string) => void;
    onContextMenu: (e: MouseEvent, node: FileNode) => void;
    onNewFile: () => void;
    onNewFolder: () => void;
    width: number;
}

const Sidebar: FC<SidebarProps> = ({
    files,
    activeFileId,
    onFileSelect,
    onFolderToggle,
    onContextMenu,
    onNewFile,
    onNewFolder,
    width,
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filterFiles = (nodes: FileNode[]): FileNode[] => {
        if (!searchQuery) return nodes;

        return nodes.filter(node => {
            if (node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
                return true;
            }
            if (node.children) {
                const filtered = filterFiles(node.children);
                return filtered.length > 0;
            }
            return false;
        });
    };

    const renderFileTree = (nodes: FileNode[], level: number = 0) => {
        return filterFiles(nodes).map(node => (
            <div key={node.id} className="file-tree-item-wrapper" style={{ paddingLeft: `${level * 5 + 8}px` }}>
                <div
                    className={`file-tree-item ${node.id === activeFileId ? 'active' : ''}`}
                    onClick={() => {
                        if (node.type === 'folder') {
                            onFolderToggle(node.id);
                        } else {
                            onFileSelect(node.id);
                        }
                    }}
                    onContextMenu={(e) => onContextMenu(e, node)}
                >
                    {/* ĐÃ SỬA: Chỉ giữ lại 1 block span này */}
                    <span className="file-tree-chevron">
                        {node.type === 'folder' ? (
                            node.isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                        ) : (
                            /* Giữ khoảng trống nếu là file để icon thẳng hàng với folder */
                            <span style={{ width: 14, display: 'inline-block' }} />
                        )}
                    </span>

                    <span className="file-tree-emoji">{getFileIcon(node)}</span>
                    <span className="file-tree-name">{node.name}</span>

                    <button
                        className="file-copy-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (node.path) {
                                copyToClipboard(node.path);
                                setCopiedId(node.id);
                                setTimeout(() => {
                                    setCopiedId((prev) => (prev === node.id ? null : prev));
                                }, 1500);
                            }
                        }}
                        title="Copy path"
                    >
                        <Copy size={12} />
                    </button>
                    {copiedId === node.id && (
                        <span className="file-copy-indicator">Copied</span>
                    )}
                </div>
                {node.type === 'folder' && node.isOpen && node.children && (
                    <div className="file-tree-children">
                        {renderFileTree(node.children, level + 1)}
                    </div>
                )}
            </div>
        ));
    };

    return (
        <div className="sidebar" style={{ width: `${width}px` }}>
            <div className="sidebar-header">
                <h3 className="sidebar-title">Explorer</h3>
                <div className="sidebar-actions">
                    <button
                        className="sidebar-action-btn"
                        onClick={onNewFile}
                        data-tooltip="New File"
                    >
                        <File size={16} />
                        <Plus size={10} className="sidebar-action-plus" />
                    </button>
                    <button
                        className="sidebar-action-btn"
                        onClick={onNewFolder}
                        data-tooltip="New Folder"
                    >
                        <Folder size={16} />
                        <Plus size={10} className="sidebar-action-plus" />
                    </button>
                </div>
            </div>

            <div className="sidebar-search">
                <Search size={14} />
                <input
                    type="text"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="sidebar-search-input"
                />
            </div>

            <div className="sidebar-content">
                {files.length === 0 ? (
                    <div className="sidebar-empty">
                        <p>No files yet</p>
                        <button onClick={onNewFile} className="sidebar-empty-btn">
                            Create your first file
                        </button>
                    </div>
                ) : (
                    <div className="file-tree">{renderFileTree(files)}</div>
                )}
            </div>
        </div>
    );
};

export default Sidebar;
