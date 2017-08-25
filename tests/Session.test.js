const expect = require("expect.js");

const Amp = require("../Amp");
const Session = require("../Session");

describe("Session", function(){

    var amp = new Amp( {key: "561e88527bd0a73c", userId: "ThinNodeTest", domain: "https://dev.amp.ai", ttl: 5000} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function(done) {
        session.observe("ObserveTest", {"tao":"awesome"}, {}, function(error, response) {
            if (error) { 
                expect().fail();
                done();
            }

            expect(response).to.eql({});
            done();
        });
    });

    it("should make decide call to Amp agent and return array with single candidate", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {limit: 1}, function(error, decisions, response) {
            if (error) { 
                expect().fail();
                done();
            }

            expect(decisions.length).to.equal(1);
            expect(decisions[0].tao).to.equal("awesome");

            done();
        });
    });

    it("should make decide call to Amp agent and return array with single candidate if no limit", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {}, function(error, decisions, response) {
            if (error) { 
                expect().fail();
                done();
            }

            expect(decisions.length).to.equal(1);
            expect(decisions[0].tao).to.equal("awesome");

            done();
        });
    });

    it("should make decide call to Amp agent and return array with all candidates", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {limit: 3}, function(error, decisions, response) {
            if (error) { 
                expect().fail();
                done();
            }

            expect(decisions.length).to.equal(3);
            expect(decisions[0].tao).to.equal("awesome");

            done();
        });
    });

    it("should use default decision if call times out", function(done) {
        session.decide("DecideTimeoutTest", {"tao":["awesome", "ok", "worthless"]}, {timeout: 1}, function(error, decisions, response) {
            if (error) { 
                expect().fail();
                done();
            }

            expect(decisions[0].tao).to.equal("awesome");
            done();
        });
    });

    it("should return error and default decision immediately if flattened candidates sent in decide are greater than 50", function() {
        let candidates = {};

        for (let i in 51) {
            if (i < 15) {
                candidates["a"] = i;
            } else if (i < 35) {
                candidates["b"] = i;
            } else {
                candidates["c"] = i;
            }
        }

        session.decide("MaxedCandidates", candidates, function(error, decisions, response) {
            if (error) {
                expect(error.message).to.eql("Candidate length must be less than or equal to 50.");
                expect(decisions[0]).to.eql({a:0});
                done();
            } else {
                expect().fail();
                done();
            }
        });
    });

    it("should return error and default decision immediately in callback if array value candidates sent in decide are greater than 50", function(done) {
        let candidates = {};
        let keys = ["a", "b", "c"];

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            let value = [];
            for (let j = 0; j < 51; j++) {
              value[j] = j;    
            }

            candidates[key] = value;
        }

        session.decide("MaxedCandidates", candidates, function(error, decisions, response) {
            if (error) {
                expect(error.message).to.eql("Candidate length must be less than or equal to 50.");
                expect(decisions[0]).to.eql({a:0, b: 0, c: 0});
                done();
            } else {
                expect().fail();
                done();
            }
        });
    });

    it("should support sync decision making that returns default decision if candidates over 50", function() {
        let candidates = {};
        let keys = ["a", "b", "c"];

        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];

            let value = [];
            for (let j = 0; j < 51; j++) {
              value[j] = j;    
            }

            candidates[key] = value;
        }

        let decision = session.decide("SyncMaxedCandidates", candidates);
        expect(decision[0]).to.eql({a:0, b: 0, c: 0});
    });

    it("should support sync decision making that returns default decision if candidates under 50", function() {
        let decision = session.decide("SyncDecide", {first: ["a", "b", "c"], second: ["d", "e", "f"]});
        expect(decision[0]).to.eql({first: "a", second: "d"});
    });
});