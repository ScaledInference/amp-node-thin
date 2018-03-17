const expect = require("expect.js");

const Amp = require("../Amp");
const Session = require("../Session");

describe("Session", function(){

    var amp = new Amp( {key: "ac646ba1c1398b12", userId: "ThinNodeTest", domain: "https://dev.amp.ai", sessionTTL: 5000} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function(done) {
        session.observe("ObserveTest", {tao:"awesome"}, function(error, response) {
            if (error) {
                expect().fail();
                done();
            }

            expect(response).to.eql({});
            done();
        });
    });

    it("should use default decision if call times out", function(done) {
        session.decide("DecideTimeoutTest", {"tao":["awesome", "ok", "worthless"]}, {timeout: 1}, function(error, decision, response) {
            if (error) {
                expect().fail();
                done();
            }

            expect(decision.tao).to.equal("awesome");
            done();
        });
    });

    it("should return error and default decision immediately if flattened candidates sent in decide are greater than 50", function(done) {
        this.timeout(3000);

        let candidates = [];

        for (let i = 0; i < 51; i++) {
            candidates.push({a: i, b: i, c: i});
        }

        session.decide("MaxedCandidates", candidates, function(error, decision, response) {
            if (error) {
                expect(error.message).to.eql("Candidate length must be less than or equal to 50.");
                expect(decision).to.eql({a:0, b: 0, c: 0});
            } else {
                expect().fail();
            }
            done();
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

        session.decide("MaxedCandidates", candidates, function(error, decision, response) {
            if (error) {
                expect(error.message).to.eql("Candidate length must be less than or equal to 50.");
                expect(decision).to.eql({a:0, b: 0, c: 0});
            } else {
                expect().fail();
            }
            done();
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
        expect(decision).to.eql({a:0, b: 0, c: 0});
    });

    it("should support sync decision making that returns default decision if candidates under 50", function() {
        let decision = session.decide("SyncDecide", {first: ["a", "b", "c"], second: ["d", "e", "f"]});
        expect(decision).to.eql({first: "a", second: "d"});
    });

    it("should single object in decsion callback or synchronously", function(done) {
        session.decide("DecideTimeoutTest", {"tao":["awesome", "ok", "worthless"]}, function(error, decision, response) {
            if (error) {
                expect().fail();
            }

            expect(decision.tao).to.equal("awesome");
            done();
        });
    });

    it("should ignore limit option and always set to 1", function(done) {
        let decision = session.decide("SyncDecide", {first: ["a", "b", "c"], second: ["d", "e", "f"]}, {limit: 2}, function(error, decision) {
            expect(decision).to.eql({first: "a", second: "d"});
            done();
        });

        expect(decision).to.eql({first: "a", second: "d"});
    });

    it("should allow setting userId", function() {
        amp.session = new amp.Session({userId: 'Yanpu'});

        expect(amp.session.userId).to.equal('Yanpu');
    });
});
