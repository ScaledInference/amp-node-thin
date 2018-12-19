const Amp = require('../Amp');

console.log('This will demonstrate how to use the node thin client to communicate with amp agent. Make sure you pass in a valid project key and valid amp agent url.'); // eslint-disable-line no-console

const ampMultipleSessionTest = async (key, agents) => {
  const amp = new Amp(key, agents, 10000, 15*60);
  const { Session } = amp;

  // Creating First Session of amp
  const session1 = new Session({ timeOutMilliseconds: 1000, sessionLifeTimeSeconds: 60*1000});
  let context = { browser_height: 1740, browser_width : 360 };
  const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};

  console.log('Calling session1.decideWithContext');// eslint-disable-line no-console
  let response = await session1.decideWithContext(
    'AmpSession', context,
    'NodeDecisionWithContext', candidates
  );

  console.log(`Returned ampToken \n ${response.ampToken} \n of length ${response.ampToken.length}`);// eslint-disable-line no-console
  console.log(`Returned decision: ${response.decision}`);// eslint-disable-line no-console
  if(response.fallback){
    console.log('Decision NOT successfully obtained from amp-agent. Using a fallback instead.');// eslint-disable-line no-console
    console.log(`The reason is: ${response.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Decision successfully obtained from amp-agent');// eslint-disable-line no-console
  }

  context = { url: 'google.com', pageNumber: 1 };
  console.log('Calling session1.observe, with default timeout');// eslint-disable-line no-console
  let observeResponse = await session1.observe('NodeObserveMetric',context);
  console.log(`Returned ampToken \n ${observeResponse.ampToken} \n of length ${observeResponse.ampToken.length}`);// eslint-disable-line no-console
  if(!observeResponse.success){
    console.log('Observe NOT successfully sent to amp-agent.');// eslint-disable-line no-console
    console.log(`The reason is: ${observeResponse.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Observe successfully sent to amp-agent.');// eslint-disable-line no-console
  }


  // Creating second session of amp
  const session2 = new Session({timeOutMilliseconds: 1});
  context = { browser_height: 1000, browser_width : 480 };
  console.log('Calling session2.decideWithContext with 1 millisecond timeout');// eslint-disable-line no-console
  response = await session2.decideWithContext(
    'AmpSession', context,
    'NodeDecisionWithContext', candidates
  );
  console.log(`Returned ampToken \n ${response.ampToken} \n of length ${response.ampToken.length}`);// eslint-disable-line no-console
  console.log(`Returned decision: ${response.decision}`);// eslint-disable-line no-console
  if(response.fallback){
    console.log('Decision NOT successfully obtained from amp-agent. Using a fallback instead.');// eslint-disable-line no-console
    console.log(`The reason is: ${response.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Decision successfully obtained from amp-agent');// eslint-disable-line no-console
  }

  console.log('Calling session2.observe with default timeout');// eslint-disable-line no-console
  context = { url: 'google.com', pageNumber: 1 };
  observeResponse = await session2.observe('NodeObserveMetric',context);
  console.log(`Returned ampToken \n ${observeResponse.ampToken} \n of length ${observeResponse.ampToken.length}`);// eslint-disable-line no-console
  if(!observeResponse.success){
    console.log('Observe NOT successfully sent to amp-agent.');// eslint-disable-line no-console
    console.log(`The reason is: ${observeResponse.failureReason}`);// eslint-disable-line no-console
  }else{
    console.log('Observe successfully sent to amp-agent.');// eslint-disable-line no-console
  }
};

ampMultipleSessionTest('98f3c5cdb920c361', ['http://localhost:8100']);
