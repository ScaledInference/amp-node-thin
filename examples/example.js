console.log(`
This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and your domain to your amp agent, if you use a different apiPath, make sure you pass that too.
`);

// import the Amp library
const Amp = require('../Amp');

// parse the arguments from command line
// node example.js <key> <domain> <apiPath>
const projectKey = process.argv[2];
const domain = process.argv[3];
const apiPath = process.argv[4];

// create an amp instance with the key, domain, apiPath
const amp = new Amp({key: projectKey, domain: domain, apiPath: apiPath});

console.log(`
amp instance initialized
`);

// create a session instance
// can also specify the `userId`, `timeout` here: {userId: "guestUser"}
const session = new amp.Session();

console.log(`
session instance initliazed
`);

// send observe with user information
session.observe('userInfo', {lang: 'en', country: 'USA'}, function(err) {
  if (err) {
    console.log('UserInfo Observe not sent!', err.message);
  } else {
    console.log('UserInfo Observe request sent!');
  }
});

// send decide on which color / font template you want to use
session.decide('Template', [
  {color: 'red', font: 'bold'},
  {color: 'green', font: 'italic'},
  {color: 'red', font: 'italic'},
  {color: 'green', font: 'bold'}
], function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  if (err) {
    console.log('Template Decide not sent!', err.message);
  } else {
    console.log('Template Decide request sent!', JSON.stringify(decision));
  }
});

// you can also send with combinations
session.decide('TemplateCombo', {
  color: ['red', 'green'],
  font: ['bold', 'italic']
}, function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  if (err) {
    console.log('TemplateCombo Decide not sent!', err.message);
  } else {
    console.log('TemplateCombo Decide request sent!', JSON.stringify(decision));
  }
});

// send another observe to observe user interaction to help improve decide
// so we will build the model to help you make better decision on which template should be the best choice for which type of users and will give you the highest or lowest click on `SignUp`
session.observe('ClickBtn', {btnName: 'SignUp'}, function(err) {
  if (err) {
    console.log('ClickBtn Observe not sent!', err.message);
  } else {
    console.log('ClickBtn Observe request sent!');
  }
});
