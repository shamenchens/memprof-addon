'use strict';
(function(exports) {
  function PadManager (option) {
    this._elements = option.elements;
    this.store = option.store;
    this.tracePool = [];
    this.limit = 1000;
    this.heightRatio = 0;
    this.padHeight = 800;
  }

  PadManager.prototype = {
    start: function PL_start () {
      window.addEventListener('dataReady', this);
    },

    handleEvent: function PL_handleEvent(evt) {
      switch(evt.type) {
        case 'dataReady':
          this.drawTrace();
          break;
      }
    },

    setupCanvas: function PL_setupCanvas() {
      var baseWidth = 10;
      this.tracePool = this.store.allocated;
      var traceCount = this.tracePool.length;
      // setup width
      if (traceCount > 0) {
        if (traceCount > this.limit) {
          traceCount = this.limit;
          this.minimizeTracePool();
          this._elements.pad.style.width = '200%';
        }
        this._elements.pad.width = traceCount * baseWidth;
      }

      // setup height ratio
      var maxSize = 0;
      var entry = null;
      for (var i = 0, len = this.tracePool.length; i < len; i++ ) {
        entry = Math.abs(this.tracePool[i].size);
        if (entry > maxSize) {
          maxSize = entry;
        }
      }

      this.heightRatio = Math.round(maxSize / this.padHeight);
    },

    minimizeTracePool: function PL_minimizeTracePool() {
      var step = Math.round(this.tracePool.length / this.limit);
      var start = 0, bound = 0, entry = null, temp = [];
      for (var chunk = 0; chunk < this.limit; chunk ++) {
        start = chunk * step;
        bound = (chunk + 1) * step;
        if (bound > this.tracePool.length) {
          bound = this.tracePool.length;
        }
        if (typeof this.tracePool[start] === 'undefined') {
          continue;
        }
        temp[chunk] = {"size":0, "traceIdx":[]};
        temp[chunk].timestamp = this.tracePool[start].timestamp;
        entry = temp[chunk];
        for (var i = start; i < bound; i++) {
          entry.size = entry.size + this.tracePool[i].size;
          entry.traceIdx.push(this.tracePool[i].traceIdx); 
        }
      }

      this.tracePool = temp;
    },

    drawTrace: function PL_drawTrace() {
      this.setupCanvas();
      var baseWidth = 10;
      var baseLine = this.padHeight / 2;  // should be 400
      var ctx = this._elements.pad.getContext('2d');
      var tracePool = this.tracePool;
      // var start = baseLine;
      ctx.clearRect(0, 0, this._elements.pad.width, this._elements.pad.height);
      ctx.strokeStyle = 'black';
      var entry, entryHeight, prevEntry, entryDuration;
      for (var i = 0, len = tracePool.length; i < len; i++) {
        entry = tracePool[i];
        entryHeight = (entry.size / this.heightRatio);
        if (i > 0) {
          prevEntry = tracePool[i-1];
          entryDuration = Math.round((entry.timestamp - prevEntry.timestamp)) * 4 / 1000;
        } else {
          entryDuration = 0;
        }
    
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(entryDuration + 10 + i * 10, baseLine);
        ctx.lineTo(entryDuration + 10 + i * 10, baseLine - entryHeight);
        ctx.strokeStyle = '#ff0000';
        if (entryHeight < 0) {
          ctx.strokeStyle = '#0000ff';
        } 
        ctx.stroke();
        // ctx.strokeStyle = '#000000';
        // if (i > 0) {
        //   ctx.moveTo(10 + (i - 1) * 10, start);
        //   ctx.lineTo(10 + i * 10, start - (entryHeight / 10) );
        //   ctx.stroke();
        // } 
        // start = start - entryHeight;
      }
    },

    stop: function PL_stop() {
      window.removeEventListener('dataReady', this);
    }
  };
  exports.PadManager = PadManager;
}(window));
