import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FileNode, FileType, Project } from './types';

// Generate unique IDs
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Get file type from extension
export const getFileType = (fileName: string): FileType => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'html':
            return 'html';
        case 'css':
            return 'css';
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'json':
            return 'json';
        case 'md':
            return 'markdown';
        default:
            return 'text';
    }
};

// Get Monaco Editor language from file type
export const getMonacoLanguage = (fileType: FileType): string => {
    const languageMap: Record<FileType, string> = {
        html: 'html',
        css: 'css',
        javascript: 'javascript',
        typescript: 'typescript',
        json: 'json',
        markdown: 'markdown',
        text: 'plaintext',
    };
    return languageMap[fileType] || 'plaintext';
};

// Get file icon based on type
export const getFileIcon = (node: FileNode): string => {
    if (node.type === 'folder') {
        return node.isOpen ? '📂' : '📁';
    }

    const iconMap: Record<string, string> = {
        html: '🌐',
        css: '🎨',
        javascript: '📜',
        typescript: '📘',
        json: '📋',
        markdown: '📝',
        text: '📄',
    };

    return iconMap[node.fileType || 'text'] || '📄';
};

// Find a node by ID in the file tree
export const findNodeById = (nodes: FileNode[], id: string): FileNode | null => {
    for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
            const found = findNodeById(node.children, id);
            if (found) return found;
        }
    }
    return null;
};

// Find parent node
export const findParentNode = (nodes: FileNode[], childId: string): FileNode | null => {
    for (const node of nodes) {
        if (node.children?.some(child => child.id === childId)) {
            return node;
        }
        if (node.children) {
            const found = findParentNode(node.children, childId);
            if (found) return found;
        }
    }
    return null;
};

// Get full path of a node
export const getNodePath = (nodes: FileNode[], nodeId: string): string => {
    const node = findNodeById(nodes, nodeId);
    if (!node) return '';
    return node.path;
};

// Create a new file node
export const createFileNode = (
    name: string,
    type: 'file' | 'folder',
    parentPath: string = ''
): FileNode => {
    const path = parentPath ? `${parentPath}/${name}` : name;
    const node: FileNode = {
        id: generateId(),
        name,
        type,
        path,
        isOpen: false,
    };

    if (type === 'file') {
        node.fileType = getFileType(name);
        node.content = getDefaultContent(node.fileType);
    } else {
        node.children = [];
    }

    return node;
};

// Get default content for new files
const getDefaultContent = (fileType: FileType): string => {
    switch (fileType) {
        case 'html':
            return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <h1>Hello World!</h1>
  <script src="script.js"></script>
</body>
</html>`;
        case 'css':
            return `/* Stylesheet */
body {
  margin: 0;
  padding: 0;
  font-family: sans-serif;
}`;
        case 'javascript':
            return `// JavaScript
console.log('Hello World!');`;
        case 'typescript':
            return `// TypeScript
const message: string = 'Hello World!';
console.log(message);`;
        case 'json':
            return `{
  "name": "project",
  "version": "1.0.0"
}`;
        case 'markdown':
            return `# Heading

This is a markdown file.`;
        default:
            return '';
    }
};

// Delete a node from the tree
export const deleteNode = (nodes: FileNode[], nodeId: string): FileNode[] => {
    return nodes.filter(node => {
        if (node.id === nodeId) return false;
        if (node.children) {
            node.children = deleteNode(node.children, nodeId);
        }
        return true;
    });
};

// Rename a node
export const renameNode = (
    nodes: FileNode[],
    nodeId: string,
    newName: string
): FileNode[] => {
    return nodes.map(node => {
        if (node.id === nodeId) {
            const pathParts = node.path.split('/');
            pathParts[pathParts.length - 1] = newName;
            return {
                ...node,
                name: newName,
                path: pathParts.join('/'),
                fileType: node.type === 'file' ? getFileType(newName) : undefined,
            };
        }
        if (node.children) {
            return {
                ...node,
                children: renameNode(node.children, nodeId, newName),
            };
        }
        return node;
    });
};

// Update file content
export const updateFileContent = (
    nodes: FileNode[],
    fileId: string,
    content: string
): FileNode[] => {
    return nodes.map(node => {
        if (node.id === fileId) {
            return { ...node, content };
        }
        if (node.children) {
            return {
                ...node,
                children: updateFileContent(node.children, fileId, content),
            };
        }
        return node;
    });
};

// Toggle folder open/close
export const toggleFolder = (nodes: FileNode[], folderId: string): FileNode[] => {
    return nodes.map(node => {
        if (node.id === folderId && node.type === 'folder') {
            return { ...node, isOpen: !node.isOpen };
        }
        if (node.children) {
            return {
                ...node,
                children: toggleFolder(node.children, folderId),
            };
        }
        return node;
    });
};

// Add a child node to a parent
export const addNodeToParent = (
    nodes: FileNode[],
    parentId: string | null,
    newNode: FileNode
): FileNode[] => {
    if (!parentId) {
        return [...nodes, newNode];
    }

    return nodes.map(node => {
        if (node.id === parentId) {
            return {
                ...node,
                children: [...(node.children || []), newNode],
                isOpen: true,
            };
        }
        if (node.children) {
            return {
                ...node,
                children: addNodeToParent(node.children, parentId, newNode),
            };
        }
        return node;
    });
};

// Flatten file tree to get all files
export const flattenFileTree = (nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    const traverse = (nodes: FileNode[]) => {
        nodes.forEach(node => {
            result.push(node);
            if (node.children) {
                traverse(node.children);
            }
        });
    };
    traverse(nodes);
    return result;
};

// Download project as ZIP
export const downloadProjectAsZip = async (project: Project): Promise<void> => {
    const zip = new JSZip();

    const addToZip = (nodes: FileNode[], folder: JSZip) => {
        nodes.forEach(node => {
            if (node.type === 'file') {
                folder.file(node.name, node.content || '');
            } else if (node.type === 'folder' && node.children) {
                const subFolder = folder.folder(node.name);
                if (subFolder) {
                    addToZip(node.children, subFolder);
                }
            }
        });
    };

    addToZip(project.files, zip);

    const blob = await zip.generateAsync({ type: 'blob', mimeType: 'application/zip' });
    saveAs(blob, `${project.name}.zip`);
};

// Create sample project
export const createSampleProject = (): Project => {
    const indexHtml = createFileNode('index.html', 'file');
    indexHtml.content = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Awesome Project</title>
  <link rel="stylesheet" href="styles/style.css">
</head>
<body>
  <div class="container">
    <h1>Welcome to Visual Code Online! 🚀</h1>
    <p>Start building your amazing project here.</p>
    <button id="btn">Click me!</button>
  </div>
  <script src="scripts/script.js"></script>
</body>
</html>`;

    const stylesFolder = createFileNode('styles', 'folder');
    const stylesCss = createFileNode('style.css', 'file', 'styles');
    stylesCss.content = `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.container {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: fadeIn 1s ease;
}

p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

button {
  padding: 12px 30px;
  font-size: 1rem;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
}

button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}`;

    const scriptsFolder = createFileNode('scripts', 'folder');
    const scriptsJs = createFileNode('script.js', 'file', 'scripts');
    scriptsJs.content = `// Interactive Script
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('btn');
  
  btn.addEventListener('click', () => {
    btn.textContent = 'You clicked me! 🎉';
    btn.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
    btn.style.color = 'white';
  });
  
  console.log('Welcome to Visual Code Online! 🚀');
});`;

    stylesFolder.children = [stylesCss];
    scriptsFolder.children = [scriptsJs];

    const readmeMd = createFileNode('README.md', 'file');
    readmeMd.content = `# My Awesome Project

This is a sample project created with **Visual Code Online**.

## Features
- 🎨 Beautiful gradient design
- ✨ Interactive button
- 📱 Responsive layout
- 🚀 Modern web technologies

## Getting Started
1. Explore the code
2. Modify as you like
3. See live preview
4. Download when ready!

Enjoy coding! 💻`;

    return {
        id: generateId(),
        name: 'My Awesome Project',
        files: [indexHtml, stylesFolder, scriptsFolder, readmeMd],
        activeFileId: indexHtml.id,
        createdAt: Date.now(),
        lastModified: Date.now(),
    };
};

// Sort nodes: folders first, then files
export const sortNodes = (nodes: FileNode[]): FileNode[] => {
    return [...nodes].sort((a, b) => {
        if (a.type === b.type) {
            return a.name.localeCompare(b.name);
        }
        return a.type === 'folder' ? -1 : 1;
    });
};

// Generate live preview HTML
export const generatePreviewHTML = (project: Project): string => {
    const files = flattenFileTree(project.files);
    const htmlFile = files.find(f => f.fileType === 'html' && f.name === 'index.html');

    if (!htmlFile || !htmlFile.content) {
        return '<html><body><h1>No index.html found</h1></body></html>';
    }

    let html = htmlFile.content;

    // Inject CSS
    const cssFiles = files.filter(f => f.fileType === 'css');
    cssFiles.forEach(cssFile => {
        if (cssFile.content) {
            const cssPath = cssFile.path;
            html = html.replace(
                new RegExp(`<link[^>]*href=["']${cssPath}["'][^>]*>`, 'g'),
                `<style>${cssFile.content}</style>`
            );
        }
    });

    // Inject JS
    const jsFiles = files.filter(f => f.fileType === 'javascript');
    jsFiles.forEach(jsFile => {
        if (jsFile.content) {
            const jsPath = jsFile.path;
            html = html.replace(
                new RegExp(`<script[^>]*src=["']${jsPath}["'][^>]*></script>`, 'g'),
                `<script>${jsFile.content}</script>`
            );
        }
    });

    return html;
};
