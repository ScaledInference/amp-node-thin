"use strict";

const request = require('request');
const Utils = require('./Utils');
const EARLY_TERMINATION = 'EARLY_TERMINATION';

const utils = new Utils();

/**
 * Session
 * Constructs the session object for the Amp instance.
 *
 * @constructor
 * @param {Object} options
 *
 * Options:
 *  id - id of the session (useful for session continuation)
 *  userId - id of user
 *  timeout - TTL of requests
 *  ttl - TTL for session before a new one is created
 */
module.exports = class Session {
  constructor(options) {
    this.amp = options.amp;
    if (!this.amp) throw new Error("Not the right way to create a session!");

    this.id = options.id || utils.randomString();
    this.userId = options.userId || utils.randomString(5);
    this.timeout = options.timeout || 1000;
    this.ttl = options.ttl;
    this.index = 1;
    this.created = this.updated = Date.now();
  }

  /**
   * observe
   * Observes user context prior to decision and outcomes after the decision.
   *
   * @param  {string}   name - name of event
   * @param  {Object}   props (optional) - properties to observe
   * @param  {Object}   options (optional) - timeout
   * @param  {Function} cb (optional)
   */
  observe(name, props = {}, options = {}, cb) {
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + "/observe";

    // if last argument is a function, then it is a callback
    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];

    this.request({
      name: name,
      sessionId: this.id,
      userId: this.userId,
      properties: props,
      index: this.index++,
      key: this.amp.key
    }, options, (err, response, body) => {
      if (err && err.message === EARLY_TERMINATION) {
        if (cb) cb(null, body);
      } else {
        if (cb) cb(err, body);
      }
    });
  }

  /**
   * decide
   * Decision to determine action to take.
   *
   * @param  {string} name - name of event
   * @param  {array} candidates - variations to choose from
   * @param  {Object} options (optional) - timeout and ttl
   * @param  {Function} cb - error and decision
   */
  decide(name, candidates = [], options = {}, cb) {
    options.limit = 1;
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + "/decide";

    const { requestSafeCandidates, allCandidates } = this._formatCandidates(candidates);

    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];

    if (allCandidates.length > 50) {
      if (cb) {
        cb(new Error("Candidate length must be less than or equal to 50."), allCandidates[0]);
      }

      return allCandidates[0];
    }

    this.request({
      name: name,
      key: this.amp.key,
      sessionId: this.id,
      userId: this.userId,
      decision: {
        candidates: requestSafeCandidates,
        limit: options.limit
      },
      index: this.index++
    }, options, (err, response, body) => {
      let defaultDecision = allCandidates[0];
      if (err && err.message === EARLY_TERMINATION) {
        // use default
        if(cb) cb(null, defaultDecision, body);
      } else {
        if (err || (!body || !body.index)) {
          if(cb) cb(err, defaultDecision, body);
        } else {
          let decisions = body.indexes.map(v => allCandidates[v]);
          if (cb) cb(null, decisions[0], body);
        }
      }
    });

    return allCandidates[0];
  }

  /**
   * _formatCandidates
   * Formats the candidates to be in correct format for policy execution
   *
   * @param  {array|object} candidates
   */
  _formatCandidates(candidates) {
    let res = { allCandidates: [], requestSafeCandidates: [] };
    if (!candidates) return res;

    if (utils.isArray(candidates)) {
      res.allCandidates = candidates;
      res.requestSafeCandidates = candidates.map(c => utils.isObject(c) ? c : {value: c});
    } else if (utils.isObject(candidates)) {
      res.allCandidates = utils.combinations(candidates);
      res.requestSafeCandidates = [candidates];
    }

    return res;
  }

  /**
   * request
   * Wrapper for sending API requests and managing timeouts and errors
   *
   * @param  {Object} body - request body
   * @param  {Object} options - options passed from observe or decide
   * @param  {Function} cb - callback
   */
  request(body, options, cb) {
    // make sure it will be called after timeout
    let completed;
    setTimeout(() => {
      if (completed) return;
      completed = true;

      this.updated = Date.now();
      if (cb) cb.call(this, new Error(EARLY_TERMINATION))
    }, options.timeout);

    request({
      method: "POST",
      url: options.url,
      body: body,
      timeout: options.timeout,
      json: true
    }, (err, response, rbody) => {
      if (completed) return;
      completed = true;

      this.updated = Date.now();
      if (cb) cb.call(this, err, response, rbody);
    });
  }

  /**
   * serialize
   * Serializes the session to be persisted to another domain or platform
   */
  serialize() {
    return JSON.stringify({
      index: this.index,
      context: this.context,
      id: this.id,
      ttl: this.ttl,
      updated: this.updated,
      created: this.created,
      userId: this.userId
    });
  }
};
