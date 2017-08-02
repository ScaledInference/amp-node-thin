const Session = require("./Session");

module.exports = class Amp {
  constructor(options = {}) {
    this.key = options.key;
    if (!this.key) throw new Error("Project Key Needed!");

    this.domain = options.domain || "https://amp.ai";
    if (!this.domain) throw new Error("Domain Needed!");

    this.apiPath = options.apiPath || "/api/v1/";
    this.userId = options.userId;
    this.timeout = options.timeout;

    // the Session Constructor
    let _this = this;
    this.Session = function(sessionOptions = {}) {
      let opts = {};

      // resume
      if (typeof sessionOptions === "string") {
        return _this.Session.deserialize(sessionOptions);
      }

      opts.amp = _this;
      opts.userId = sessionOptions.userId || this.userId;
      opts.timeout = sessionOptions.timeout || this.timeout;
      opts.ttl = sessionOptions.ttl;

      return new Session(opts);
    }

    // deserialize a session
    this.Session.deserialize = function(str) {
      try {
        let resumed = JSON.parse(str);
        if ((resumed.updated && resumed.ttl) && Date.now() - resumed.updated < resumed.ttl) {
          return new Session(Object.assign(resumed, {amp: _this}));
        } else {
          return new _this.Session();
        }
      } catch(e) {
        return new _this.Session();
      }
    }
  }
};
