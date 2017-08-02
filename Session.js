const request = require("request");
const Utils = require("./Utils");
const EARLY_TERMINATION = "EARLY_TERMINATION";

let utils = new Utils();

module.exports = class Session {
  constructor(options) {
    this.amp = options.amp;
    if (!this.amp) throw new Error("Not the right way to create a session!");

    this.id = options.id || utils.randomString();
    this.context = options.context || [];
    this.userId = options.userId || utils.randomString(5);
    this.timeout = options.timeout || 1000;
    this.ttl = options.ttl;
    this.created = this.updated = Date.now();
    this.index = 1;
  }

  observe(name, props = {}, options = {}, cb) {
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.key + "/observe";
    this.request({
      // if need more, add more here
      name: name,
      sessionId: this.id,
      userId: this.userId,
      properties: props,
      index: this.index++
    }, options, (err, response, body) => {
      // callback with err and response body
      if (err.message === EARLY_TERMINATION) {
        if (cb) cb(null, body);
      } else {
        if (cb) cb(err, body);
      }
    });
  }

  decide(name, candidates = [], options = {}, cb) {
    options.timeout = options.timeout || this.timeout;
    options.url = this.amp.domain + this.amp.apiPath + this.key + "/decide";
    let {requestSafeCandidates, allCandidates} = this._formatCandidates(candidates);
    this.request({
      // if need more, add more here
      name: name,
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
      let defaultDecisions = allCandidates.slice(0, options.limit);
      if (err.message === EARLY_TERMINATION) {
        // use default
        if(cb) cb(null, options.limit > 1 ? defaultDecisions : defaultDecisions[0], body);
      } else {
        if (err || (!body || !body.index)) {
          if(cb) cb(err, options.limit > 1 ? defaultDecisions : defaultDecisions[0], body);
        } else {
          let decisions = body.indexes.map(v => allCandidates[v]);
          if (cb) cb(null, options.limit > 1 ? decisions: decisions[0], body);
        }
      }
    });
  }

  _formatCandidates(candidates) {
    let res = { arrCandidates: [], requestSafeCandidates: [] };
    if (!candidates) return res;

    if (utils.isArray(candidates)) {
      res.arrCandidates = candidates;
      res.requestSafeCandidates = candidates.map(c => utils.isObject(c) ? c : {value: c});
    } else if (utils.isObject(candidates)) {
      res.arrCandidates = utils.combinations(candidates);
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

      // store into context
      this.context.push(Object.assign({}, body));
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

      // store into context
      this.context.push(Object.assign({}, body));
      this.updated = Date.now();
      if (cb) cb.call(this, err, response, rbody);
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
