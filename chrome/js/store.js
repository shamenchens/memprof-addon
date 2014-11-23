'use strict';
function escapeHtml(html){
  var text = document.createTextNode(html);
  var div = document.createElement('div');
  div.appendChild(text);
  return div.innerHTML;
}

(function(exports) {
  function Store() {
    this.names = null;
    this.traces = null;
    this.allocated = null;
    this.treeData = {};
    this.uniData = [];
    this.init();
  }

  Store.prototype = {
    init: function s_init() {
      window.addEventListener('search', this);
    },

    handleEvent: function s_handleEvent(evt) {
      switch(evt.type) {
        case 'search':
          console.log(evt.detail.term.length);
          break;
      }
    },

    create: function s_create(names, traces, allocated) {
      this.names = names;
      this.traces = traces;
      this.allocated = allocated;
      this.preprocessData();
      // notify others data is ready
      window.dispatchEvent(new CustomEvent('dataReady'));
    },

    drop: function s_drop() {
      this.names = null;
      this.traces = null;
      this.allocated = null;
      this.uniData = null;
    },

    preprocessData: function s_preprocessData() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j;

      for (i = 0; i < names.length; i++) {
        names[i] = escapeHtml(names[i]);
        hist[i] = {
          nameIdx: i,
          parent: null, childs: [],
          selfAccu: 0, totalAccu: 0,
          selfSize: 0, totalSize: 0,
          selfPeak: 0, totalPeak: 0
          };
      }
    },

    getNames: function s_getNames() {
      return this.names;
    },

    // for reference
    calcTotalSize: function s_example1() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j, len;

      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        e = allocated[i];
        t = traces[e.traceIdx];
        hist[t.nameIdx].selfSize += e.size;
        for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
          t = traces[j];
          if (!visited[t.nameIdx]) {
            visited[t.nameIdx] = true;
            hist[t.nameIdx].totalSize += e.size;
          }
        }
      }

      hist.sort(function(a,b) {return b.selfSize - a.selfSize;});

      console.log("    SelfSize   TotalSize  Name");
      for (i = 0; i < 20 && i < hist.length; i++) {
        console.log("%12.0f%12.0f  %s", hist[i].selfSize, hist[i].totalSize, names[hist[i].nameIdx]);
      }
    },

    // for reference
    calcTotalAccu: function s_example2() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j, len;

      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        e = allocated[i];
        t = traces[e.traceIdx];
        if (e.size > 0) {
          hist[t.nameIdx].selfAccu += e.size;
          for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
            t = traces[j];
            if (!visited[t.nameIdx]) {
              visited[t.nameIdx] = true;
              hist[t.nameIdx].totalAccu += e.size;
            }
          }
        }
      }

      hist.sort(function(a,b) {return b.selfAccu - a.selfAccu;});

      console.log("    SelfAccu   TotalAccu  Name");
      for (i = 0; i < 20 && i < hist.length; i++) {
        console.log("%12.0f%12.0f  %s", hist[i].selfAccu, hist[i].totalAccu, names[hist[i].nameIdx]);
      }
    },

    // for reference
    calcTotalPeak: function s_example3() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var t, e, i, j, len;

      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        e = allocated[i];
        t = traces[e.traceIdx];
        hist[t.nameIdx].selfSize += e.size;
        if (hist[t.nameIdx].selfSize > hist[t.nameIdx].selfPeak) {
          hist[t.nameIdx].selfPeak = hist[t.nameIdx].selfSize;
        }
        for (j = e.traceIdx; j != 0; j = traces[j].parentIdx) {
          t = traces[j];
          if (!visited[t.nameIdx]) {
            visited[t.nameIdx] = true;
            hist[t.nameIdx].totalSize += e.size;
            if (hist[t.nameIdx].totalSize > hist[t.nameIdx].totalPeak) {
              hist[t.nameIdx].totalPeak = hist[t.nameIdx].totalSize;
            }
          }
        }
      }

      hist.sort(function(a,b) {return b.selfPeak - a.selfPeak;});

      console.log("     SelfPeak    TotalPeak  Name");
      for (i = j = 0; j < 20 && i < hist.length; i++) {
        // if (names[hist[i].nameIdx].search(/gbemu/) != -1) {
        // }
        console.log("%12.0f%12.0f  %s", hist[i].selfPeak, hist[i].totalPeak, names[hist[i].nameIdx]);
        j++;
      }
    },

    // for ranklist filter
    getFilterList: function s_getFilterList(nameIdx) {
      var hist = this.uniData;
      return this.hist;
    },

    // for ranklist
    getRankList: function s_getHistogram() {
      var names = this.names,
          traces = this.traces,
          allocated = this.allocated,
          hist = this.uniData;
      var tracesEntry, allocatedEntry, parentTraceEntry, i, j, len;

      for (i = 0, len = allocated.length; i < len; i++) {
        var visited = [];
        allocatedEntry = allocated[i];
        tracesEntry = traces[allocatedEntry.traceIdx];
        if (typeof hist[tracesEntry.nameIdx] === 'undefined') {
          continue;
        }
        // add parent and childs
        parentTraceEntry = traces[tracesEntry.parentIdx];
        hist[tracesEntry.nameIdx].parent = parentTraceEntry.nameIdx;
        // XXX hack
        if (typeof hist[parentTraceEntry.nameIdx] === 'undefined') {
          continue;
        }
        if (hist[parentTraceEntry.nameIdx].childs.indexOf(tracesEntry.nameIdx) < 0) {
          hist[parentTraceEntry.nameIdx].childs.push(tracesEntry.nameIdx);
        }

        // update self stat
        if (allocatedEntry.size > 0) {
          hist[tracesEntry.nameIdx].selfAccu += allocatedEntry.size;
        }

        hist[tracesEntry.nameIdx].selfSize += allocatedEntry.size;
        if (hist[tracesEntry.nameIdx].selfSize > hist[tracesEntry.nameIdx].selfPeak) {
          hist[tracesEntry.nameIdx].selfPeak = hist[tracesEntry.nameIdx].selfSize;
        }

        // update total stat
        for (j = allocatedEntry.traceIdx; j != 0; j = traces[j].parentIdx) {
          tracesEntry = traces[j];
          if (!visited[tracesEntry.nameIdx] && typeof hist[tracesEntry.nameIdx] !== 'undefined') {
            visited[tracesEntry.nameIdx] = true;
            hist[tracesEntry.nameIdx].totalSize += allocatedEntry.size;
            if (allocatedEntry.size > 0) {
              hist[tracesEntry.nameIdx].totalAccu += allocatedEntry.size;
            }
            if (hist[tracesEntry.nameIdx].totalSize > hist[tracesEntry.nameIdx].totalPeak) {
              hist[tracesEntry.nameIdx].totalPeak = hist[tracesEntry.nameIdx].totalSize;
            }
          }
        }
      }

      return hist;
    },

    // for tree
    getTreeData: function s_getTreeData() {
      var names = this.names;
      var traces = this.traces;
      var allocated = this.allocated;
      var treeData = this.treeData;

      var visited = [];
      var traceIdx, tracesEntry, allocatedEntry,
          traceNames, tracesIdxs, size, i, len;
      for (i = 0, len = allocated.length; i < len; i++) {
        allocatedEntry = allocated[i];
        size = allocatedEntry.size;
        traceIdx = allocatedEntry.traceIdx;
        tracesEntry = traces[allocatedEntry.traceIdx];
        traceNames = this._getTraceNames(tracesEntry);
        tracesIdxs = this._getTraceIndecies(traceIdx, tracesEntry);

        if (visited.indexOf(traceIdx) < 0) {
          visited.push(traceIdx);
          if (tracesEntry.nameIdx === 0) {
            this._treeAddRoot(names[0], size);
          } else {
            this._treeAddChild(traceNames, tracesIdxs, size);
          }
        } else {
          if (tracesEntry.nameIdx === 0) {
            this._treeUpdateRoot(size);
          } else {
            this._treeUpdateChild(traceNames, tracesIdxs, size);
          }
        }
      }

      return treeData;
    },

    _getTraceNames: function s__getTraceNames(tracesEntry) {
      var traceNames = [];
      traceNames.push(tracesEntry.nameIdx);
      while (tracesEntry.parentIdx !== 0) {
        tracesEntry = this.traces[tracesEntry.parentIdx];
        traceNames.push(tracesEntry.nameIdx);
      }
      return traceNames;
    },

    _getTraceIndecies: function s__getTraceIndecies(traceIdx, tracesEntry) {
      var traceIdxs = [];
      traceIdxs.push(traceIdx);
      while (tracesEntry.parentIdx !== 0) {
        traceIdxs.push(tracesEntry.parentIdx);
        tracesEntry = this.traces[tracesEntry.parentIdx];
      }
      return traceIdxs;
    },

    _treeAddRoot: function s__treeAddRoot(rootName, size) {
      this.treeData.root = new Node({
        name: rootName,
        nameIdx: 0,
        parentIdx: 0,
        selfSize: size,
        selfAccu: size,
        selfPeak: size
      });
    },

    _treeUpdateRoot: function s__treeUpdateRoot(size) {
      this.treeData.root.updateMatrix(size, true);
    },

    _treeAddChild: function s__treeAddChild(traceNames, tracesIdxs, size) {
      var names = this.names;
      var currentNode = this.treeData.root;
      for (var i = traceNames.length - 1; i >=0; i--) {
        var nodeOption = {
          name: names[traceNames[i]],
          nameIdx: traceNames[i],
          traceIdx: tracesIdxs[i]
        };
        if (i === 0) {
          nodeOption.selfSize = size;
          nodeOption.selfAccu = size;
          nodeOption.selfPeak = size;
        }
        if (i === traceNames.length - 1) {
          nodeOption.totalSize = size;
          nodeOption.totalAccu = size;
          nodeOption.totalPeak = size;
        }
        currentNode = currentNode.addChild(nodeOption);
      }
    },

    _treeUpdateChild: function s__treeUpdateChild(traceNames, traceIdxs, size) {
      var currentNode = this.treeData.root;
      for (var i = traceNames.length - 1; i >= 0; i--) {
        currentNode = currentNode.findChildrenByNameIdx(traceNames[i]);
        if (i === traceNames.length - 1) {
          currentNode.updateMatrix(size, false);
        }
        if (currentNode.traceIdx.indexOf(traceIdxs[i]) < 0) {
          currentNode.traceIdx.push(traceIdxs[i]);
        }
      }
      currentNode.updateMatrix(size, true);
    },
  };

  function Node(options) {
    this.name = options.name;
    this.nameIdx = options.nameIdx;
    this.traceIdx = [options.traceIdx];
    this.children = [];
    this.parent = null;
    this.matrix = {
      selfSize: options.selfSize || 0,
      selfAccu: options.selfAccu || 0,
      selfPeak: options.selfPeak || 0,
      totalSize: options.totalSize || 0,
      totalAccu: options.totalAccu || 0,
      totalPeak: options.totalPeak || 0
    };
  }

  Node.prototype = {
    findChildrenByNameIdx: function(nameIdx) {
      for (var i in this.children) {
        if (this.children[i].nameIdx === nameIdx) {
          return this.children[i];
        }
      }
      return null;
    },

    addChild: function(nodeOption) {
      var childNode = this.findChildrenByNameIdx(nodeOption.nameIdx);
      if (!childNode) {
        childNode = new Node(nodeOption);
        childNode.parent = this;
        this.children.push(childNode);
      }
      return childNode;
    },

    updateMatrix: function(size, self) {
      if (self) {
        this.matrix.selfSize += size;
        if (size > 0) {
          this.matrix.selfAccu += size;
        }
        if (this.matrix.selfSize > this.matrix.selfPeak) {
          this.matrix.selfPeak = this.matrix.selfSize;
        }
      } else {
        this.matrix.totalSize += size;
        if (size > 0) {
          this.matrix.totalAccu += size;
        }
        if (this.matrix.totalSize > this.matrix.totalPeak) {
          this.matrix.totalPeak = this.matrix.totalSize;
        }
      }
    },

    walk: function(visited, depth) {
      visited.push(this.nameIdx);
      if (this.children.length > 0) {
        for (var i in this.children) {
          this.children[i].walk(visited, depth + 1);
        }
      }
    }
  };

  exports.Store = Store;
}(window));
