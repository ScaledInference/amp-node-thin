const Amp = require('../Amp');

console.log('This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and valid amp agent url.');

const ampSingleSessionTest = async (key, agents) => {
  const amp = new Amp(key, agents);
  const { Session } = amp;

  const firstSession = new Session();
  const context = { browser_height: 1740, browser_width : 360 };
  const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};

  console.log('Calling firstSession.decideWithContext with a 3000 millisecond timeout');
  const response = await firstSession.decideWithContext(
    'AmpSession', context,
    'NodeDecisionWithContext', candidates, 3000
  );

  console.log(`Returned ampToken \n ${response.ampToken} \n of length ${response.ampToken.length}`);
  console.log(`Returned decision: ${response.decision}`);
  if(response.fallback){
    console.log('Decision NOT successfully obtained from amp-agent. Using a fallback instead.');
    console.log(`The reason is: ${response.failureReason}`);
  }else{
    console.log('Decision successfully obtained from amp-agent');
  }

  console.log('Calling firstSession.observe, with default timeout');
  const observeResponse = await firstSession.observe('NodeObserveMetric',context, 0);
  console.log(`Returned ampToken \n ${observeResponse.ampToken} \n of length ${observeResponse.ampToken.length}`);
  if(!observeResponse.success){
    console.log('Observe NOT successfully sent to amp-agent.');
    console.log(`The reason is: ${observeResponse.failureReason}`);
  }else{
    console.log('Observe successfully sent to amp-agent.');
  }
};


ampSingleSessionTest('98f3c5cdb920c361', ['http://localhost:8100']);



// console.log(response);

// console.log(session.getCandidateCombinationCount({color:['red', 'green', 'blue'], count:[5, 10], coatSize:[10, 11, 12, 13, 14]}));
// console.log('for index 8',
//   session.getCandidatesAtIndex({color:['red', 'green', 'blue'], count:[5, 10], coatSize:[10, 11, 12, 13, 14]}, 8)
// );
// console.log(session.getCandidatesAtIndex({color:['red', 'green', 'blue'], count:[10, 100]}, 4));
