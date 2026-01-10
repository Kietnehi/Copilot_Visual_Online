import type { FC } from 'react';
import {
    Menu,
    FileCode,
    Settings,
    Download,
    Eye,
    EyeOff,
    Sun,
    Moon,
    Save,
    Bot
} from 'lucide-react';
import './Navbar.css';

interface NavbarProps {
    projectName: string;
    onNewProject: () => void;
    onOpenSettings: () => void;
    onDownloadProject: () => void;
    onTogglePreview: () => void;
    onToggleTheme: () => void;
    onToggleCopilot?: () => void;
    showPreview: boolean;
    showCopilot?: boolean;
    isDarkTheme: boolean;
    onSaveAll: () => void;
    hasUnsavedChanges: boolean;
}

const Navbar: FC<NavbarProps> = ({
    projectName,
    onNewProject,
    onOpenSettings,
    onDownloadProject,
    onTogglePreview,
    onToggleTheme,
    onToggleCopilot,
    showPreview,
    showCopilot,
    isDarkTheme,
    onSaveAll,
    hasUnsavedChanges,
}) => {
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <FileCode size={20} />
                    <span className="navbar-title">Visual Code Online</span>
                </div>
                <div className="navbar-project-name">{projectName}</div>
            </div>

            <div className="navbar-right">
                <button
                    className="navbar-btn"
                    onClick={onSaveAll}
                    disabled={!hasUnsavedChanges}
                    data-tooltip="Save All (Ctrl+S)"
                >
                    <Save size={18} />
                </button>

                <button
                    className="navbar-btn"
                    onClick={onTogglePreview}
                    data-tooltip={showPreview ? 'Hide Preview' : 'Show Preview'}
                >
                    {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>

                <button
                    className={`navbar-btn ${showCopilot ? 'active' : ''}`}
                    onClick={onToggleCopilot}
                    data-tooltip={showCopilot ? 'Hide AI Copilot' : 'Show AI Copilot'}
                >
                    <Bot size={18} />
                </button>

                <button
                    className="navbar-btn"
                    onClick={onToggleTheme}
                    data-tooltip={isDarkTheme ? 'Light Theme' : 'Dark Theme'}
                >
                    {isDarkTheme ? <Sun size={18} /> : <Moon size={18} />}
                </button>

                <div className="navbar-divider" />

                <button
                    className="navbar-btn"
                    onClick={onDownloadProject}
                    data-tooltip="Download Project (.zip)"
                >
                    <Download size={18} />
                </button>

                <button
                    className="navbar-btn"
                    onClick={onOpenSettings}
                    data-tooltip="Settings"
                >
                    <Settings size={18} />
                </button>

                <button
                    className="navbar-btn navbar-menu"
                    onClick={onNewProject}
                    data-tooltip="New Project"
                >
                    <Menu size={18} />
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
