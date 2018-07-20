'use strict';

const superRequest =require('superagent');

const Utils = require('./Utils');

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
    // note: if you modify this constructor, please look at _startFreshIfExpired: it might also need modification.
    this.amp = options.amp;
    if (!this.amp) throw new Error('Not the right way to create a session!');

    this.id = options.id || utils.randomString();
    this.userId = options.userId || utils.randomString(5);
    this.timeout = options.timeout || 30 * 1000;
    this.ttl = options.ttl;
    this.index = 1;
    const currentTime = Date.now();
    this.created = currentTime;
    this.updated = currentTime;

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
    const ts = Date.now();
    this._startFreshIfExpired();
    this.updated = ts;
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + '/observe';

    // if last argument is a function, then it is a callback
    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];

    this.request({
      name: name,
      properties: props
    }, options, ts, (err, response, body) => {
      if (err) {
        if (cb) cb(err, response, body);
      } else {
        if (cb) cb(null, response, body);
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
    const ts = Date.now();
    this._startFreshIfExpired();
    this.updated = ts;
    options.limit = 1;
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + '/decide';

    const { requestSafeCandidates, allCandidates } = this._formatCandidates(candidates);

    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];

    if (allCandidates.length > 50) {
      if (cb) {
        cb(new Error('Candidate length must be less than or equal to 50.'), allCandidates[0]);
      }

      return allCandidates[0];
    }

    this.request({
      name: name,
      decision: {
        candidates: requestSafeCandidates,
        limit: options.limit
      }
    }, options, ts, (err, response, body) => {
      if (err || (!body || !body.indexes)) {
        // use default
        if(cb) cb(err, allCandidates[0]);
      } else {
        if (cb) cb(null, allCandidates[body.indexes[0]], body);
      }
    });

    return allCandidates[0];
  }

  /**
   * decideCond
   * Decision options to determine decision to take.
   *
   * @param  {string} name - name of event
   * @param  {array} candidates - variations to choose from
   * @param  {string} event - event name of contexts
   * @param  {array} contexts - contexts to choose from
   * @param  {Object} options (optional) - timeout
   * @callback callback - optional
   * @param {Error} err
   * @param {Array} decisions
   * 
   * Input:
   * contexts: { context1: {prop1: value1, prop2: value2}, context2: {prop1: value1, prop2: value2} }
   * 
   * REST Response:
   * contexts: { context1: [1], context2: [0] } indexes map to candidates
   * 
   * Method Return:
   * contexts: { context1: {color: 'blue'}, context2: {color: 'red'} } indexes are replaced with candidate values
   */
  decideCond(name, candidates = [], event, contexts = {}, options = {}, cb) {
    const ts = Date.now();
    if (!event || event === '') throw new Error('Event name required for conditional decide.');
    if (Object.keys(contexts).length === 0) throw new Error('Contexts required for conditional decide.');

    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.amp.key + '/decideCond';

    const { requestSafeCandidates, allCandidates } = this._formatCandidates(candidates);

    if (utils.isFunction(arguments[arguments.length - 1])) cb = arguments[arguments.length - 1];
    
    options.limit = 1;

    const defaultResult = Object.keys(contexts).reduce((acc, key) => {
      acc[key] = allCandidates[0];
      return acc;
    }, {});

    if (allCandidates.length > 50) {
      if (cb) {
        cb(new Error('Candidate length must be less than or equal to 50.'), defaultResult);
      }

      return defaultResult;
    }

    this.request({
      name: name,
      decision: {
        candidates: requestSafeCandidates,
        limit: options.limit
      },
      conditional_event: {
        event: event,
        contexts: contexts
      }
    }, options, ts, (err, response, body) => {
      if (err || (!body || !body.indexes)) {
        if(cb) cb(err, defaultResult);
      } else {
        const result = Object.keys(contexts).reduce((acc, key) => {
          acc[key] = allCandidates[body.indexes[key]];
          return acc;
        }, {});

        if (cb) cb(null, result, body);
      }
    });

    return defaultResult;
  }

  /**
   * _formatCandidates
   * Formats the candidates to be in correct format for policy execution
   *
   * @param  {array|object} candidates
   */
  _formatCandidates(candidates) {
    const res = { allCandidates: [], requestSafeCandidates: [] };
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
   * _startFreshIfExpired
   * If the ttl indicates that the session has expired, treat this session object as if it were a new session.
   */
  _startFreshIfExpired() {
    if (this.ttl <= 0) {
      return;
    }
    const currentTime = Date.now();
    if (currentTime <= this.updated + this.ttl) {
      return;
    }
    // do whatever the constructor does
    this.id = utils.randomString();
    this.created = currentTime;
    this.updated = currentTime;
    this.history = [];
    this.index = 1;
  }

  /**
   * request
   * Wrapper for sending API requests and managing timeouts and errors
   *
   * @param  {Object} body - request body
   * @param  {Object} options - options passed from observe or decide
   * @param  {Object} ts - timestamp
   * @param  {Function} cb - callback
   */
  request(body, options, ts, cb) {
    body.client = {};
    body.client.name = 'Node-Thin';
    body.client.version = this.amp.version;
    body.ts = ts;
    body.sessionId = this.id;
    body.userId = this.userId;
    body.index = this.index++;

    superRequest
      .post(options.url)
      .timeout({
        response: options.timeout
      })
      .retry(2)
      .send(body)
      .end((err, response) => {
        if ((err || response.statusCode !== 200) && cb) {
          cb.call(this, err || new Error(response.statusCode + ' ' + JSON.stringify(response.body)), response);
        } else {
          this.updated = Date.now();
          if (cb) cb.call(this, err, response);
        }
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
