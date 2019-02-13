const expect = require('expect.js');

const Utils = require('../Utils');

describe('Utils', function(){

  const utils = new Utils();
  describe('Type Check', function() {

    it('utils.isEmpty() should return true for null / undefined', function () {
      expect(utils.isEmpty(undefined)).to.be(true);
      expect(utils.isEmpty(null)).to.be(true);
    });

    it('utils.isEmpty() should return false for Symbol / objects / errors / regex / functions / primitives', function () {
      expect(utils.isEmpty(1)).to.be(false);
      expect(utils.isEmpty('asd')).to.be(false);
      expect(utils.isEmpty(true)).to.be(false);
      expect(utils.isEmpty(Symbol(1))).to.be(false);
      expect(utils.isEmpty(function(){})).to.be(false);
      expect(utils.isEmpty(new Error(2))).to.be(false);
      expect(utils.isEmpty(new RegExp('test'))).to.be(false);
      expect(utils.isEmpty({})).to.be(false);
      expect(utils.isEmpty([])).to.be(false);
    });
  });

  describe('Generate Random String', function(){
    it('should return random strings with different length', function(){
      const string1 = utils.generateRandomAlphaNumericString();
      const string2 = utils.generateRandomAlphaNumericString(10);
      expect(string1.length).to.equal(16);
      expect(string2.length).to.equal(10);
      expect(string1).to.not.equal(string2);
    });
  });

});
