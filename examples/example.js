console.log(`
This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and your domain to your amp agent, if you use a different apiPath, make sure you pass that too.
`);

// import the Amp library
const Amp = require('../Amp');

// parse the arguments from command line
// node example.js <key> <domain> <apiPath>
const projectKey = process.argv[2]; // eslint-disable-line
const domain = process.argv[3]; // eslint-disable-line
const apiPath = process.argv[4] || '/api/core/v1/'; // eslint-disable-line

// create an amp instance with the key, domain, apiPath
const amp = new Amp({key: projectKey, domain: domain, apiPath: apiPath});

console.log(`
amp instance initialized
`);

// create a session instance
// can also specify the `userId`, `timeout` here: {userId: "guestUser"}
const session = new amp.Session();

console.log(`
session instance initialized
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
  console.log(`
Template Decide request sent! ${err ? 'Error: ' + err : ' '} decide: ${JSON.stringify(decision)}
  `);
});

// if you want to limit the number of candidates returned, pass a `limit` into the options
session.decide('TemplateCombo', {
  color: ['red', 'green'],
  font: ['bold', 'italic']
}, {
  limit: 2
}, function(err, decision) {
  // now use the decision
  // decision.color
  // decision.font
  console.log(`
Template Decide request sent! ${err ? 'Error: ' + err : ' '} decide: ${JSON.stringify(decision)}
  `);
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function batchRequest (delay) {
  const session = new amp.Session();

  await new Promise((resolve) => {
    session.observe('userInfo', {lang: 'en', country: 'USA'}, function(err) {
      if (err) {
        console.log('UserInfo Observe not sent!', err.message);
      } else {
        console.log('UserInfo Observe request sent!');
      }
      resolve();
    });
  });

  await sleep(delay);
  // send decide on which color / font template you want to use
  const { err, decision } = await new Promise((resolve) => {
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
      resolve({
        err,
        decision
      });
    });
  });
  console.log('error', err);
  console.log('deision', decision);
}

async function wrapper(delay) {
  for(let i = 0; i < 100; i++ ) {
    await batchRequest(delay);
  }
}
wrapper(1);

