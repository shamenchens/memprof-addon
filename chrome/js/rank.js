'use strict';
(function(exports) {
  function RankManager(option) {
    this._elements = option.elements;
    this.rankHist = [];
    this.filterHist = [];
    this.store = option.store;
    this.defaultSort = 'selfPeak';
  }

  RankManager.prototype.start = function RM_start() {
    window.addEventListener('dataReady', this);
  };

  RankManager.prototype.stop = function RM_stop() {
    window.removeEventListener('dataReady', this);
  };

  RankManager.prototype.sortBY = function RM_sortBY(hist, key) {
    hist.sort(function(a,b) {return b[key] - a[key];});
    return hist;
  };

  RankManager.prototype.filterBY = function RM_filterBY(nameIdx) {
    var filterHist = this.store.getFilterList(+nameIdx);
    return this.sortBY(filterHist, this.defaultSort);
  };

  RankManager.prototype.showRankList = function RM_showRankList() {
   this.rankHist = this.store.getRankList();
   this.rankHist = this.sortBY(this.rankHist, this.defaultSort);
   this.template(this.rankHist);
  };

  RankManager.prototype.template = function RM_template(hist) {
    var names = this.store.names;
    var infoTable = '';
    for (var i = 0; i < hist.length; i++) {
      var entry = hist[i];
      var fnName = names[entry.nameIdx];
      infoTable = infoTable + '<li>' +
        '<span>' + entry.selfAccu + '</span><span>' + entry.totalAccu + '</span>' +
        '<span>' + entry.selfSize + '</span><span>' + entry.totalSize + '</span>' +
        '<span>' + entry.selfPeak + '</span><span>' + entry.totalPeak + '</span>' +
        '<span title="' + fnName + '" class="filterable" data-filter="' + entry.nameIdx + '">' +
        fnName + '</span>' +
      '</li>';
    }
    infoTable = '<ul>' +
                  '<li> ' +
                    '<span class="sortable" data-id="selfAccu">Self Accu</span>' +
                    '<span class="sortable" data-id="totalAccu">Total Accu</span>' +
                    '<span class="sortable" data-id="selfSize">Self Size</span>' +
                    '<span class="sortable" data-id="totalSize">Total Size</span>' +
                    '<span class="sortable" data-id="selfPeak">Self Peak</span>' +
                    '<span class="sortable" data-id="totalPeak">Total Peak</span>' +
                    '<span>name</span>' +
                  '</li>' +
                 infoTable +
                '</ul>';
    this._elements.infoTable.innerHTML = infoTable;
    var matches = this._elements.infoTable.querySelectorAll('span.sortable');
    var sortItem = null;
    for (var j = 0; j < matches.length; j ++) {
      sortItem = matches[j];
      sortItem.addEventListener('click', this);
    }
    matches = this._elements.infoTable.querySelectorAll('span.filterable');
    sortItem = null;
    for (var j = 0; j < matches.length; j ++) {
      sortItem = matches[j];
      sortItem.addEventListener('click', this);
    }
  };

  RankManager.prototype.handleEvent = function RM_handleEvent(evt) {
    switch (evt.type) {
      case 'dataReady':
        this.showRankList();
        break;
      case 'click':
        if (typeof evt.target.dataset.id !== 'undefined') {
          console.log('sort:' + evt.target.dataset.id);
          this.rankHist = this.sortBY(this.rankHist, evt.target.dataset.id);
          this.template(this.rankHist);
        }
        if (typeof evt.target.dataset.filter !== 'undefined') {
          var nameIdx = +evt.target.dataset.filter;
          console.log('filter by nameIdx:' + nameIdx);
          this.filterHist = this.filterBY(this.rankHist, nameIdx);
          this.template(this.filterHist);
        }
        break;
      default:
        break;
    }
  };

  exports.RankManager = RankManager;
}(window));
