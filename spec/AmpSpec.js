describe("Amp", function(){
    const Amp = require("../Amp");
    const Session = require("../Session");
    const request = require("request");
    request.debug = true;

    var amp = new Amp( {key: "c5746225f9d4b191", userId: "ThinNodeTest", domain: "https://dev.amp.ai"} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function(done) {
        session.observe("ObserveTest", {"tao":"awesome"}, {}, function(error, response) {
            if (error) { console.log(error); }
            console.log(response);
            done();
        });
    });

    it("should make decide call to Amp agent", function(done) {
        session.decide("DecideTest", {"tao":["awesome", "ok", "worthless"]}, {}, function(error, response) {
            if (error) { console.log(error); }
            console.log(response);
            done();
        });
    });
});