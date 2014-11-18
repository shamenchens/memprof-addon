/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;
const require = Cu.import("resource://gre/modules/devtools/Loader.jsm", {}).devtools.require;

let protocol = require("devtools/server/protocol");
let { method, RetVal, Arg, types } = protocol;

this.EXPORTED_SYMBOLS = ["MemprofFront"];

let MemprofActor = protocol.ActorClass({
  typeName: "memprof",

  hello: method(function() {
  }, {
    request: {},
    response: { greeting: RetVal("string") }
  }),

  startProfiler: method(function() {
  }, {
    request: {},
    response: {}
  }),

  stopProfiler: method(function() {
  }, {
    request: {},
    response: {}
  }),

  resetProfiler: method(function() {
  }, {
    request: {},
    response: {}
  }),

  getFrameNameTable: method(function() {
  }, {
    request: {},
    response: {}
  }),

  getStacktraceTable: method(function() {
  }, {
    request: {},
    response: {}
  }),

  getRetainingEntries: method(function() {
  }, {
    request: {},
    response: {}
  }),

  getAllocatedEntries: method(function() {
  }, {
    request: {},
    response: {}
  })
});

let MemprofFront = protocol.FrontClass(MemprofActor, {
  initialize: function(client, form) {
    protocol.Front.prototype.initialize.call(this, client, form);
    this.actorID = form.memprofActor;
    this.manage(this);
  }
});
