const expect = require("expect.js");

const Amp = require("../Amp");
const Session = require("../Session");

describe("Amp", function(){

    var amp = new Amp( {key: "561e88527bd0a73c", userId: "ThinNodeTest", domain: "https://dev.amp.ai", ttl: 5000} );
    var session = new amp.Session();

    it("should be able to serialize/deserialize a session", function() {
        var serializedSession = session.serialize();
        var newSession = new amp.Session(serializedSession);

        expect(session.id).to.equal(newSession.id);
    });
});