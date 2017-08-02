"use strict";

const Base = require("./Base");

const utils = new (require("./Utils"))();

/**
 * Storage class.
 * 
 * Used when no storage handler passed.
 * 
 * A valid storage instance should contain belowing features:
 * 
 *  - an storage that can store information, JSON structure will be fine.
 *  - set: so can add or update storage
 *  - get: so can retrieve
 *  - remove: so can delete
 *  - getAll: so can retrieve all
 * 
 * And everytime a change happens to storage, should fire `change:name` event on it.
 */
class Storage extends Base {
  constructor() {
    super();

    // individual storage, so each amp instance should have its own storage set up
    this.STORE = {};
  }
  getAll(done) {
    if (done) done(null, this.STORE);
    return this.STORE;
  }
  set(key, value, done) {
    // only allow JSONSafe?
    this.STORE[key] = value;
    this.trigger("change:" + key, value);
    if (done) done(null, this);
  }
  get(key, done) {
    if (done) done(null, this.STORE[key]);
    return this.STORE[key];
  }
  remove(key, done) {
    delete this.STORE[key];
    this.trigger("delete:" + key);
    if (done) done(null, this);
  }
  empty(done) {
    this.STORE = {};
    if (done) done(null, this);
  }

  /**
   * Verify whether storage passed is a valid storage instance.
   * @param {Object} storage 
   */
  static validate(storage) {
    let key = utils.randomString(),
        val = utils.randomString();

    try {
      if (storage.get.length >= 2 && storage.set.length >= 3 && storage.remove.length >= 2) {
        // callback supported, so maybe async, use with caution
        // its hard to capture any errors from async with try catch...
        // console.warn("Async(Callback) Storage Supported Detected, Use With Caution.");
        return true;
      } else {
        // can set
        storage.set(key, val);

        // can get
        if (storage.get(key) === val) {
          // can delete
          storage.remove(key);
          if (!storage.get(key)) return true;
        }
        return false;
      }
    } catch (e) {
      return false;
    }
  }
}

module.exports = Storage;