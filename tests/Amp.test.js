const expect = require("expect.js");

const Amp = require("../Amp");
const Session = require("../Session");

describe("Amp", function(){

    var amp = new Amp( {key: "ac646ba1c1398b12", userId: "ThinNodeTest", domain: "https://dev.amp.ai", sessionTTL: 5000} );
    var session = new amp.Session();

    it("should be able to serialize/deserialize a session", function() {
        var serializedSession = session.serialize();
        var newSession = new amp.Session(serializedSession);

        expect(session.id).to.equal(newSession.id);
    });
});