const expect = require('expect.js');
const Amp = require('../Amp');

describe('Session Test Suite', function(){
  const amp = new Amp('98f3c5cdb920c361',['http://localhost:8100']);
  const session = new amp.Session();
  const session2 = new amp.Session({timeOutMilliseconds: 1});
  const context = { browser_height: 1740, browser_width : 360 };
  const candidates = {color:['red', 'green', 'blue'], count:[10, 100]};

  it('should make decideWithContext call to Amp Agent', function(done){

    session.decideWithContext('AmpSession', context, 'NodeDecisionWithContextTest', candidates, 3000)
      .then(response => {
        expect(response.ampToken).to.not.empty();
        expect(response.fallback).to.be(false);
        expect(response.decision).to.equal('{"color":"red","count":10}');
        done();
      })
      .catch(error => { // eslint-disable-line no-unused-vars
        expect().fail();
        done();
      });
  });

  it('should return failureReason error with default decision for in correct ampagent url', function(done){
    const incorrectAmpAgent =  new Amp('98f3c5cdb920c361',['http://localhost:8080']);
    const ses = new incorrectAmpAgent.Session();
    ses.decideWithContext('AmpSession', context, 'NodeDecisionWithContextTest', candidates, 3000)
      .then(response => {
        expect(response.fallback).to.be(true);
        expect(response.failureReason).to.not.empty();
        expect(response.ampToken).to.equal('');
        expect(response.decision).to.eql({ count: 10, color: 'red' });
        done();
      })
      .catch( error => { // eslint-disable-line no-unused-vars
        expect().fail();
        done();
      });
  });

  it('should return failureReason error with default decision if timeout is pretty small such as 1 millisecond', function(done){
    session2.decideWithContext('AmpSession', context, 'NodeDecisionWithContextTest', candidates)
      .then(response => {
        expect(response.fallback).to.be(true);
        expect(response.failureReason).to.not.empty();
        expect(response.ampToken).to.equal('');
        expect(response.decision).to.eql({ count: 10, color: 'red' });
        done();
      })
      .catch(error => { // eslint-disable-line no-unused-vars
        expect().fail();
        done();
      });
  });

  it('should return error for candidates count more than 50', function(done){
    const cands = {color:['red', 'green', 'blue'], count:[10, 20, 30, 40, 50], coatSize:['XS', 'S', 'M', 'L', 'XL']};
    session.decideWithContext('AmpSession', context, 'NodeDecisionWithContextTest', cands, 3000)
      .then(response => {
        expect(response.fallback).to.be(true);
        expect(response.failureReason).to.eql('Cant have more than 50 candidates');
        expect(response.decision).to.eql({ count: 10, color: 'red', coatSize: 'XS' });
        done();
      })
      .catch(error => { // eslint-disable-line no-unused-vars
        expect().fail();
        done();
      });
  });
});
