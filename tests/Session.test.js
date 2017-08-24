const expect = require("expect.js");

const Amp = require("../Amp");
const Session = require("../Session");

describe("Session", function(){

    var amp = new Amp( {key: "561e88527bd0a73c", userId: "ThinNodeTest", domain: "https://dev.amp.ai", ttl: 5000} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function(done) {
        session.observe("ObserveTest", {"tao":"awesome"}, {}, function(error, response) {
            if (error) { 
                console.log(error); 
                done();
            }

            expect(response).to.eql({});
            done();
        });
    });

    it("should make decide call to Amp agent and return array with single candidate", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {limit: 1}, function(error, decisions, response) {
            if (error) { 
                console.log(error); 
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
                console.log(error); 
            }

            expect(decisions.length).to.equal(1);
            expect(decisions[0].tao).to.equal("awesome");

            done();
        });
    });

    it("should make decide call to Amp agent and return array with all candidates", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {limit: 3}, function(error, decisions, response) {
            if (error) { 
                console.log(error); 
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
                console.log(error); 
                done();
            }

            expect(decisions[0].tao).to.equal("awesome");
            done();
        });
    });

    it("should return error and default decision immediately if candidates sent in decide are greater than 50", function() {
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
                expect(error.message).to.eql("Candidate length must be less than 50.");
                expect(decisions[0]).to.eql({a:0});
            } else {
                expect().fail();
            }
        });
    });

});