'use strict';

const Session = require('./Session');
const Version = require('./Version');

/**
 * Amp
 * Constructs Amp instance with passed configuration.
 *
 * @constructor
 * @param {Object} options
 *
 * Options:
 *  key - project key
 *  domain - domain of Amp server
 *  apiPath - path of API
 *  sessionTTL - TTL for session
 *  timeout - TTL for requests
 *
 */
module.exports = class Amp {
  constructor(options = {}) {
    this.key = options.key;
    if (!this.key) throw new Error('Project Key Needed!');

    this.apiPath = options.apiPath || '/api/core/v1/';
    this.domain = options.domain || 'https://amp.ai';
    this.options = options;
    this.timeout = options.timeout;
    this.version = Version;

    // the Session Constructor
    const _this = this;
    this.Session = function(sessionOptions = {}) {
      const opts = Object.assign({}, sessionOptions);

      // resume
      if (typeof sessionOptions === 'string') {
        return _this.Session.deserialize(sessionOptions);
      }

      opts.amp = _this;
      opts.id = sessionOptions.id;
      opts.userId = sessionOptions.userId || _this.options.userId;
      opts.timeout = sessionOptions.timeout || _this.timeout || 1000;
      opts.ttl = sessionOptions.ttl || _this.options.sessionTTL || 0;

      return new Session(opts);
    };

    /**
     * Deserialize a session
     *
     * @param  {string} str
     */
    this.Session.deserialize = function(str) {
      try {
        const resumed = JSON.parse(str);
        if ((resumed.updated && resumed.ttl) && (Date.now() - resumed.updated < resumed.ttl)) {
          return new Session(Object.assign(resumed, { amp: _this }));
        } else {
          return new _this.Session();
        }
      } catch(e) {
        return new _this.Session();
      }
    };
  }
};
