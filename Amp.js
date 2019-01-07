const Session = require('./Session');
const Utils = require('./Utils');

const utils = new Utils();
/**
 *
 * Amp
 * Constructs Amp instance with passed configuration.
 * @constructor
 * @param  {string} key - project key
 * @param  {Array} ampAgents - list of ampAgents
 * @param  {int} timeOutMilliseconds - request timeOut in milliSeconds default 10 seconds
 * @param  {int} sessionLifeTimeSeconds - session life time in Seconds default 30 minutes
 * @param  {boolean} dontUseTokens - flag to indicate either generate amptoken automatically or use the custom token.
 *
 */
module.exports  = class Amp {

  constructor(key, ampAgents = [], timeOutMilliseconds = 100000 /* default 10 seconds*/, sessionLifeTimeSeconds = 1800 /* default 30 minutes */, dontUseTokens = false ){
    this.apiPath = 'api/core/v2';
    if( utils.isEmpty(key)){
      throw new Error('key can\'t be empty');
    }
    this.key = key;

    if(timeOutMilliseconds < 0){
      throw new Error('timeOut must be non-negative');
    }else if(timeOutMilliseconds === 0 ){
      this.timeOut = timeOutMilliseconds;
    }
    this.timeOut = timeOutMilliseconds;

    if(sessionLifeTimeSeconds < 0){
      throw new Error('sessionLifeTime must be non-negative');
    }else if (sessionLifeTimeSeconds === 0){
      this.sessionLifeTime = 1800000; // 30 MINUTES
    }
    this.sessionLifeTime = 1000 * sessionLifeTimeSeconds;

    if(ampAgents.length === 0){
      throw new Error('ampAgents can\'t be empty');
    }
    this.ampAgents =  ampAgents;

    const self = this;
    this.Session = function(sessionOptions={}){
      const opts = Object.assign({}, sessionOptions);
      opts.amp = self;
      opts.userId =  sessionOptions.userId || utils.generateRandomAlphaNumericString();
      opts.sessionId = sessionOptions.sessionId || utils.generateRandomAlphaNumericString();
      opts.ampToken =  self.dontUseTokens
        ? self.customToken
        : !sessionOptions.ampToken
          ? ''
          : sessionOptions.ampToken;
      opts.timeOutMilliseconds = sessionOptions.timeOutMilliseconds || self.timeOut;
      opts.sessionLifeTimeSeconds = sessionOptions.sessionLifeTimeSeconds
        ? 1000 * sessionOptions.sessionLifeTimeSeconds
        : self.sessionLifeTime;
      return new Session(opts);
    };

    this.customToken = 'CUSTOM';
    this.dontUseTokens = dontUseTokens;
  }

  getDecideWithContextUrl(userId){
    return `${this.selectAmpAgent(userId)}/${this.apiPath}/${this.key}/decideWithContextV2`;
  }

  getDecideUrl(userId){
    return `${this.selectAmpAgent(userId)}/${this.apiPath}/${this.key}/decideV2`;
  }

  getObserveUrl(userId){
    return `${this.selectAmpAgent(userId)}/${this.apiPath}/${this.key}/observeV2`;
  }

  selectAmpAgent(userId){
    return this.ampAgents[Math.abs(utils.hashCode(userId) % this.ampAgents.length)];
  }

};

