const Amp = require('../Amp');

console.log('This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and valid amp agent url.');// eslint-disable-line no-console

const projectKey = process.argv[2]; //eslint-disable-line
const ampAgents = process.argv.slice(3); //eslint-disable-line


const ampSingleSessionTest = async (key, agents) => {
  const amp = new Amp(key, agents);

  const firstSession = new amp.Session();
  const context = { browser_height: 1740, browser_width : 360 };
  const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};

  console.log('Calling firstSession.decideWithContext with a 3000 millisecond timeout');// eslint-disable-line no-console
  const response = await firstSession.decideWithContext(
    'AmpSession', context,
    'NodeDecisionWithContext', candidates, 3000
  );

  console.log(`Returned ampToken \n ${response.ampToken} \n of length ${response.ampToken.length}`);// eslint-disable-line no-console
  console.log(`Returned decision: ${response.decision}`);// eslint-disable-line no-console
  if(response.fallback){
    console.log('Decision NOT successfully obtained from amp-agent. Using a fallback instead.');// eslint-disable-line no-console
    console.log(`The reason is: ${response.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Decision successfully obtained from amp-agent');// eslint-disable-line no-console
  }

  console.log('Calling firstSession.observe, with default timeout');// eslint-disable-line no-console
  const observeResponse = await firstSession.observe('NodeObserveMetric',context);
  console.log(`Returned ampToken \n ${observeResponse.ampToken} \n of length ${observeResponse.ampToken.length}`);// eslint-disable-line no-console
  if(!observeResponse.success){
    console.log('Observe NOT successfully sent to amp-agent.');// eslint-disable-line no-console
    console.log(`The reason is: ${observeResponse.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Observe successfully sent to amp-agent.');// eslint-disable-line no-console
  }

};


ampSingleSessionTest(projectKey, ampAgents);

