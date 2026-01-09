import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import {
    FilePlus,
    FolderPlus,
    Edit,
    Trash2,
    Copy,
    Download
} from 'lucide-react';
import type { ContextMenuPosition, FileNode } from '../types';
import './ContextMenu.css';

interface ContextMenuProps {
    position: ContextMenuPosition;
    node: FileNode | null;
    onNewFile: () => void;
    onNewFolder: () => void;
    onRename: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    onDownload: () => void;
    onClose: () => void;
}

const ContextMenu: FC<ContextMenuProps> = ({
    position,
    node,
    onNewFile,
    onNewFolder,
    onRename,
    onDelete,
    onDuplicate,
    onDownload,
    onClose,
}) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                onClose();
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [onClose]);

    if (!node) return null;

    const menuItems = [
        {
            label: 'New File',
            icon: <FilePlus size={14} />,
            action: onNewFile,
            show: node.type === 'folder'
        },
        {
            label: 'New Folder',
            icon: <FolderPlus size={14} />,
            action: onNewFolder,
            show: node.type === 'folder'
        },
        {
            divider: true,
            show: node.type === 'folder'
        },
        {
            label: 'Rename',
            icon: <Edit size={14} />,
            action: onRename,
            show: true
        },
        {
            label: 'Duplicate',
            icon: <Copy size={14} />,
            action: onDuplicate,
            show: node.type === 'file'
        },
        {
            divider: true,
            show: true
        },
        {
            label: 'Download',
            icon: <Download size={14} />,
            action: onDownload,
            show: true
        },
        {
            label: 'Delete',
            icon: <Trash2 size={14} />,
            action: onDelete,
            show: true,
            danger: true
        },
    ];

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{ left: position.x, top: position.y }}
        >
            {menuItems.map((item, index) => {
                if (!item.show) return null;

                if (item.divider) {
                    return <div key={`divider-${index}`} className="context-menu-divider" />;
                }

                return (
                    <div
                        key={item.label}
                        className={`context-menu-item ${item.danger ? 'danger' : ''}`}
                        onClick={() => {
                            item.action?.();
                            onClose();
                        }}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ContextMenu;
