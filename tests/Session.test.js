const expect = require('expect.js');

const Amp = require('../Amp');

describe('Session', function(){

  const amp = new Amp( {key: 'ac646ba1c1398b12', userId: 'ThinNodeTest', domain: 'https://dev.amp.ai', sessionTTL: 5000} );
  const session = new amp.Session();

  it('should make observe call to Amp agent', function(done) {
    session.observe('ObserveTest', {tao:'awesome'}, function(error, response, body) {
      if (error) {
        expect().fail();
        done();
      }

      expect(body).to.eql({});
      done();
    });
  });

  it('should use default decision if call times out', function(done) {
    session.decide('DecideTimeoutTest', {'tao':['awesome', 'ok', 'worthless']}, {timeout: 1}, function(error, decision) {
      expect(decision.tao).to.equal('awesome');
      done();
    });
  });

  it('should return error and default decision immediately if flattened candidates sent in decide are greater than 50', function(done) {
    this.timeout(3000);

    const candidates = [];

    for (let i = 0; i < 51; i++) {
      candidates.push({a: i, b: i, c: i});
    }

    session.decide('MaxedCandidates', candidates, function(error, decision) {
      if (error) {
        expect(error.message).to.eql('Candidate length must be less than or equal to 50.');
        expect(decision).to.eql({a:0, b: 0, c: 0});
      } else {
        expect().fail();
      }
      done();
    });
  });

  it('should return error and default decision immediately in callback if array value candidates sent in decide are greater than 50', function(done) {
    const candidates = {};
    const keys = ['a', 'b', 'c'];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const value = [];
      for (let j = 0; j < 51; j++) {
        value[j] = j;
      }

      candidates[key] = value;
    }

    session.decide('MaxedCandidates', candidates, function(error, decision) {
      if (error) {
        expect(error.message).to.eql('Candidate length must be less than or equal to 50.');
        expect(decision).to.eql({a:0, b: 0, c: 0});
      } else {
        expect().fail();
      }
      done();
    });
  });

  it('should support sync decision making that returns default decision if candidates over 50', function() {
    this.timeout(3000);

    const candidates = {};
    const keys = ['a', 'b', 'c'];

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];

      const value = [];
      for (let j = 0; j < 51; j++) {
        value[j] = j;
      }

      candidates[key] = value;
    }

    const decision = session.decide('SyncMaxedCandidates', candidates);
    expect(decision).to.eql({a:0, b: 0, c: 0});
  });

  it('should support sync decision making that returns default decision if candidates under 50', function() {
    const decision = session.decide('SyncDecide', {first: ['a', 'b', 'c'], second: ['d', 'e', 'f']});
    expect(decision).to.eql({first: 'a', second: 'd'});
  });

  it('should single object in decsion callback or synchronously', function(done) {
    session.decide('DecideTimeoutTest', {'tao':['awesome', 'ok', 'worthless']}, function(error, decision) {
      if (error) {
        expect().fail();
      }

      expect(decision.tao).to.equal('awesome');
      done();
    });
  });

  it('should ignore limit option and always set to 1', function(done) {
    const decision = session.decide('SyncDecide', {first: ['a', 'b', 'c'], second: ['d', 'e', 'f']}, {limit: 2}, function(error, decision) {
      expect(decision).to.eql({first: 'a', second: 'd'});
      done();
    });

    expect(decision).to.eql({first: 'a', second: 'd'});
  });

  it('should allow setting userId', function() {
    amp.session = new amp.Session({userId: 'Yanpu'});

    expect(amp.session.userId).to.equal('Yanpu');
  });

  describe('Conditional decisions', function() {
    it('should return default candidates for each context if > 50', function(done) {
      this.timeout(3000);

      const candidates = {};
      const keys = ['a', 'b', 'c'];

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];

        const value = [];
        for (let j = 0; j < 51; j++) {
          value[j] = j;
        }

        candidates[key] = value;
      }
      
      session.decideCond('SyncDecide', candidates, 'Locale', {'American': {showModal: true}, 'European': {showModal: false}}, function(error, decision) {
        expect(decision).to.eql({'American': {a:0, b:0, c:0}, 'European': {a:0, b:0, c:0}});
        
        done();
      });
    });

    it('should return ranked candidates for each context', function(done) {
      session.decideCond('SyncDecide', {first: ['a', 'b', 'c'], second: ['d', 'e', 'f']}, 'Locale', {'American': {showModal: true}, 'European': {showModal: false}}, function(error, decision) {
        expect(decision).to.eql({'American': {first:'a', second: 'd'}, 'European': {first:'a', second: 'd'}});
        
        done();
      });
    });
  });
});
