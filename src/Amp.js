"use strict";
/**
 * CLS: https://github.com/ScaledInference/amp/wiki/Core-Clients
 * 
 * this is the javascript syntax level client, base for both browser & node env.
 */

// MODULES 
const Session = require("./Session");
const Config = require("./Config");
const Storage = require("./Storage");
const VERSION = require("./Version");
const Request = require("request");

// Utils
const Utils = require("./Utils");
let utils = new Utils();

// constants
const DEFAULT_SYNC_INTERVAL = 7 * 24 * 60 * 60 * 1000;

// The Request Class we are gonna to use
class Request {
  constructor(options) {
    this.timeout = options.timeout || 1000;
    this.method = options.method || "POST";
    this.url = options.url;
  }
  send(body, options, cb) {
    request({
      url: this.url,
      timeout: options.timeout || this.timeout,
      method: this.method,
      body: body,
      json: true
    }, function(err, response, body) {
      cb(err, body);
    });
  }
};

/**
 * Amp class.
 * 
 * An instance of Amp will contain belowing properties:
 *
 *  - version: version info
 *  - config: an instance of Config class
 *
 * and methods:
 * 
 *  - error: pass error info to error hanlder and merge in some config level information for debug
 *  - log: send log entries to server about the errors or metrics (will batch them for request)
 * 
 * and other entities:
 * 
 *  - Session: the class to intialize sessions for this amp instance
 * 
 * Multiple instances supported.
 */
class Amp {
  constructor(options) {
    options.Request = options.Request || Request;

    // VERSION
    this.version = VERSION;

    // only treat fields defined in default configs are valid
    let configs = this.getDefaultConfig();
    Object.keys(configs).forEach(key => {
      if (options.hasOwnProperty(key)) configs[key] = options[key];
    });

    // initialize config instance
    this.config = new Config(configs);

    // Session class
    //  - to support usage with `new
    //  - and also to merge in amp's configuration
    let self = this;

    /**
     * Session class.
     * 
     * will return an valid session instance with customized options and inherited options from the instance.
     * 
     * @param {Object} options
     * @returns {Session}
     */
    this.Session = function (options) {
      let configs = self.config.getAll();
      if (utils.isString(options)) {
        // recover from existing session
        try {
          let resumed = JSON.parse(options);

          // handle ttl
          if (new Date().getTime() - resumed.updated < resumed.ttl) {
            let session = Session.deserialize(utils.merge({}, configs, resumed, {
              amp: self,
              resumed: true
            }));

            // trigger session:resumed event
            self.trigger("session:resumed", session);
            return session;
          }
        } catch (e) {
          // and log ?
          self.error(e);
        }
      };

      options = utils.result(options, "object");

      // return a new session
      //   valid session level options:
      //     - userId
      let sessionOptions = {};
      if (options.userId) sessionOptions.userId = options.userId;
      if (options.properties) sessionOptions.properties = options.properties;
      sessionOptions.ttl = options.ttl || configs.sessionTTL;
      sessionOptions.timeout = options.timeout || configs.timeout;
      sessionOptions.amp = self;
      let session = new Session(utils.merge({}, configs, sessionOptions));

      // trigger session:created event
      self.trigger("session:created", session);

      return session;
    };

    // logRequest
    this.logRequest = new this.Request({
      method: "POST",

      // log path will be: domain + apiPath + key + log
      url: `${this.config.get("domain")}${this.config.get("apiPath")}/${this.config.get("key")}/log`
    });

    // keep a reference to _definedEvents, will be used in session's `runEvents`
    this._definedEvents = Amp._definedEvents;

    // keep a reference to utils from amp instance
    this.utils = utils;
  }

  /**
   * getDefaultConfig, get default configurations for creating new instance.
   * @returns {Object}
   */
  getDefaultConfig() {
    // put all defaults here, it will be overwritten in browser and node
    return {
      domain: "https://amp.ai",
      apiPath: "/api/core/v1",
      key: "",
      userId: "",
      samplingRate: 1,
      sessionTTL: 0,
      debug: "warn",  // error > warn > info > debug
      timeout: 1000,
      builtinEvents: []
    };
  }

  /**
   * error, report errors through `utils.error` with current instance configuration merged as options.
   * @param {Error} error
   * @param {Object} opts optional options
   */
  error(e, opts) {
    opts = utils.merge({
      version: this.version,
      configs: this.config.getAll()
    }, opts);

    // trigger error event with error info and amp instance
    this.trigger("error", e, this)

    return utils.error(e, opts);
  }

  /**
   * log, send error or metric back to server.
   * @param {Object} entry 
   * @param {Boolean} immediately
   */
  log(entry, immediately) {
    // batch them
    clearTimeout(this._logTimer);
    this._logEntries = this._logEntries || [];
    if (entry) this._logEntries.push(entry);
    let send = () => {
      // if no entries, no send
      if (!this._logEntries.length) return;

      // send the entries
      this.logRequest.send({entries: this._logEntries});

      // trigger log event with the log entries
      this.trigger("log", this._logEntries);

      // and clear it
      this._logEntries = [];
    };

    if (immediately) send();
    else {
      // set the _logTimer
      this._logTimer = setTimeout(send, 5000);
    }
  }

  /**
   * record the timing info, and log them, this function call will mark the start and return a hook that will be able to mark the end of this record.
   *
   * @name timing
   * @param {String} name
   * @param {Object} details
   * @return {Object} res
   * @return {Function} res.end - mark the end and record to log
   *
   */
  timing(name, details = {}) {
    let start = details.start || new Date().getTime();

    // the end function that will be returned
    let end = () => {
      this.log(utils.merge({
        type: "metric",
        name: name,
        value: new Date().getTime() - start
      }, details));
    };
    return { end };
  }

  /**
   * add new event handler to the defined events list, all hanlders will be called within session context, mainly internal use.
   * 
   * @param {String} name 
   * @param {Function} fn 
   * @example
   * 
   * let utils = new Utils();
   * this.addEvent("AmpSession", function(session) {
   *  // send an `AmpSession` event with default session props and props passed in when create the session
   *  session.observe("AmpSession", session.options.properties);
   * });
   * 
   */
  static addEvent(name, fn) {
    Amp._definedEvents = Amp._definedEvents || {};
    if (utils.isString(name) && utils.isFunction(fn)) Amp._definedEvents[name] = fn;
  }
}

// so have a reference to register new utils
Amp.Utils = Utils;
Amp.Session = Session;

module.exports = Amp;
