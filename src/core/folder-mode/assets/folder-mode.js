/**
 * Folder mode client-side JavaScript
 */
(function() {
  'use strict';

  // Storage keys
  var STORAGE_KEY_EXPANDED = 'vimd-folder-expanded';
  var STORAGE_KEY_WIDTH = 'vimd-sidebar-width';

  // State
  var fileTree = [];
  var currentPath = null;
  var ws = null;
  var expandedFolders = new Set();
  var isResizing = false;

  // DOM elements
  var sidebar = document.getElementById('sidebar');
  var toggleBar = document.getElementById('toggle-bar');
  var toggleBtn = document.getElementById('toggle-btn');
  var toggleBtnCollapsed = document.getElementById('toggle-btn-collapsed');
  var fileTreeEl = document.getElementById('file-tree');
  var welcome = document.getElementById('welcome');
  var welcomeMessage = document.getElementById('welcome-message');
  var content = document.getElementById('content');
  var resizer = document.getElementById('resizer');

  /**
   * Initialize the application
   */
  function init() {
    loadState();
    connectWebSocket();
    setupEventListeners();
    handleInitialPath();
  }

  /**
   * Load saved state from localStorage
   */
  function loadState() {
    // Load expanded folders
    try {
      var saved = localStorage.getItem(STORAGE_KEY_EXPANDED);
      if (saved) {
        var arr = JSON.parse(saved);
        expandedFolders = new Set(arr);
      }
    } catch (e) {
      console.warn('[vimd] Failed to load expanded state:', e);
    }

    // Load sidebar width
    try {
      var width = localStorage.getItem(STORAGE_KEY_WIDTH);
      if (width) {
        sidebar.style.width = width + 'px';
      }
    } catch (e) {
      console.warn('[vimd] Failed to load sidebar width:', e);
    }
  }

  /**
   * Save expanded state to localStorage
   */
  function saveExpandedState() {
    try {
      localStorage.setItem(STORAGE_KEY_EXPANDED, JSON.stringify(Array.from(expandedFolders)));
    } catch (e) {
      console.warn('[vimd] Failed to save expanded state:', e);
    }
  }

  /**
   * Save sidebar width to localStorage
   */
  function saveSidebarWidth() {
    try {
      var width = parseInt(sidebar.style.width, 10);
      if (width) {
        localStorage.setItem(STORAGE_KEY_WIDTH, width.toString());
      }
    } catch (e) {
      console.warn('[vimd] Failed to save sidebar width:', e);
    }
  }

  /**
   * Connect to WebSocket server
   */
  function connectWebSocket() {
    var protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws = new WebSocket(protocol + '//' + location.host);

    ws.onopen = function() {
      console.log('[vimd] WebSocket connected');
    };

    ws.onmessage = function(event) {
      try {
        var msg = JSON.parse(event.data);
        handleMessage(msg);
      } catch (e) {
        console.error('[vimd] Failed to parse message:', e);
      }
    };

    ws.onclose = function() {
      console.log('[vimd] WebSocket disconnected, reconnecting...');
      setTimeout(connectWebSocket, 1000);
    };

    ws.onerror = function(error) {
      console.error('[vimd] WebSocket error:', error);
    };
  }

  /**
   * Handle incoming WebSocket message
   */
  function handleMessage(msg) {
    switch (msg.type) {
      case 'tree':
        fileTree = msg.data;
        renderTree();
        updateWelcomeMessage();
        break;

      case 'content':
        showContent(msg.data.path, msg.data.html);
        break;

      case 'reload':
        location.reload();
        break;

      case 'error':
        showError(msg.data.type, msg.data.message);
        break;

      case 'fileDeleted':
        if (currentPath === msg.data.path) {
          showWelcome();
          currentPath = null;
          updateURL('/');
        }
        break;

      default:
        console.warn('[vimd] Unknown message type:', msg.type);
    }
  }

  /**
   * Render the file tree
   */
  function renderTree() {
    fileTreeEl.innerHTML = '';

    if (fileTree.length === 0) {
      return;
    }

    fileTree.forEach(function(node) {
      var el = createTreeNode(node, 0);
      fileTreeEl.appendChild(el);
    });

    // Restore selection if current path exists
    if (currentPath) {
      updateSelection(currentPath);
    }
  }

  /**
   * Create a tree node element
   */
  function createTreeNode(node, depth) {
    var container = document.createElement('div');
    container.className = 'vimd-tree-node';

    var item = document.createElement('div');
    item.className = 'vimd-tree-item';
    item.setAttribute('data-path', node.path);
    item.setAttribute('data-depth', depth.toString());

    if (node.type === 'folder') {
      // Folder node
      var isExpanded = depth === 0 || expandedFolders.has(node.path);

      // Chevron
      var chevron = document.createElement('span');
      chevron.className = 'vimd-tree-chevron' + (isExpanded ? '' : ' collapsed');
      chevron.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16"><path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>';
      item.appendChild(chevron);

      // Folder icon
      var icon = document.createElement('span');
      icon.className = 'vimd-tree-icon';
      icon.innerHTML = isExpanded
        ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="#dcb67a"><path d="M1.5 3A1.5 1.5 0 013 1.5h3.586a1.5 1.5 0 011.06.44l.708.706a.5.5 0 00.353.147H13a1.5 1.5 0 011.5 1.5v.5H1.5V3z"/><path d="M1.5 5h13v7.5a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V5z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 16 16" fill="#dcb67a"><path d="M1.5 3A1.5 1.5 0 013 1.5h3.586a1.5 1.5 0 011.06.44l.708.706a.5.5 0 00.353.147H13a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V3z"/></svg>';
      item.appendChild(icon);

      // Folder name
      var name = document.createElement('span');
      name.className = 'vimd-tree-name';
      name.textContent = node.name;
      item.appendChild(name);

      // Click handler for folder
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleFolder(node.path, container, chevron, icon);
      });

      container.appendChild(item);

      // Children container
      var children = document.createElement('div');
      children.className = 'vimd-tree-children' + (isExpanded ? '' : ' collapsed');

      node.children.forEach(function(child) {
        var childEl = createTreeNode(child, depth + 1);
        children.appendChild(childEl);
      });

      container.appendChild(children);

      // Initialize expanded state
      if (isExpanded && depth > 0) {
        expandedFolders.add(node.path);
      }

    } else {
      // File node
      // File icon
      var fileIcon = document.createElement('span');
      fileIcon.className = 'vimd-tree-icon';
      fileIcon.innerHTML = getFileIcon(node.extension);
      item.appendChild(fileIcon);

      // File name
      var fileName = document.createElement('span');
      fileName.className = 'vimd-tree-name';
      fileName.textContent = node.name;
      item.appendChild(fileName);

      // Click handler for file
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        selectFile(node.path);
      });

      container.appendChild(item);
    }

    return container;
  }

  /**
   * Get file icon SVG based on extension
   */
  function getFileIcon(ext) {
    if (ext === '.md') {
      // Markdown icon
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="#519aba"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM3.5 3a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z"/><path d="M4 6v4h1V7.5l1 1.5 1-1.5V10h1V6H7l-1 1.5L5 6H4zm5 0v4h1V8h1V7H10V6H9zm3 0v4h1V6h-1z"/></svg>';
    } else {
      // TeX/LaTeX icon
      return '<svg width="16" height="16" viewBox="0 0 16 16" fill="#3d8137"><path d="M2 3.5A1.5 1.5 0 013.5 2h9A1.5 1.5 0 0114 3.5v9a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 12.5v-9zM3.5 3a.5.5 0 00-.5.5v9a.5.5 0 00.5.5h9a.5.5 0 00.5-.5v-9a.5.5 0 00-.5-.5h-9z"/><path d="M4 5h3v1H5.5v4h2V9H9v2H4V5zm5 0h3v1h-1v5h-1V6H9V5z"/></svg>';
    }
  }

  /**
   * Toggle folder expanded/collapsed state
   */
  function toggleFolder(path, container, chevron, icon) {
    var children = container.querySelector('.vimd-tree-children');
    var isExpanded = !children.classList.contains('collapsed');

    if (isExpanded) {
      children.classList.add('collapsed');
      chevron.classList.add('collapsed');
      icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#dcb67a"><path d="M1.5 3A1.5 1.5 0 013 1.5h3.586a1.5 1.5 0 011.06.44l.708.706a.5.5 0 00.353.147H13a1.5 1.5 0 011.5 1.5v8a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V3z"/></svg>';
      expandedFolders.delete(path);
    } else {
      children.classList.remove('collapsed');
      chevron.classList.remove('collapsed');
      icon.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="#dcb67a"><path d="M1.5 3A1.5 1.5 0 013 1.5h3.586a1.5 1.5 0 011.06.44l.708.706a.5.5 0 00.353.147H13a1.5 1.5 0 011.5 1.5v.5H1.5V3z"/><path d="M1.5 5h13v7.5a1.5 1.5 0 01-1.5 1.5H3a1.5 1.5 0 01-1.5-1.5V5z"/></svg>';
      expandedFolders.add(path);
    }

    saveExpandedState();
  }

  /**
   * Select a file
   */
  function selectFile(path) {
    if (currentPath === path) {
      return;
    }

    // Update selection
    updateSelection(path);

    // Send to server
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'selectFile', path: path }));
    }

    // Update URL
    updateURL('/' + encodeURIComponent(path).replace(/%2F/g, '/'));

    currentPath = path;
  }

  /**
   * Update visual selection in tree
   */
  function updateSelection(path) {
    // Remove previous selection
    var selected = fileTreeEl.querySelectorAll('.vimd-tree-item.selected');
    selected.forEach(function(el) {
      el.classList.remove('selected');
    });

    // Add new selection
    var item = fileTreeEl.querySelector('.vimd-tree-item[data-path="' + path + '"]');
    if (item) {
      item.classList.add('selected');
    }
  }

  /**
   * Show file content
   */
  function showContent(path, html) {
    welcome.classList.add('hidden');
    content.classList.add('visible');
    content.innerHTML = html;

    // Update selection
    updateSelection(path);
    currentPath = path;

    // Re-render MathJax if available
    if (window.MathJax && window.MathJax.typeset) {
      window.MathJax.typeset([content]);
    }
  }

  /**
   * Show welcome screen
   */
  function showWelcome() {
    content.classList.remove('visible');
    content.innerHTML = '';
    welcome.classList.remove('hidden');
  }

  /**
   * Show error message
   */
  function showError(type, message) {
    welcome.classList.add('hidden');
    content.classList.add('visible');
    content.innerHTML = '<div class="vimd-error"><h2>Error</h2><p>' + escapeHtml(message) + '</p></div>';
  }

  /**
   * Update welcome message based on file tree
   */
  function updateWelcomeMessage() {
    if (fileTree.length === 0) {
      welcomeMessage.textContent = 'No markdown or LaTeX files found';
    } else {
      welcomeMessage.textContent = 'Select a file from the sidebar';
    }
  }

  /**
   * Update URL without page reload
   */
  function updateURL(path) {
    history.pushState({ path: path }, '', path);
  }

  /**
   * Handle initial URL path
   */
  function handleInitialPath() {
    var path = decodeURIComponent(location.pathname.slice(1));
    if (path && path !== '') {
      // Wait for tree to load then select file
      var checkTree = setInterval(function() {
        if (fileTree.length > 0) {
          clearInterval(checkTree);
          selectFile(path);
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(function() {
        clearInterval(checkTree);
      }, 5000);
    }
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Sidebar toggle buttons
    toggleBtn.addEventListener('click', function() {
      collapseSidebar();
    });

    toggleBtnCollapsed.addEventListener('click', function() {
      expandSidebar();
    });

    // Keyboard shortcut (Ctrl+B or Cmd+B)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        if (sidebar.classList.contains('collapsed')) {
          expandSidebar();
        } else {
          collapseSidebar();
        }
      }
    });

    // Resizer
    resizer.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isResizing = true;
      resizer.classList.add('active');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (!isResizing) return;

      var width = e.clientX;
      var minWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-min-width'), 10) || 150;
      var maxWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-max-width'), 10) || 500;

      if (width >= minWidth && width <= maxWidth) {
        sidebar.style.width = width + 'px';
      }
    });

    document.addEventListener('mouseup', function() {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        saveSidebarWidth();
      }
    });

    // Browser history
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.path) {
        var path = e.state.path.slice(1); // Remove leading /
        if (path) {
          selectFile(path);
        } else {
          showWelcome();
          currentPath = null;
        }
      }
    });
  }

  /**
   * Collapse sidebar
   */
  function collapseSidebar() {
    sidebar.classList.add('collapsed');
    toggleBar.classList.add('visible');
  }

  /**
   * Expand sidebar
   */
  function expandSidebar() {
    sidebar.classList.remove('collapsed');
    toggleBar.classList.remove('visible');
  }

  /**
   * Escape HTML special characters
   */
  function escapeHtml(text) {
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
