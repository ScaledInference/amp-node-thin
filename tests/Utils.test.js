const expect = require("expect.js");

const Utils = require("../Utils");

describe("Utils", function(){

    let utils = new Utils();
    describe("Type Check", function() {
        it("utils.isFunction() should return true for async / named / anoymous / arrow functions", function () {
          let asyncFunc = async function() {};
          let anoymousFn = function() {};
          let namedFn = function f() {};
          let arrowFn = () => {};
          expect(utils.isFunction(asyncFunc)).to.be(true);
          expect(utils.isFunction(anoymousFn)).to.be(true);
          expect(utils.isFunction(namedFn)).to.be(true);
          expect(utils.isFunction(arrowFn)).to.be(true);
        });
    
        it("utils.isFunction() should return false for primitives / objects / errors / regex / null / undefined", function () {
          expect(utils.isFunction("Asd")).to.be(false);
          expect(utils.isFunction(2)).to.be(false);
          expect(utils.isFunction(true)).to.be(false);
          expect(utils.isFunction(Symbol(2))).to.be(false);
          expect(utils.isFunction({})).to.be(false);
          expect(utils.isFunction([])).to.be(false);
          expect(utils.isFunction(new Error(2))).to.be(false);
          expect(utils.isFunction(new RegExp("test"))).to.be(false);
          expect(utils.isFunction(undefined)).to.be(false);
          expect(utils.isFunction(null)).to.be(false);
        });
    
        it("utils.isString() should return true for string", function () {
          expect(utils.isString("asdasd")).to.be(true);
          expect(utils.isString("")).to.be(true);
        });
    
        it("utils.isString() should return false for other primitives / objects / errors / regex / functions / null / undefined", function () {
          expect(utils.isString(12)).to.be(false);
          expect(utils.isString(Symbol(1))).to.be(false);
          expect(utils.isString(true)).to.be(false);
          expect(utils.isString({})).to.be(false);
          expect(utils.isString([])).to.be(false);
          expect(utils.isString(function(){})).to.be(false);
          expect(utils.isString(new Error(2))).to.be(false);
          expect(utils.isString(new RegExp("test"))).to.be(false);
          expect(utils.isString(undefined)).to.be(false);
          expect(utils.isString(null)).to.be(false);
        });
    
        it("utils.isPrimitive() should return true for primitives", function () {
          expect(utils.isPrimitive("asdasd")).to.be(true);
          expect(utils.isPrimitive(2)).to.be(true);
          expect(utils.isPrimitive(true)).to.be(true);
        });
    
        it("utils.isPrimitive() should return false for Symbol / objects / errors / regex / functions / null / undefined", function () {
          expect(utils.isPrimitive(Symbol(1))).to.be(false);
          expect(utils.isPrimitive({})).to.be(false);
          expect(utils.isPrimitive([])).to.be(false);
          expect(utils.isPrimitive(function(){})).to.be(false);
          expect(utils.isPrimitive(new Error(2))).to.be(false);
          expect(utils.isPrimitive(new RegExp("test"))).to.be(false);
          expect(utils.isPrimitive(undefined)).to.be(false);
          expect(utils.isPrimitive(null)).to.be(false);
        });
    
    
        it("utils.isEmpty() should return true for null / undefined", function () {
          expect(utils.isEmpty(undefined)).to.be(true);
          expect(utils.isEmpty(null)).to.be(true);
        });
    
        it("utils.isEmpty() should return false for Symbol / objects / errors / regex / functions / primitives", function () {
          expect(utils.isEmpty(1)).to.be(false);
          expect(utils.isEmpty("asd")).to.be(false);
          expect(utils.isEmpty(true)).to.be(false);
          expect(utils.isEmpty(Symbol(1))).to.be(false);
          expect(utils.isEmpty(function(){})).to.be(false);
          expect(utils.isEmpty(new Error(2))).to.be(false);
          expect(utils.isEmpty(new RegExp("test"))).to.be(false);
          expect(utils.isEmpty({})).to.be(false);
          expect(utils.isEmpty([])).to.be(false);
        });
    
        it("utils.isBoolean() should return true for boolean", function () {
          expect(utils.isBoolean(true)).to.be(true);
          expect(utils.isBoolean(false)).to.be(true);
        });
        it("utils.isBoolean() should return false for Symbol / objects / errors / undefined / functions / null / primitives(exclude boolean)", function () {
          expect(utils.isBoolean(1)).to.be(false);
          expect(utils.isBoolean("asd")).to.be(false);
          expect(utils.isBoolean(/aaa/g)).to.be(false);
          expect(utils.isBoolean(new RegExp("aaa", "g"))).to.be(false);
          expect(utils.isBoolean(Symbol(1))).to.be(false);
          expect(utils.isBoolean(function(){})).to.be(false);
          expect(utils.isBoolean(new Error(2))).to.be(false);
          expect(utils.isBoolean(undefined)).to.be(false);
          expect(utils.isBoolean(null)).to.be(false);
          expect(utils.isBoolean({})).to.be(false);
          expect(utils.isBoolean([])).to.be(false);
        });
    
        it("utils.isJSONSafe should return true for all types without circular", function () {
          expect(utils.isJSONSafe(undefined)).to.be(true);
          expect(utils.isJSONSafe(null)).to.be(true);
          expect(utils.isJSONSafe(1)).to.be(true);
          expect(utils.isJSONSafe("asd")).to.be(true);
          expect(utils.isJSONSafe(true)).to.be(true);
          expect(utils.isJSONSafe(Symbol(1))).to.be(true);
          expect(utils.isJSONSafe(function(){})).to.be(true);
          expect(utils.isJSONSafe(new Error(2))).to.be(true);
          expect(utils.isJSONSafe(new RegExp("test"))).to.be(true);
          expect(utils.isJSONSafe({})).to.be(true);
          expect(utils.isJSONSafe([])).to.be(true);
        });
    
        it("utils.isJSONSafe should return false for circular objects", function () {
          let a = {a: 1};
          let b = [];
          a.a = a;
          b[0] = b;
    
          expect(utils.isJSONSafe(a)).to.be(false);
          expect(utils.isJSONSafe(b)).to.be(false);
        });
    });  

    describe("randomString", function() {
        it("should return random strings with length", function() {
            let string1 = utils.randomString(5);
            let string2 = utils.randomString(5);

            expect(string1.length).to.equal(5);
            expect(string1).to.not.equal(string2);
        });
    });

    describe("merge", function() {
        /* // shallow merge, similiar to Object.assign
        * merge({a: 1}, {a: 2}); // {a: 2}
        * merge(false, {a: 1}, {a: 2}); // {a: 2}
        * merge({a: {a: 1}}, {a: {b: 2}}); // {a: {b: 2}};
        *
        * // deep merge
        * merge(true, {a: {a: 1}}, {a: {b: 2}}); // {a: {a: 1, b: 2}}
        *
        */
        it("should do a simple shallow merge", function() {
            expect(utils.merge({a:1}, {a:2})).to.eql({a:2});
        });

        it("should do a nested shallow merge", function() {
            expect(utils.merge({a:{a:1}}, {a:{b:2}})).to.eql({a:{b:2}});
        });

        it("should merge to objects deeply", function() {
            expect(utils.merge(true, {a: {a: 1}}, {a: {b: 2}})).to.eql({a: {a: 1, b: 2}});
        });
    });

    describe("combinations", function () {
        
        it("should returns empty array for empty object", function () {
            var result = utils.combinations({});
            expect(result).to.eql([]);
        });

        it("should return array of one combination when pass in with one key with one value", function () {
            var result = utils.combinations({ a: [1] });
            expect(result).to.eql([{ a: 1 }]);
        });

        it("should return array of two combinations when pass in with one key with two values", function () {
            var result = utils.combinations({ a: [1, 2] });
            expect(result).to.eql([{ a: 1 }, { a: 2 }]);
        });

        it("should return array of two combinations when pass in with two keys with one value", function () {
            var result = utils.combinations({ a: [1], b: [2] });
            expect(result).to.eql([{ a: 1, b: 2 }]);
        });

        it("should return array of four combinations when pass in with two keys with two values", function () {
            var result = utils.combinations({ a: [1, 2], b: [3, 4] });
            expect(result).to.eql([
            { a: 1, b: 3 },
            { a: 1, b: 4 },
            { a: 2, b: 3 },
            { a: 2, b: 4 }
            ]);
        });

        it("should ignore keys with empty values", function () {
            var result = utils.combinations({ a: [], b: [3, 4], c: [] });
            expect(result).to.eql([{ b: 3 }, { b: 4 }]);
        });

        it("should returns empty array if all keys have empty values", function () {
            var result = utils.combinations({ a: [], b: [] });
            expect(result).to.eql([]);
        });

        it("should return array of two combinations when pass in with one value key, and two values key", function () {
            var result = utils.combinations({ a: [1], b: [3, 4] });
            expect(result).to.eql([{ a: 1, b: 3 }, { a: 1, b: 4 }]);
        });

        it("should return array of four combos when pass in with two-same-value key, two-different-value key", function () {
            var result = utils.combinations({ a: [1, 1], b: [3, 4] });
            expect(result).to.eql([
            { a: 1, b: 3 },
            { a: 1, b: 4 },
            { a: 1, b: 3 },
            { a: 1, b: 4 }
            ]);
        });

        it("should return array of four combos when pass in with two-weak-same-value key, two-different-value key", function () {
            var result = utils.combinations({ a: [1, "1"], b: [3, 4] });
            expect(result).to.eql([
            { a: 1, b: 3 },
            { a: "1", b: 4 },
            { a: 1, b: 3 },
            { a: "1", b: 4 }
            ]);
        });

        it("should not ignore key for non-array values", function () {
            var result = utils.combinations({ a: 1, b: [3, 4] });
            expect(result).to.eql([{ a: 1, b: 3 }, { a: 1, b: 4 }]);
        });

        it("should return empty array if all keys have non-array values", function () {
            var result = utils.combinations({ a: 1, b: "2" });
            expect(result).to.eql([{a: 1, b: "2"}]);
        });

        it("should return empty array for non-object argument: string", function () {
            var result = utils.combinations("hi");
            expect(result).to.eql([]);
        });

        it("should return empty array for non-object argument: array", function () {
            var result = utils.combinations(["hi"]);
            expect(result).to.eql([]);
        });

        it("should return empty array for no argument (i.e. arg is `undefined`)", function () {
            var result = utils.combinations();
            expect(result).to.eql([]);
        });

        it("should return array of one candidate if only one candidate in it)", function () {
            var result = utils.combinations({a: 1});
            expect(result).to.eql([{a: 1}]);
        });

    });
});