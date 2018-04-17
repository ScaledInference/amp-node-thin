const expect = require('expect.js');

const Amp = require('../Amp');

describe('Amp', function(){

  const amp = new Amp( {key: 'ac646ba1c1398b12', userId: 'ThinNodeTest', domain: 'https://dev.amp.ai', sessionTTL: 5000} );
  const session = new amp.Session();

  it('should be able to serialize/deserialize a session', function() {
    const serializedSession = session.serialize();
    const newSession = new amp.Session(serializedSession);

    expect(session.id).to.equal(newSession.id);
  });
});