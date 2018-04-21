'use strict';

// the singleton utils instance
let utils;

class Utils {
  constructor() {
    // SINGLETON
    if (utils) return utils;
    utils = this;
  }

  /*
   * isFunction
   * Check whether target is a function or not.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isFunction(o) {
    return typeof o === 'function';
  }

  /**
   * isPrimitive
   * Check whether target is a primitive or not, true for `string`, `number`, `boolean`.
   * 
   * TODO: should contain `symbol` or not?
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isPrimitive(o) {
    return (typeof o === 'number' || typeof o === 'string' || typeof o === 'boolean');
  }

  /**
   * isString
   * Check whether target is a string or not.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isString(o) {
    return typeof o === 'string';
  }

  /**
   * isNumber
   * Check whether target is a number or not.
   * 
   * @param {*} o
   * @returns {Boolean}
   */
  isNumber (o) {
    return typeof o === 'number';
  }

  /**
   * isBoolean
   * Check whether target is a boolean or not.
   * 
   * @param {*} o
   * @returns {Boolean}
   */
  isBoolean(o) {
    return typeof o === 'boolean';
  }

  /**
   * isEmpty
   * Check whether target is either undefined or null.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isEmpty(o) {
    return (o === void 0 || o === null);
  }

  /**
   * isArray
   * Check whether target is truly an array.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isArray(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase() === 'array';
  }

  /**
   * isObject
   * Check whether target is truly an object.
   * 
   * @param {*} o 
   * @returns {Boolean}
   */
  isObject(o) {
    return Object.prototype.toString.call(o).slice(8).slice(0, -1).toLowerCase() === 'object';
  }

  /**
   * isJSONSafe
   * Check whether target can be used with `JSON.stringify` or not.
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
   * hashCode
   * Generate hash code from a string.
   * 
   * @param {Stirng} str 
   * @returns {String}
   */
  hashCode(str) {
    return (str + '').split('').reduce((hash, c) => {
      // http://stackoverflow.com/questions/299304/why-does-javas-hashcode-in-string-use-31-as-a-multiplier
      hash = ((hash << 5) - hash) + c.charCodeAt(0);
      return hash & hash; // Convert to 32bit integer
    }, 0);
  }

  /**
   * randomString
   * Generate random string from an charset, length can be specified.
   * 
   * @param {Number} length 
   * @param {String} charset 
   * @returns {String}
   */
  randomString(length, charset) {
    length = length || 16; charset = charset || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    let text = '';
    let salt = '';
    const saltratio = 0.25;

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
      const key = keys.pop();

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

  /**
   * merge
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
          for (const key in source) {
            if (!source.hasOwnProperty(key)) continue;

            // array first
            if (this.isArray(source[key])) {
              target[key] = this.result(target[key], 'array');
              this.merge(true, target[key], source[key]);

              // plain objects
            } else if (this.isObject(source[key]) && source[key].constructor === Object) {
              target[key] = this.result(target[key], 'object');
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
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            target[key] = source[key];
          }
        }
      });
    }
    return target;
  }

  /**
   * deepMerge
   * A short cut of `merge` with recursively enabled by default.
   * 
   * @returns {Object}
   */
  deepMerge() {
    // default deep to true
    return this.merge.bind(this, true).apply(this, arguments);
  }

  /**
   *
   * result
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
    if (!this.isString(ensureType)) ensureType = '';

    ensureType = ensureType.toLowerCase();

    if (ensureType === 'array') {
      return this.isArray(o) ? o : [];
    } else if (ensureType === 'object') {
      return this.isObject(o) ? o : {};
    } else if (ensureType === 'number') {
      return parseFloat(o);
    }

    return o;
  }
}

module.exports = Utils;
