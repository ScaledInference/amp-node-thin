// the singleton utils instance
let utils;

class Utils {
  constructor() {
    // SINGLETON
    if (utils) return utils;
    utils = this;
  }

  /*
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
            return Object.assign({ [key]: value }, item);
          })).reduce((memo, itemArray) => memo.concat(itemArray), []);
        }

      }
    }

    return combinations;
  }
}

module.exports = Utils;
