"use strict";

const http = require('http');
const https = require('https');
const { URL } = require('url');
const Utils = require('./Utils');
const EARLY_TERMINATION = 'EARLY_TERMINATION';

const utils = new Utils();

module.exports = class Session {
  constructor(options) {
    this.amp = options.amp;
    if (!this.amp) throw new Error("Not the right way to create a session!");

    this.id = options.id || utils.randomString();
    this.history = options.history || [];
    this.userId = options.userId || utils.randomString(5);
    this.timeout = options.timeout || 1000;
    this.ttl = options.ttl;
    this.index = 1;
    this.created = this.updated = Date.now();
  }

  observe(name, props = {}, options = {}, cb) {
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + "/observe";

    // if last argument is a function, then it is a callback
    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];

    this.request({
      // if need more, add more here
      name: name,
      sessionId: this.id,
      userId: this.userId,
      properties: props,
      index: this.index++,
      key: this.amp.key
    }, options, (err, response, body) => {
      // callback with err and response body
      if (err && err.message === EARLY_TERMINATION) {
        if (cb) cb(null, body);
      } else {
        if (cb) cb(err, body);
      }
    });
  }

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
      // if need more, add more here
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
      // body:
      //   {indexes: [], ...etc}
      // callback with err and decision, response body
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

  request(body, options, cb) {
    // make sure it will be called after timeout
    let completed;
    setTimeout(() => {
      if (completed) return;
      completed = true;

      // store into history
      this.history.push(Object.assign({}, body));
      this.updated = Date.now();
      if (cb) cb.call(this, new Error(EARLY_TERMINATION))
    }, options.timeout);

    const url = new URL(options.url);
    const opts = {
      host: url.host,
      port: url.port,
      path: url.path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(JSON.stringify(body))
      },
      timeout: options.timeout
    };
    const requestType = url.protocol.indexOf('http:') != -1 ? http : https;
    const req = requestType.request(url, (res) => {
      if (completed) return;
      completed = true;

      var data = '';
      res.setEncoding = 'utf8';
      
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('error', (e) => {
        if (cb) cb.call(this, e, res, data);
      });

      res.on('end', () => {
        // store into history
        this.history.push(Object.assign({}, body));
        this.updated = Date.now();

        if (cb) cb.call(this, null, res, data);
      });
    });

    req.on('socket', (socket) => {
      socket.on('error', (e) => {
        console.log('Socket error: ', e);
        if (cb) cb.call(this, e);
        req.abort();
      });
    });

    req.write(JSON.stringify(body));
    req.end();

    process.on('uncaughtException', function(err) {
      console.error('Uncaught Exception', err.stack);
    });
  }

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
