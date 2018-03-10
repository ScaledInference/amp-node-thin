"use strict";

const Session = require("./Session");
const Utils = require("./Utils");

const utils = new Utils();

module.exports = class Amp {
  constructor(options = {}) {
    this.key = options.key;
    if (!this.key) throw new Error("Project Key Needed!");

    this.apiPath = options.apiPath || "/api/core/v1/";
    this.domain = options.domain || "https://amp.ai";
    this.options = options;
    this.timeout = options.timeout;

    // the Session Constructor
    let _this = this;
    this.Session = function(sessionOptions = {}) {
      let opts = Object.assign({}, sessionOptions);

      // resume
      if (typeof sessionOptions === "string") {
        return _this.Session.deserialize(sessionOptions);
      }

      opts.amp = _this;
      opts.id = sessionOptions.id ;
      opts.userId = _this.options.userId || sessionOptions.userId;
      opts.timeout = sessionOptions.timeout || _this.timeout || 1000;
      opts.ttl = sessionOptions.ttl || _this.options.sessionTTL || 0;

      return new Session(opts);
    }

    /**
     * Deserialize a session
     * 
     * @param  {string} str
     */
    this.Session.deserialize = function(str) {
      try {
        let resumed = JSON.parse(str);
        if ((resumed.updated && resumed.ttl) && (Date.now() - resumed.updated < resumed.ttl)) {
          return new Session(Object.assign(resumed, { amp: _this }));
        } else {
          return new _this.Session();
        }
      } catch(e) {
        return new _this.Session();
      }
    }
  }
};
