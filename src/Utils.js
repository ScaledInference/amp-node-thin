"use strict";
/**
 * Utils, a singleton class contains all utilities amp needs, also support extend by `Utils.register`.
 */


// All errors we will use.
const ERRORS = {
  INVALID_REQUEST_HANDLER: "Invalid Request Handler Passed In!",
  INVALID_STORAGE_HANDLER: "Invalid Storage Handler Passed In!",
  MISSING_EVENT_NAME: "Event Name IS Required!",
  INVALID_CANDIDATE: "Invalid Candidates!",
  UNRECOGNIZE_FUNCTION: "Unrecognized Function Found!"
};

const URL_REGEX = /\(?(?:(http|https|ftp):\/\/)?(?:((?:[^\W\s]|\.|-|[:]{1})+)@{1})?((?:www.)?(?:[^\W\s]|\.|-)+[\.][^\W\s]{2,4}|localhost(?=\/)|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::(\d*))?([\/]?[^\s\?]*[\/]{1})*(?:\/?([^\s\n\?\[\]\{\}\#]*(?:(?=\.)){1}|[^\s\n\?\[\]\{\}\.\#]*)?([\.]{1}[^\s\?\#]*)?)?(?:\?{1}([^\s\n\#\[\]]*))?([\#][^\s\n]*)?\)?/;

// the singleton instance
let utils;

class Utils {
  constructor() {
    // SINGLETON
    if (utils) return utils;

    // methods that should not be overwritten
    // can be updated later so put into into instance directly
    this.protectedMethods = ["Events", "error", "merge", "deepMerge", "hashCode", "combinations", "result"];

    this.ERRORS = ERRORS;

    // SINGLETON
    utils = this;
  }

  /**
   * error hanlder, will handle errors based on different option.
   * 
   * @param {Error} e 
   * @param {Object} opts 
   */
  error(e, opts) {
    opts = this.result(opts, "object");

    // if debug is on, throw it
    let debug = opts.configs && opts.configs.debug;
    this.merge(e, opts);

    // dispatch to different handlers
    switch (debug) {
      case true:
      case "debug":
        throw e;
      case "warn":
        console.warn(e);
        return e;
      case false:
        return e;
      default:
        console.log(e);
        return e;
    }
  }

  /**
   * isFunction, check whether target is a function or not.
   * @param {*} o 
   * @returns {Boolean}
   */
  isFunction(o) {
    return typeof o === "function";
  }

  /**
   * isPrimitive, check whether target is a primitive or not, true for `string`, `number`, `boolean`.
   * 
   * TODO: should contain `symbol` or not?
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isPrimitive(o) {
    return (typeof o === "number" || typeof o === "string" || typeof o === "boolean");
  }

  /**
   * isString, check whether target is a string or not.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isString(o) {
    return typeof o === "string";
  }

  /**
   * isNumber, check whether target is a number or not.
   * 
   * @param {*} o
   * @returns {Boolean}
   */
  isNumber (o) {
    return typeof o === "number";
  }

  /**
   * isBoolean, check whether target is a boolean or not.
   * 
   * @param {*} o
   * @returns {Boolean}
   */
  isBoolean(o) {
    return typeof o === "boolean";
  }



  /**
   * isEmpty, check whether target is either undefined or null.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isEmpty(o) {
    return (o === void 0 || o === null);
  }

  /**
   * isRegExp, check whether target is a regexp.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isRegExp(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase() === "regexp";
  }

  /**
   * isArray, check whether target is truly an array.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isArray(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase() === "array";
  }

  /**
   * isObject, check whether target is truly an object.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isObject(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase() === "object";
  }

  /**
   * isJSONSafe, check whether target can be used with `JSON.stringify` or not.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isJSONSafe(o) {
    try {
      JSON.stringify(o);
      return true;
    } catch(e) {
      return false;
    }
  }

  /**
   * Check All Values
   * 
   * @param {Function} booleanFunction 
   * @param {Array} values 
   * @param {String} exception 
   */
  checkAllValues(booleanFunction, values, exception) {
    try {
      values.forEach(val => {
        if (!booleanFunction(val)) throw expection;
      });
    } catch (e) {
      throw exception || e;
    }
  }

  /**
   * 
   * @param {Boolean} [deep] - deep merge mode
   * @param {Object} target - target object of the merging
   * @param {...Object} source - source objects of the merging
   * @returns {Object} merged object
   * @example
   *
   *
   * // shallow merge, similiar to Object.assign
   * merge({a: 1}, {a: 2}); // {a: 2}
   * merge(false, {a: 1}, {a: 2}); // {a: 2}
   * merge({a: {a: 1}}, {a: {b: 2}}); // {a: {b: 2}};
   *
   * // deep merge
   * merge(true, {a: {a: 1}}, {a: {b: 2}}); // {a: {a: 1, b: 2}}
   *
   */
  merge(deep, target) {
    let sources;
    if (deep === true) {
      // deep merge
      // es5 for spread operator
      sources = Array.prototype.slice.call(arguments, 2);

      if (target == null || this.isPrimitive(target)) target = {};

      // iterate every source object in sources
      sources.forEach(source => {
        if (this.isObject(source) || this.isArray(source)) {
          for (let key in source) {
            if (!source.hasOwnProperty(key)) continue;

            // array first
            if (this.isArray(source[key])) {
              target[key] = this.result(target[key], "array");
              this.merge(true, target[key], source[key]);

              // plain objects
            } else if (this.isObject(source[key]) && source[key].constructor === Object) {
              target[key] = this.result(target[key], "object");
              this.merge(true, target[key], source[key]);

              // for primitive/function/complex objects, just overwrite
            } else {
              target[key] = source[key];
            }
          }
        }
      });

    } else {
      // shallow merge
      if (deep === false) {
        // specified deep
        sources = Array.prototype.slice.call(arguments, 2);
      } else {
        // use as default(without deep)
        target = deep;
        sources = Array.prototype.slice.call(arguments, 1);
      }
      sources.forEach(source => {
        for (let key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      });
    }
    return target;
  }

  /**
   * deepMerge, a short cut of `merge` with recursively enabled by default.
   * @returns {Object}
   */
  deepMerge() {
    // default deep to true
    return this.merge.bind(this, true).apply(this, arguments);
  }

  /**
   * Handles JS Object Literal (JSON without key quotes)
   *
   * @name parse
   * @param {String} jsonstr The string to turn into a json object
   * @returns {Object} Returns the inflated object
   * @example
   *
   * var obj = parse('{hello: "world"}');
   */
  parse(str) {
    if (!str || !this.isString(str)) return null;

    // Remove whitespace
    str = str.replace(/^(\s|\u00A0)+|(\s|\u00A0)+$/g, "");

    // Logic borrowed from http://json.org/json2.js
    if (/^[\],:{}\s]*$/.test(str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@")
          .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]")
          .replace(/(?:^|:|,)(?:\s*\[)+/g, ":")
          .replace(/\w*\s*\:/g, ":"))) { //Handle unquoted strings here - same as json2 up till this point
      try {
        return (new Function("return " + str))();
      } catch (e) {
        return null;
      }

    }

    // return null if can not parse
    return null;
  }

  /**
   *
   * @param {*} o - can be any thing, if function, will resolve before going to next step
   * @param {String} [ensureType] - expected type
   * @param {Object} [context] - context used if o is function
   * @returns {*}
   * @example
   *
   * result("aaa", "string"); // "aaa"
   * result("aaa", "number"); // NaN
   * result("12aaa", "number"); // 12
   * result("aaa", "Object"); // {}
   * result("aaa", "array"); // []
   */
  result(o, ensureType, context) {
    if (this.isFunction(o)) o = o.call(context);
    if (!this.isString(ensureType)) ensureType = "";

    ensureType = ensureType.toLowerCase();

    if (ensureType === "array") {
      return this.isArray(o) ? o : [];
    } else if (ensureType === "object") {
      return this.isObject(o) ? o : {};
    } else if (ensureType === "number") {
      return parseFloat(o);
    }

    return o;
  }


  /**
   * hashCode, generate hash code from a string.
   * @param {Stirng} str 
   * @returns {String}
   */
  hashCode(str) {
    return (str + "").split("").reduce((hash, c) => {
      // http://stackoverflow.com/questions/299304/why-does-javas-hashcode-in-string-use-31-as-a-multiplier
      hash = ((hash << 5) - hash) + c.charCodeAt(0);
      return hash & hash; // Convert to 32bit integer
    }, 0);
  }

  /**
   * randomString, generate random string from an charset, length can be specified.
   * @param {Number} length 
   * @param {String} charset 
   * @returns {String}
   */
  randomString(length, charset) {
    length = length || 16; charset = charset || "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    let text = "";
    let salt = "";
    let saltratio = 0.25;

    let saltLength = Math.floor(length * saltratio);
    let randomTextLength = length - saltLength;
    let hashcode;

    // build hashcode on userAgent, window size and current time (if exists)
    hashcode = Math.abs(this.hashCode(new Date().getTime()) % charset.length);

    // construct salt part
    while (saltLength--) {
      salt += charset.charAt(Math.floor(hashcode % charset.length));

      // hash the quotient
      hashcode = Math.abs(this.hashCode(hashcode / charset.length));
    }

    // if no window or no crypto like IE < 11
    while (randomTextLength--) text += charset.charAt(Math.floor(Math.random() * charset.length));
    text += salt;

    return text;
  }


  /**
   * randomFloat [0, 1)
   * 
   * @returns {Number}
   */
  randomFloat () {
    return Math.random();
  }

  /**
   * urlParser, parse a url into standard pieces.
   * 
   * should be overwritten in browser with `a` tag.
   * 
   * credit: https://someweblog.com/url-regular-expression-javascript-link-shortener/
   * 
   * @param {String} url 
   * @return {Object}
   */
  urlParser(url) {
    let ret = {};
    let parsed = URL_REGEX.exec(url);
    if (parsed) {
      ret.url = parsed[0];
      if (parsed[1]) ret.protocol = parsed[1] + ":";
      ret.userinfo = parsed[2];
      ret.domain = parsed[3];
      ret.port = parsed[4];
      ret.path = parsed[5] + parsed[6];
      ret.file = parsed[6];
      ret.fileExt = parsed[7];
      if (parsed[8]) ret.search = "?" + parsed[8];
      ret.query = parsed[8];
      ret.hash = parsed[9];
    }
    return ret;
  }

  /**
   * combinations
   *
   * @name combinations
   * @param {Object} kvpairs - Keys mapped to potential values
   * @returns {Object[]} All possible combinations of values
   * @example
   *
   * combinations({a: [1, 2], b: ["a", "b"]});
   * // [{a: 1, b: "a"}, {a: 1, b: "b"}, {a: 2, b: "a"}, {a: 2, b: "b"}]
   *
   */
  combinations(kvpairs) {

    if (!this.isObject(kvpairs)) return [];

    let keys = Object.keys(kvpairs);
    if (!keys.length) return [];

    let combinations = [];

    // sort the keys alphabetical order - dereasing since we are using pop
    keys = keys.sort().reverse();

    while (keys.length) {
      let key = keys.pop();

      let values = kvpairs[key];

      // convert primitive into array
      if (values && !this.isArray(values)) values = [values];

      if (values.length) {
        // First hit - just combine
        if (combinations.length === 0) {
          combinations = values.map(value => {
            return { [key]: value };
          });

          // Subsequent hits split combinations by the number of values
        } else {
          combinations = combinations.map(item => values.map(value => {
            return this.merge({ [key]: value }, item);
          })).reduce((memo, itemArray) => memo.concat(itemArray), []);
        }

      }
    }

    return combinations;
  }

  /**
   * MD5 - uniform hash of a string
   * 
   * Credit: https://github.com/jbt/js-crypto/blob/master/md5.js
   */
  md5(str) {
    // jscs:disable
    var k = [], i = 0;

    for (; i < 64;) {
      k[i] = 0 | (Math.abs(Math.sin(++i)) * 4294967296);
    }

    var b, c, d, j,
      x = [],
      str2 = unescape(encodeURI(str)),
      a = str2.length,
      h = [b = 1732584193, c = -271733879, ~b, ~c],
      i = 0;

    for (; i <= a;) x[i >> 2] |= (str2.charCodeAt(i) || 128) << 8 * (i++ % 4);

    x[str = (a + 8 >> 6) * 16 + 14] = a * 8;
    i = 0;

    for (; i < str; i += 16) {
      a = h; j = 0;
      for (; j < 64;) {
        a = [
          d = a[3],
          ((b = a[1] | 0) +
            ((d = (
              (a[0] +
                [
                  b & (c = a[2]) | ~b & d,
                  d & b | ~d & c,
                  b ^ c ^ d,
                  c ^ (b | ~d)
                ][a = j >> 4]
              ) +
              (k[j] +
                (x[[
                  j,
                  5 * j + 1,
                  3 * j + 5,
                  7 * j
                ][a] % 16 + i] | 0)
              )
            )) << (a = [
              7, 12, 17, 22,
              5, 9, 14, 20,
              4, 11, 16, 23,
              6, 10, 15, 21
            ][4 * a + j++ % 4]) | d >>> 32 - a)
          ),
          b,
          c
        ];
      }
      for (j = 4; j;) h[--j] = h[j] + a[j];
    }

    str = "";
    for (; j < 32;) str += ((h[j >> 3] >> ((1 ^ j++ & 7) * 4)) & 15).toString(16);

    return str;
    // jscs:enable
  }

  /**
   * Hash Float.
   * Convert a string into a uniformly distributed float [0-1] using md5
   * 
   * @param {str} str - the str to convert to a float
   * @return {Number}
   */
  hashFloat (str) {
    return parseInt(this.md5(str), 16) / Math.pow(2, 128);
  }

  /**
   * Shuffle an array.
   *
   * @param {Array} arr - the array you want to shuffle
   * @return {Array} arr
   */
  shuffle(arr) {
    arr = arr.slice(0); // Clone
    let temp, swap, index = arr.length;
    while (index > 0) {
      swap = Math.floor(Math.random() * index--);
      temp = arr[swap];
      arr[swap] = arr[index];
      arr[index] = temp;
    }
    return arr;
  }

  /**
   * Rendezvous Hashing (with md5 hashing)
   * https://en.wikipedia.org/wiki/Rendezvous_hashing
   *
   * @example
   * rendezvousHash("asdf123", {mno: 0.2, xyz: 0.8}); // returns xyz for 80% of the possible ids
   */
  rendezvousHash(id, shards) {
    let keys = Object.keys(shards);

    // Return immeidately if < 2 keys
    if (keys.length < 2) return keys[0];
  
    // Normalize shard weights
    let sum = 0;
    keys.forEach(key => sum += shards[key]);

    let normalizedShards = {}; // key -> [0-1] weight
    keys.forEach(key => normalizedShards[key] = shards[key] / sum);

    // Choose the max score from hashing the key/id combo
    let max = null;
    let shard = null;

    Object.keys(normalizedShards).forEach(key => {
      let weight = normalizedShards[key];
      if (weight <= 0) return;

      // Hash the shard key and id together
      let hash = this.md5(key + "" + id);

      // Convert the md5 hash to uniformly distributed float [0-1)
      let hashF = parseInt(hash, 16) / Math.pow(2, 128);

      // Compute the score
      // - Using logarithmic method as described in wiki article above
      let score = Math.log(hashF) / weight;

      if (max === null || score > max) {
        shard = key;
        max = score;
      }
    });

    return shard;
  }

  /**
   * register, static function of Utils class. Support register any method that not in the list of protected methods.
   * 
   * @param {String} name
   * @param {Function} fn 
   */
  static register(name, fn) {
    // has a safe black list to prevent changes on some methods like `type`
    let utils = new Utils();  // retrieve the instance
    if (utils.isString(name) && utils.isFunction(fn)) {
      if (utils.protectedMethods.indexOf(name) > -1) throw new Error("Method exists and protected!");
      utils[name] = fn.bind(utils);
    } else {
      throw new Error("Invalid Input Format!");
    }
  }
}

module.exports = Utils;
