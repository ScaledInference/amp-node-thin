describe("Amp", function(){
    const Amp = require("../Amp");
    const Session = require("../Session");

    var amp = new Amp( {key: "2f28af92f18c090a", userId: "ThinNodeTest"} );
    var session = new amp.Session();

    it("should make observe call to Amp agent", function() {
        session.observe("ObserveTest", {color:"blue"}, {}, function(error, response) {
            if (error) { console.log(error); }
            console.log(response);
        });
    });
});