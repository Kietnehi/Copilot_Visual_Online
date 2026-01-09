import type { FC } from 'react';
import { useEffect, useRef } from 'react';
import { RefreshCw, Maximize2, ExternalLink } from 'lucide-react';
import './PreviewPanel.css';

interface PreviewPanelProps {
    html: string;
    onRefresh: () => void;
    width?: number | undefined;
    onToggleExpand?: () => void; // toggle full preview inside app
}

const PreviewPanel: FC<PreviewPanelProps> = ({
    html,
    onRefresh,
    width,
    onToggleExpand,
}) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument || iframe.contentWindow?.document;

            if (doc) {
                doc.open();
                doc.write(html);
                doc.close();
            }
        }
    }, [html]);

    const handleOpenInNewTab = () => {
        // Create a downloadable HTML file so the browser knows the filename/type
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        // trigger download
        a.click();

        // cleanup
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };

    const handleFullscreen = () => {
        if (typeof onToggleExpand === 'function') {
            onToggleExpand();
            return;
        }

        if (iframeRef.current) {
            iframeRef.current.requestFullscreen();
        }
    };

    return (
        <div className="preview-panel" style={{ width: (typeof width === 'number') ? `${width}px` : '100%' }}>
            <div className="preview-header">
                <h3 className="preview-title">Live Preview</h3>
                <div className="preview-actions">
                    <button
                        className="preview-action-btn"
                        onClick={onRefresh}
                        data-tooltip="Refresh Preview"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button
                        className="preview-action-btn"
                        onClick={handleFullscreen}
                        data-tooltip="Fullscreen"
                    >
                        <Maximize2 size={14} />
                    </button>
                    <button
                        className="preview-action-btn"
                        onClick={handleOpenInNewTab}
                        data-tooltip="Open in New Tab"
                    >
                        <ExternalLink size={14} />
                    </button>
                </div>
            </div>

            <div className="preview-content">
                <iframe
                    ref={iframeRef}
                    title="Live Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    className="preview-iframe"
                />
            </div>
        </div>
    );
};

export default PreviewPanel;
