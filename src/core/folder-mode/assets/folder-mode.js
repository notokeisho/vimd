/**
 * Folder mode client-side JavaScript
 */
(function() {
  'use strict';

  // Storage keys
  var STORAGE_KEY_EXPANDED = 'vimd-folder-expanded';
  var STORAGE_KEY_SIDEBAR_WIDTH = 'vimd-sidebar-width';
  var STORAGE_KEY_STATE = 'vimd-folder-mode-state';

  // State
  var fileTree = [];
  var ws = null;
  var expandedFolders = new Set();
  var isSidebarResizing = false;
  var isPanelResizing = false;

  // Panel state
  var state = {
    isSplitView: false,
    panels: [
      { file: null },
      { file: null }
    ],
    activePanel: 0,
    panelWidth: 720
  };

  // DOM elements
  var sidebar = document.getElementById('sidebar');
  var fileTreeEl = document.getElementById('file-tree');
  var preview = document.getElementById('preview');
  var sidebarResizer = document.getElementById('resizer');

  // Panel elements
  var panel1 = document.getElementById('panel1');
  var panel1Header = document.getElementById('panel1-header');
  var panel1Filename = document.getElementById('panel1-filename');
  var panel1Close = document.getElementById('panel1-close');
  var welcome = document.getElementById('welcome');
  var welcomeMessage = document.getElementById('welcome-message');
  var content = document.getElementById('content');

  // Panel 2 elements (created dynamically)
  var panel2 = null;
  var panel2Header = null;
  var panel2Filename = null;
  var panel2Close = null;
  var panel2Content = null;
  var panelResizer = null;

  // Context menu
  var contextMenu = document.getElementById('context-menu');
  var contextTarget = null;

  /**
   * Initialize the application
   */
  function init() {
    loadState();
    connectWebSocket();
    setupEventListeners();
    handleInitialPath();
    updatePanelUI();
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
      var width = localStorage.getItem(STORAGE_KEY_SIDEBAR_WIDTH);
      if (width) {
        sidebar.style.width = width + 'px';
      }
    } catch (e) {
      console.warn('[vimd] Failed to load sidebar width:', e);
    }

    // Load panel state
    try {
      var savedState = localStorage.getItem(STORAGE_KEY_STATE);
      if (savedState) {
        var parsed = JSON.parse(savedState);
        state.isSplitView = parsed.isSplitView || false;
        state.panels = parsed.panels || [{ file: null }, { file: null }];
        state.activePanel = parsed.activePanel || 0;
        state.panelWidth = parsed.panelWidth || 720;
      }
    } catch (e) {
      console.warn('[vimd] Failed to load panel state:', e);
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
        localStorage.setItem(STORAGE_KEY_SIDEBAR_WIDTH, width.toString());
      }
    } catch (e) {
      console.warn('[vimd] Failed to save sidebar width:', e);
    }
  }

  /**
   * Save panel state to localStorage
   */
  function savePanelState() {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify({
        isSplitView: state.isSplitView,
        panels: state.panels,
        activePanel: state.activePanel,
        panelWidth: state.panelWidth
      }));
    } catch (e) {
      console.warn('[vimd] Failed to save panel state:', e);
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
        // Restore files after tree loads
        restoreFilesFromState();
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
        handleFileDeleted(msg.data.path);
        break;

      default:
        console.warn('[vimd] Unknown message type:', msg.type);
    }
  }

  /**
   * Restore files from saved state
   */
  function restoreFilesFromState() {
    // Check if saved files exist
    var panel1File = state.panels[0].file;
    var panel2File = state.panels[1].file;

    // Reset if files don't exist
    if (panel1File && !fileExists(panel1File)) {
      state.panels[0].file = null;
    }
    if (panel2File && !fileExists(panel2File)) {
      state.panels[1].file = null;
    }

    // If both files are gone, reset to single panel welcome
    if (!state.panels[0].file && !state.panels[1].file) {
      state.isSplitView = false;
      state.activePanel = 0;
      savePanelState();
      updatePanelUI();
      return;
    }

    // Restore split view if needed
    if (state.isSplitView && state.panels[1].file) {
      createPanel2();
    }

    // Restore panel 1 file
    if (state.panels[0].file) {
      requestFile(state.panels[0].file, 0);
    }

    // Restore panel 2 file
    if (state.isSplitView && state.panels[1].file) {
      requestFile(state.panels[1].file, 1);
    }

    updatePanelUI();
  }

  /**
   * Check if file exists in tree
   */
  function fileExists(path) {
    function search(nodes) {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.type === 'file' && node.path === path) {
          return true;
        }
        if (node.type === 'folder' && node.children) {
          if (search(node.children)) {
            return true;
          }
        }
      }
      return false;
    }
    return search(fileTree);
  }

  /**
   * Handle file deleted event
   */
  function handleFileDeleted(path) {
    var needsUpdate = false;

    if (state.panels[0].file === path) {
      state.panels[0].file = null;
      needsUpdate = true;
    }
    if (state.panels[1].file === path) {
      state.panels[1].file = null;
      needsUpdate = true;
    }

    if (needsUpdate) {
      // If both panels are empty, close split view
      if (!state.panels[0].file && !state.panels[1].file) {
        closeSplitView();
      } else {
        updatePanelUI();
        savePanelState();
      }
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

    // Restore selection
    updateSelection();
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
    item.setAttribute('data-type', node.type);

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

      // Context menu handler for file
      item.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        e.stopPropagation();
        showContextMenu(e, node.path);
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
   * Select a file (open in active panel)
   */
  function selectFile(path) {
    openFileInPanel(path, state.activePanel);
  }

  /**
   * Open file in specific panel
   */
  function openFileInPanel(path, panelIndex) {
    state.panels[panelIndex].file = path;
    state.activePanel = panelIndex;
    requestFile(path, panelIndex);
    updateSelection();
    updatePanelUI();
    savePanelState();
    updateURL();
  }

  /**
   * Request file content from server
   */
  function requestFile(path, panelIndex) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'selectFile',
        path: path,
        panelIndex: panelIndex
      }));
    }
  }

  /**
   * Update visual selection in tree
   */
  function updateSelection() {
    // Remove previous selection
    var selected = fileTreeEl.querySelectorAll('.vimd-tree-item.selected');
    selected.forEach(function(el) {
      el.classList.remove('selected');
    });

    // Add selection for all open files
    state.panels.forEach(function(panel) {
      if (panel.file) {
        var item = fileTreeEl.querySelector('.vimd-tree-item[data-path="' + panel.file + '"]');
        if (item) {
          item.classList.add('selected');
        }
      }
    });
  }

  /**
   * Show file content
   */
  function showContent(path, html) {
    // Find which panel this content belongs to
    var panelIndex = -1;
    for (var i = 0; i < state.panels.length; i++) {
      if (state.panels[i].file === path) {
        panelIndex = i;
        break;
      }
    }

    if (panelIndex === -1) {
      // If not found, use active panel
      panelIndex = state.activePanel;
      state.panels[panelIndex].file = path;
    }

    if (panelIndex === 0) {
      welcome.classList.add('hidden');
      content.classList.add('visible');
      content.innerHTML = html;
      panel1Filename.textContent = getFileName(path);
      panel1Header.classList.add('visible');
    } else if (panelIndex === 1 && panel2Content) {
      panel2Content.innerHTML = html;
      panel2Content.classList.add('visible');
      panel2Filename.textContent = getFileName(path);
      panel2Header.classList.add('visible');
    }

    updatePanelUI();

    // Re-render MathJax if available
    if (window.MathJax && window.MathJax.typeset) {
      if (panelIndex === 0) {
        window.MathJax.typeset([content]);
      } else if (panel2Content) {
        window.MathJax.typeset([panel2Content]);
      }
    }
  }

  /**
   * Get file name from path
   */
  function getFileName(path) {
    return path.split('/').pop();
  }

  /**
   * Show welcome screen
   */
  function showWelcome(panelIndex) {
    if (panelIndex === 0 || panelIndex === undefined) {
      content.classList.remove('visible');
      content.innerHTML = '';
      welcome.classList.remove('hidden');
      panel1Header.classList.remove('visible');
      panel1Filename.textContent = '';
    }
    if (panelIndex === 1 && panel2Content) {
      panel2Content.classList.remove('visible');
      panel2Content.innerHTML = '';
      panel2Header.classList.remove('visible');
      panel2Filename.textContent = '';
    }
  }

  /**
   * Show error message
   */
  function showError(_type, message) {
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
  function updateURL() {
    var path = state.panels[state.activePanel].file;
    if (path) {
      history.pushState({ path: path }, '', '/' + encodeURIComponent(path).replace(/%2F/g, '/'));
    } else {
      history.pushState({ path: '/' }, '', '/');
    }
  }

  /**
   * Handle initial URL path
   */
  function handleInitialPath() {
    var path = decodeURIComponent(location.pathname.slice(1));
    if (path && path !== '' && !state.panels[0].file) {
      // Wait for tree to load then select file
      var checkTree = setInterval(function() {
        if (fileTree.length > 0) {
          clearInterval(checkTree);
          if (fileExists(path)) {
            selectFile(path);
          }
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
    // Sidebar resizer
    sidebarResizer.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isSidebarResizing = true;
      sidebarResizer.classList.add('active');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', function(e) {
      if (isSidebarResizing) {
        var width = e.clientX;
        var minWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-min-width'), 10) || 150;
        var maxWidth = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sidebar-max-width'), 10) || 500;

        if (width >= minWidth && width <= maxWidth) {
          sidebar.style.width = width + 'px';
        }
      }

      if (isPanelResizing && panelResizer) {
        var sidebarWidth = sidebar.offsetWidth;
        var panelWidth = e.clientX - sidebarWidth;
        var minPanelWidth = 100;
        var maxPanelWidth = preview.offsetWidth - minPanelWidth - 4; // 4px for resizer

        if (panelWidth >= minPanelWidth && panelWidth <= maxPanelWidth) {
          panel1.style.width = panelWidth + 'px';
          panel1.style.flex = 'none';
          state.panelWidth = panelWidth;
        }
      }
    });

    document.addEventListener('mouseup', function() {
      if (isSidebarResizing) {
        isSidebarResizing = false;
        sidebarResizer.classList.remove('active');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        saveSidebarWidth();
      }

      if (isPanelResizing) {
        isPanelResizing = false;
        if (panelResizer) {
          panelResizer.classList.remove('active');
        }
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        savePanelState();
      }
    });

    // Panel 1 close button
    panel1Close.addEventListener('click', function(e) {
      e.stopPropagation();
      closePanel(0);
    });

    // Panel 1 activation
    panel1.addEventListener('click', function() {
      setActivePanel(0);
    });

    // Context menu
    document.addEventListener('click', function() {
      hideContextMenu();
    });

    // Browser history
    window.addEventListener('popstate', function(e) {
      if (e.state && e.state.path) {
        var path = e.state.path;
        if (path === '/') {
          closePanel(state.activePanel);
        } else {
          path = path.replace(/^\//, '');
          if (fileExists(path)) {
            selectFile(path);
          }
        }
      }
    });
  }

  /**
   * Set active panel
   */
  function setActivePanel(index) {
    if (state.activePanel !== index) {
      state.activePanel = index;
      updatePanelUI();
      savePanelState();
      updateURL();
    }
  }

  /**
   * Close panel
   */
  function closePanel(index) {
    if (state.isSplitView) {
      if (index === 0) {
        // Move panel 2 to panel 1
        state.panels[0].file = state.panels[1].file;
        state.panels[1].file = null;

        // Move content from panel 2 to panel 1
        if (panel2Content && state.panels[0].file) {
          content.innerHTML = panel2Content.innerHTML;
          content.classList.add('visible');
          welcome.classList.add('hidden');
          panel1Filename.textContent = getFileName(state.panels[0].file);
          panel1Header.classList.add('visible');
        } else {
          showWelcome(0);
        }
      }

      // Close split view
      closeSplitView();
    } else {
      // Single panel - show welcome
      state.panels[0].file = null;
      showWelcome(0);
      savePanelState();
      updateURL();
    }
  }

  /**
   * Close split view
   */
  function closeSplitView() {
    state.isSplitView = false;
    state.panels[1].file = null;
    state.activePanel = 0;

    // Remove panel 2
    if (panel2) {
      panel2.remove();
      panel2 = null;
      panel2Header = null;
      panel2Filename = null;
      panel2Close = null;
      panel2Content = null;
    }

    // Remove resizer
    if (panelResizer) {
      panelResizer.remove();
      panelResizer = null;
    }

    // Reset panel 1 width
    panel1.style.width = '';
    panel1.style.flex = '';

    updatePanelUI();
    savePanelState();
  }

  /**
   * Create panel 2 for split view
   */
  function createPanel2() {
    if (panel2) return;

    // Create resizer
    panelResizer = document.createElement('div');
    panelResizer.className = 'vimd-panel-resizer visible';
    panelResizer.addEventListener('mousedown', function(e) {
      e.preventDefault();
      isPanelResizing = true;
      panelResizer.classList.add('active');
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    });

    // Create panel 2
    panel2 = document.createElement('div');
    panel2.className = 'vimd-panel';
    panel2.id = 'panel2';

    panel2Header = document.createElement('div');
    panel2Header.className = 'vimd-panel-header';
    panel2Header.id = 'panel2-header';

    panel2Filename = document.createElement('span');
    panel2Filename.className = 'vimd-panel-filename';
    panel2Filename.id = 'panel2-filename';

    panel2Close = document.createElement('button');
    panel2Close.className = 'vimd-panel-close';
    panel2Close.id = 'panel2-close';
    panel2Close.title = '閉じる';
    panel2Close.innerHTML = '&times;';
    panel2Close.addEventListener('click', function(e) {
      e.stopPropagation();
      closePanel(1);
    });

    panel2Header.appendChild(panel2Filename);
    panel2Header.appendChild(panel2Close);

    var panel2Body = document.createElement('div');
    panel2Body.className = 'vimd-panel-body';

    panel2Content = document.createElement('article');
    panel2Content.className = 'vimd-content markdown-body';
    panel2Content.id = 'content2';

    panel2Body.appendChild(panel2Content);
    panel2.appendChild(panel2Header);
    panel2.appendChild(panel2Body);

    // Panel 2 activation
    panel2.addEventListener('click', function() {
      setActivePanel(1);
    });

    // Insert into DOM
    preview.appendChild(panelResizer);
    preview.appendChild(panel2);

    // Set initial width for panel 1
    panel1.style.width = state.panelWidth + 'px';
    panel1.style.flex = 'none';
  }

  /**
   * Open split view
   */
  function openSplitView(path) {
    if (!state.isSplitView) {
      state.isSplitView = true;
      state.panelWidth = 720; // Reset to default
      createPanel2();
    }

    openFileInPanel(path, 1);
  }

  /**
   * Show context menu
   */
  function showContextMenu(e, path) {
    contextTarget = path;

    // Update menu items visibility
    var openItem = contextMenu.querySelector('[data-action="open"]');
    var openSplitItem = contextMenu.querySelector('[data-action="open-split"]');
    var openPanel1Item = contextMenu.querySelector('[data-action="open-panel1"]');
    var openPanel2Item = contextMenu.querySelector('[data-action="open-panel2"]');

    if (state.isSplitView) {
      // 2 panels mode
      openItem.classList.add('hidden');
      openSplitItem.classList.add('hidden');
      openPanel1Item.classList.remove('hidden');
      openPanel2Item.classList.remove('hidden');
    } else if (state.panels[0].file) {
      // 1 panel with file
      openItem.classList.remove('hidden');
      openSplitItem.classList.remove('hidden');
      openPanel1Item.classList.add('hidden');
      openPanel2Item.classList.add('hidden');
    } else {
      // Welcome screen
      openItem.classList.remove('hidden');
      openSplitItem.classList.add('hidden');
      openPanel1Item.classList.add('hidden');
      openPanel2Item.classList.add('hidden');
    }

    // Position menu
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.classList.add('visible');

    // Adjust position if off-screen
    var rect = contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      contextMenu.style.left = (window.innerWidth - rect.width - 5) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      contextMenu.style.top = (window.innerHeight - rect.height - 5) + 'px';
    }
  }

  /**
   * Hide context menu
   */
  function hideContextMenu() {
    contextMenu.classList.remove('visible');
    contextTarget = null;
  }

  /**
   * Handle context menu action
   */
  function handleContextAction(action) {
    if (!contextTarget) return;

    switch (action) {
      case 'open':
        selectFile(contextTarget);
        break;
      case 'open-split':
        openSplitView(contextTarget);
        break;
      case 'open-panel1':
        openFileInPanel(contextTarget, 0);
        break;
      case 'open-panel2':
        openFileInPanel(contextTarget, 1);
        break;
    }

    hideContextMenu();
  }

  // Setup context menu item click handlers
  contextMenu.addEventListener('click', function(e) {
    var item = e.target.closest('.vimd-context-item');
    if (item) {
      var action = item.getAttribute('data-action');
      handleContextAction(action);
    }
  });

  /**
   * Update panel UI based on state
   */
  function updatePanelUI() {
    // Update active panel indicator
    panel1Header.classList.remove('active');
    if (panel2Header) {
      panel2Header.classList.remove('active');
    }

    if (state.isSplitView) {
      if (state.activePanel === 0) {
        panel1Header.classList.add('active');
      } else if (panel2Header) {
        panel2Header.classList.add('active');
      }
    }

    // Update panel 1 header visibility
    if (state.panels[0].file) {
      panel1Header.classList.add('visible');
    } else {
      panel1Header.classList.remove('visible');
    }

    // Update panel 2 header visibility
    if (panel2Header) {
      if (state.panels[1].file) {
        panel2Header.classList.add('visible');
      } else {
        panel2Header.classList.remove('visible');
      }
    }
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
