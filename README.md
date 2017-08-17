# amp-node-thin


## Usage

``` javascript
// create an amp instance
const amp = new Amp({key: "YOUR_KEY", domain: "YOUR HOST NAME"});

// create a session instance
const session = new amp.Session();

// send observe
session.observe("AmpSession", {"lang": "en", country: "USA"});

// send decide
session.decide("Template", [
  {color: "red", font: "bold"},
  {color: "green", font: "italic"},
  {color: "red", font: "italic"},
  {color: "green", font: "bold"}
], function(err, decision) {
  // now use the decision
  // decision[0].color
  // decision[0].font
});

// send another observe to observe user interaction to help improve decide
session.observe("ClickBtn", {btnName: "SignUp"});
```
