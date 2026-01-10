import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import type { Project, FileNode } from '../types';
import './CopilotPanel.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
interface Message {
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    timestamp: Date;
}

interface IndexStatus {
    status: string;
    progress: number;
    message: string;
    stats: {
        total_files?: number;
        total_chunks?: number;
    };
}

interface CopilotPanelProps {
    project?: Project;
}

const CopilotPanel: React.FC<CopilotPanelProps> = ({ project }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [indexStatus, setIndexStatus] = useState<IndexStatus | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const API_URL = 'http://localhost:8000';

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check status on mount
    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 2000);
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/status`);
            const data = await response.json();
            setIndexStatus(data);
        } catch (error) {
            console.error('Failed to check status:', error);
        }
    };

    const flattenFiles = (nodes: FileNode[]): FileNode[] => {
        let result: FileNode[] = [];
        for (const node of nodes) {
            if (node.type === 'file') {
                result.push(node);
            } else if (node.children) {
                result = result.concat(flattenFiles(node.children));
            }
        }
        return result;
    };

    const handleIndexCurrentProject = async () => {
        if (!project || !project.files || project.files.length === 0) {
            alert('No project files to index. Please create some files first!');
            return;
        }

        try {
            // Flatten the file tree to get all files
            const allFiles = flattenFiles(project.files);

            // Filter only actual files with content
            const filesToIndex = allFiles
                .filter(f => f.type === 'file' && f.content)
                .map(f => ({
                    path: f.path,
                    content: f.content || '',
                    extension: f.name.includes('.') ? '.' + f.name.split('.').pop()! : '.txt'
                }));

            if (filesToIndex.length === 0) {
                alert('No files with content found to index!');
                return;
            }

            const response = await fetch(`${API_URL}/index-files`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    files: filesToIndex,
                    project_name: project.name
                })
            });

            if (response.ok) {
                setMessages([{
                    role: 'assistant',
                    content: `🚀 Indexing ${filesToIndex.length} files from "${project.name}"! This may take a moment. I'll let you know when I'm ready.`,
                    timestamp: new Date()
                }]);
            } else {
                const error = await response.json();
                alert(`Failed to start indexing: ${error.detail}`);
            }
        } catch (error) {
            alert('Failed to connect to backend. Make sure the server is running on port 8000.');
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        if (indexStatus?.status !== 'ready') {
            alert('Please index your project first! Click the status badge at the top.');
            return;
        }

        const userMessage: Message = {
            role: 'user',
            content: inputValue,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: inputValue,
                    top_k: 5
                })
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.answer,
                sources: data.sources,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            const errorMessage: Message = {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please make sure the backend server is running and try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getStatusIcon = () => {
        switch (indexStatus?.status) {
            case 'ready':
                return <CheckCircle className="status-icon ready" />;
            case 'indexing':
                return <Loader2 className="status-icon indexing" />;
            case 'error':
                return <AlertCircle className="status-icon error" />;
            default:
                return <AlertCircle className="status-icon not-ready" />;
        }
    };

    const getStatusText = () => {
        if (!indexStatus) return 'Connecting...';

        switch (indexStatus.status) {
            case 'ready':
                return `Ready • ${indexStatus.stats.total_files || 0} files indexed`;
            case 'indexing':
                return `Indexing... ${indexStatus.progress}%`;
            case 'error':
                return 'Error - Click to retry';
            default:
                return 'Not indexed - Click to start';
        }
    };

    return (
        <div className="copilot-panel">
            {/* Header */}
            <div className="copilot-header">
                <div className="header-title">
                    <Sparkles className="sparkle-icon" />
                    <h2>AI Code Copilot</h2>
                </div>
                <div
                    className="status-badge"
                    onClick={() => indexStatus?.status !== 'ready' && handleIndexCurrentProject()}
                >
                    {getStatusIcon()}
                    <span>{getStatusText()}</span>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-container">
                {messages.length === 0 && (
                    <div className="welcome-message">
                        <Bot size={48} className="welcome-icon" />
                        <h3>Welcome to AI Code Copilot!</h3>
                        <p>Ask me anything about your codebase:</p>
                        <ul className="example-questions">
                            <li>✨ "What does this project do?"</li>
                            <li>🔍 "Where is the authentication handled?"</li>
                            <li>🛠️ "How do I add a new component?"</li>
                            <li>📝 "Explain the file structure"</li>
                        </ul>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.role}`}>
                        <div className="message-icon">
                            {message.role === 'user' ? (
                                <User size={20} />
                            ) : (
                                <Bot size={20} />
                            )}
                        </div>
                        <div className="message-content">
                            <div className="message-text">
                                <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({node, inline, className, children, ...props}) {
                                    const match = /language-(\w+)/.exec(className || '');
                                    return !inline && match ? (
                                        <SyntaxHighlighter style={oneDark} language={match[1]} PreTag="div" {...props}>
                                        {String(children).replace(/\n$/, '')}
                                        </SyntaxHighlighter>
                                    ) : (
                                        <code className={className} {...props}>
                                        {children}
                                        </code>
                                    );
                                    }
                                }}
                                >
                                {message.content}
                                </ReactMarkdown>

                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <div className="message-sources">
                                    <strong>📂 Sources:</strong>
                                    {message.sources.map((source, i) => (
                                        <code key={i} className="source-file">{source}</code>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="message assistant">
                        <div className="message-icon">
                            <Bot size={20} />
                        </div>
                        <div className="message-content">
                            <div className="typing-indicator">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-container">
                <textarea
                    className="message-input"
                    placeholder="Ask about your codebase..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading || indexStatus?.status !== 'ready'}
                    rows={1}
                />
                <button
                    className="send-button"
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputValue.trim() || indexStatus?.status !== 'ready'}
                >
                    <Send size={20} />
                </button>
            </div>

        </div>
    );
};

export default CopilotPanel;
