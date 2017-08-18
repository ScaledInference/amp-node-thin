describe("Amp", function(){
    const Amp = require("../Amp");
    const Session = require("../Session");
    const request = require("request");
    request.debug = true;

    var amp = new Amp( {key: "561e88527bd0a73c", userId: "ThinNodeTest", domain: "https://dev.amp.ai"} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function(done) {
        session.observe("ObserveTest", {"tao":"awesome"}, {}, function(error, response) {
            if (error) { 
                console.log(error); 
                fail();
            }
            console.log(response);
            expect(response).toContain("OK");
            done();
        });
    });

    it("should make decide call to Amp agent and return array with single candidate", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {limit: 1}, function(error, decision, response) {
            if (error) { 
                console.log(error); 
                fail();
            }
            console.log(response); // response should be array

            expect(decision.length).toEqual(1);
            expect(decision[0].tao).toEqual("awesome");

            done();
        });
    });

    it("should make decide call to Amp agent and return array with all candidates", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {}, function(error, decision, response) {
            if (error) { 
                console.log(error); 
                fail();
            }
            console.log(response); // response should be array

            expect(decision.length).toEqual(3);
            expect(decision[0].tao).toEqual("awesome");

            done();
        });
    });
});