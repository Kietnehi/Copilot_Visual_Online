import type { FC } from 'react';
import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import type { EditorSettings } from '../types';
import './SettingsModal.css';

interface SettingsModalProps {
    settings: EditorSettings;
    onSave: (settings: EditorSettings) => void;
    onClose: () => void;
}

const SettingsModal: FC<SettingsModalProps> = ({
    settings,
    onSave,
    onClose,
}) => {
    const [localSettings, setLocalSettings] = useState(settings);

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    const fontOptions = [
        'JetBrains Mono',
        'Fira Code',
        'Source Code Pro',
        'Consolas',
        'Monaco',
        'Courier New',
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title-group">
                        <SettingsIcon size={20} />
                        <h2 className="modal-title">Editor Settings</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="settings-section">
                        <h3 className="settings-section-title">Theme</h3>
                        <div className="settings-group">
                            <label className="settings-label">
                                Editor Theme
                                <select
                                    value={localSettings.theme}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        theme: e.target.value as 'vs-dark' | 'light'
                                    })}
                                    className="settings-select"
                                >
                                    <option value="vs-dark">Dark</option>
                                    <option value="light">Light</option>
                                </select>
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Font</h3>
                        <div className="settings-group">
                            <label className="settings-label">
                                Font Family
                                <select
                                    value={localSettings.fontFamily}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        fontFamily: e.target.value
                                    })}
                                    className="settings-select"
                                >
                                    {fontOptions.map(font => (
                                        <option key={font} value={font}>{font}</option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        <div className="settings-group">
                            <label className="settings-label">
                                Font Size: {localSettings.fontSize}px
                                <input
                                    type="range"
                                    min="10"
                                    max="24"
                                    value={localSettings.fontSize}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        fontSize: parseInt(e.target.value)
                                    })}
                                    className="settings-slider"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Editor</h3>
                        <div className="settings-group">
                            <label className="settings-label">
                                Tab Size
                                <input
                                    type="number"
                                    min="2"
                                    max="8"
                                    value={localSettings.tabSize}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        tabSize: parseInt(e.target.value) || 2
                                    })}
                                    className="settings-input"
                                />
                            </label>
                        </div>
                        <div className="settings-group">
                            <label className="settings-checkbox">
                                <input
                                    type="checkbox"
                                    checked={localSettings.wordWrap === 'on'}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        wordWrap: e.target.checked ? 'on' : 'off'
                                    })}
                                />
                                <span>Word Wrap</span>
                            </label>
                        </div>
                        <div className="settings-group">
                            <label className="settings-checkbox">
                                <input
                                    type="checkbox"
                                    checked={localSettings.minimap}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        minimap: e.target.checked
                                    })}
                                />
                                <span>Show Minimap</span>
                            </label>
                        </div>
                        <div className="settings-group">
                            <label className="settings-checkbox">
                                <input
                                    type="checkbox"
                                    checked={localSettings.lineNumbers}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        lineNumbers: e.target.checked
                                    })}
                                />
                                <span>Show Line Numbers</span>
                            </label>
                        </div>
                    </div>

                    <div className="settings-section">
                        <h3 className="settings-section-title">Auto Save</h3>
                        <div className="settings-group">
                            <label className="settings-checkbox">
                                <input
                                    type="checkbox"
                                    checked={localSettings.autoSave}
                                    onChange={(e) => setLocalSettings({
                                        ...localSettings,
                                        autoSave: e.target.checked
                                    })}
                                />
                                <span>Enable Auto Save</span>
                            </label>
                        </div>
                        {localSettings.autoSave && (
                            <div className="settings-group">
                                <label className="settings-label">
                                    Auto Save Delay: {localSettings.autoSaveDelay}ms
                                    <input
                                        type="range"
                                        min="500"
                                        max="5000"
                                        step="100"
                                        value={localSettings.autoSaveDelay}
                                        onChange={(e) => setLocalSettings({
                                            ...localSettings,
                                            autoSaveDelay: parseInt(e.target.value)
                                        })}
                                        className="settings-slider"
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="modal-btn modal-btn-secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="modal-btn modal-btn-primary" onClick={handleSave}>
                        Save Settings
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
