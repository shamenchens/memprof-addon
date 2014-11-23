'use strict';
(function(exports) {
  function TreeManager(option) {
    this._elements = option.elements;
    this.store = option.store;
  }

  TreeManager.prototype = {
    start: function tm_start() {
      window.addEventListener('dataReady', this);
    },

    stop: function tm_stop() {
      window.removeEventListener('dataReady', this);
    },

    handleEvent: function tm_handleEvent(event) {
      switch (event.type) {
        case 'dataReady':
          this.showTreeView();
          break;
        default:
          break;
      }
    },

    showTreeView: function tm_showTreeView() {
      var treeData = this.store.getTreeData();
      this.addTreeHeader();
      this.addTreeNode(treeData.root, 0);
      this.addNodeEventListener();
      // this.collapseRoot();
    },

    addTreeHeader: function tm_addTreeHeader() {
      var treeHeader = '<div class="treeHeader">' +
        '<span>selfAccu</span>' +
        '<span>totalAccu</span>' +
        '<span>selfSize</span>' +
        '<span>totalSize</span>' +
        '<span>selfPeak</span>' +
        '<span>totalPeak</span>' +
        '<span>name</span>' +
        '</div>';
      this._elements.treePanel.innerHTML = treeHeader;
    },

    addTreeNode: function tm_walk(node, depth) {
      var nodeClass = node.children.length > 0 ? 'treeNode' : 'treeNode leaf';
      var treeNode = '';
      treeNode = '<div class="' + nodeClass + '" data-depth="' + depth +'">' +
        '<span>' + node.matrix.selfAccu + '</span>' +
        '<span>' + node.matrix.totalAccu + '</span>' +
        '<span>' + node.matrix.selfSize + '</span>' +
        '<span>' + node.matrix.totalSize + '</span>' +
        '<span>' + node.matrix.selfPeak + '</span>' +
        '<span>' + node.matrix.totalPeak + '</span>' +
        '<span>' +
        '<span style="margin-left:' + depth + 'em;"' +
        ' class="collapseButton" title="Expand / Collapse"></span>' +
        '<span title="' + node.name + '">' + node.name + '</span>' +
        '</span>'
        '</div>';
      this._elements.treePanel.innerHTML += treeNode;
      if (node.children.length > 0) {
        for (var i in node.children) {
          this.addTreeNode(node.children[i], depth + 1);
        }
      }
    },

    addNodeEventListener: function tm_addNodeEventListener() {
      var self = this;
      Array.prototype.forEach.call(document.querySelectorAll('.collapseButton'),
        function(element) {
          element.addEventListener('click', function(e) {
            var target = e.target.parentElement.parentElement;
            if (target.classList.contains('collapsed')) {
              if (target.nextSibling) {
                target.classList.remove('collapsed');
                self.expandNode(target.nextSibling,
                                parseInt(target.nextSibling.dataset.depth, 10));
              }
            } else {
              var targetDepth = parseInt(target.dataset.depth, 10);
              self.collapseNode(target, targetDepth);
            }
          });
        });
    },

    collapseRoot: function tm_collapseRoot() {
      var rootElement = document.getElementsByClassName('treeNode')[0];
      this.collapseNode(rootElement, rootElement.dataset.depth);
    },

    collapseNode: function tm_collapseNode(nodeElement, depth) {
      nodeElement.classList.add('collapsed');
      if (parseInt(nodeElement.dataset.depth, 10) > depth) {
        nodeElement.style.display = 'none';
      }
      if (nodeElement.nextSibling) {
        this.collapseNode(nodeElement.nextSibling, depth);
      }
    },

    expandNode: function tm_expandNode(nodeElement, depth) {
      var nodeDepth = parseInt(nodeElement.dataset.depth, 10);
      if (nodeDepth == depth) {
        nodeElement.style.display = '';
      }
      if (nodeElement.nextSibling && nodeDepth >= depth) {
        this.expandNode(nodeElement.nextSibling, depth);
      }
    }
  };

  exports.TreeManager = TreeManager;
}(window));
