'use strict';

// the singleton utils instance
let utils;

class Utils {
  constructor() {
    // SINGLETON
    if (utils) return utils;
    utils = this;
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
   * generateRandomAlphNumericString
   * Generate random string from the default charset and specified length.
   *
   * @param {Number} length
   * @returns {String}
   */
  generateRandomAlphNumericString (length = 16) {
    const charSet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return [...Array(length).keys()].reduce((text, v) => { return text += charSet.charAt(Math.random()*charSet.length); }, ''); // eslint-disable-line no-unused-vars
  }
}

module.exports = Utils;
