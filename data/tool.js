/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
"use strict";

const { classes: Cc, interfaces: Ci, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("chrome://memory-profiler-ui/content/memprof.js");

XPCOMUtils.defineLazyModuleGetter(this, "promise",
  "resource://gre/modules/commonjs/sdk/core/promise.js", "Promise");

XPCOMUtils.defineLazyGetter(this, "toolStrings", () =>
  Services.strings.createBundle("chrome://memory-profiler-ui/locale/strings.properties"));

/**
 * This file has access to the `window` and `document` objects of the add-on's
 * iframe, and is included in tool.xul. This is the add-on's controller.
 */

let gToolbox;
let gTarget;
let gFront;

/**
 * Called when the user select the tool tab.
 *
 * @param Toolbox toolbox
 *        The developer tools toolbox, containing all tools.
 * @param object target
 *        The local or remote target being debugged.
 * @return object
 *         A promise that should be resolved when the tool completes opening.
 */
function startup(toolbox, target) {
  target.makeRemote();
  gToolbox = toolbox;
  gTarget = target;
  gFront = new MemprofFront(target.client, target.form);

  // start up app
  app_start(gFront);
  return promise.resolve();
}

/**
 * Called when the user closes the toolbox or disables the add-on.
 *
 * @return object
 *         A promise that should be resolved when the tool completes closing.
 */
function shutdown() {
  gFront.destroy();
  return promise.resolve();
}

function startProfiler() {
  gFront.startProfiler();
}

function stopProfiler() {
  gFront.stopProfiler();
}

function getFrameNameTable() {
  gFront.getFrameNameTable().then(retval => {
    alert(retval);
  });
}

/**
 * DOM query helpers.
 */
function $(selector, target = document) target.querySelector(selector);
function $$(selector, target = document) target.querySelectorAll(selector);
