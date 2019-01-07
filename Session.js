const axios = require('axios');
const Utils = require('./Utils');
const utils = new Utils();

/**
 *
 * Session
 * Constructs the session object for the Amp instance.
 *
 * @constructor
 * @param {Object} options
 *
 * Options:
 * amp - amp instance
 * userId - id to identify the user. If id is not passed, a random userId will be auto generated.
 * sessionId - id to identify the session. If sessionId is not passed, a random sessionId will be auto generated.
 * timeOutMilliseconds - request timeOut in milliSeconds will override the default 10 seconds from amp instance.
 * sessionLifeTimeSeconds - session life time in Seconds will override the default 30 minutes from amp instance.
 *
 */

module.exports = class SessionV2 {

  constructor(options) {
    this.amp = options.amp;
    if(utils.isEmpty(this.amp))
      throw new Error('Please pass valid amp instance.');
    this.userId = options.userId || utils.generateRandomAlphaNumericString();
    this.sessionId = options.sessionId || utils.generateRandomAlphaNumericString();
    this.ampToken = options.ampToken;
    this.timeOut = options.timeOutMilliseconds || this.amp.timeOut;
    this.sessionLifeTime = options.sessionLifeTimeSeconds || this.amp.sessionLifeTime;
    this.index = 1;
  }

  /**
   * decideWithContext
   * Decision to determine action for the provided context name and properties
   *
   * @param {string} contextName - name of the context
   * @param {object} context - properties to observe
   * @param {string} decisionName - name of the event
   * @param {object} candidates - variations to choose from
   * @param {int} timeout - request timeout in milliseconds will override the value from session or amp
   *
   * @return {Promise<decideResponse>} decideResponse promise object is returned.
   * decisionResponse object
   * decision - decision outcome
   * fallback - true means server errored out, so that a default decision is returned.
   *          - false means a valid decision is returned.
   * ampToken - valid token is returned in case of success amp call otherwise custom or empty token is returned.
   * failureReason -  will capture the server error message if any.
   *
   */
  decideWithContext(contextName, context={},
    decisionName, candidates,
    timeout) {

    if(utils.isEmpty(contextName)) {
      throw new Error('Context name cannot be empty');
    }
    if(utils.isEmpty(decisionName)){
      throw new Error('Decision name cannot be empty');
    }
    if(!utils.isObject(candidates)){
      throw new Error('Candidates strictly has to be object of key being string and value being Array');
    }
    if( this._getCandidateCombinationCount(candidates) > 50) {
      throw new Error('Can\'t have more than 50 candidates');
    }

    if(utils.isEmpty(timeout) || timeout <= 0){
      timeout = this.timeOut;
    }

    const specificFields = {
      decisionName,
      name: contextName,
      properties: context,
      decision:{
        candidates:[candidates],
        limit:1
      }
    };
    const reqJSON = JSON.stringify(Object.assign(this._getBaseFields(), specificFields));
    return this._asDecideResponse(
      this.amp.getDecideWithContextUrl(this.userId),
      reqJSON, () => this._getCandidatesAtIndex(candidates,0), timeout
    );
  }

  /**
   *
   * @param {string} contextName - name of the context
   * @param {object} context - properties to observe
   * @param {int} timeout - request timeout in milliseconds will override the value from session or amp
   * @return {Promise<observeResponse>}
   * observeResponse object
   * success - false means server errored out.
   *         - true means server accepted the observe outcome event.
   * ampToken - valid token is returned in case of success amp call otherwise custom or empty token is returned.
   * failureReason -  will capture the server error message if any.
   */
  observe(contextName, context, timeout) {
    if(utils.isEmpty(contextName)){
      throw new Error('Context name cannot be empty');
    }
    if(utils.isEmpty(timeout)){
      timeout = this.timeOut;
    }
    const specificFields = {
      name: contextName,
      properties: context
    };
    const reqJSON = JSON.stringify(Object.assign(this._getBaseFields(), specificFields));
    return this._asObserveResponse(this.amp.getObserveUrl(this.userId), reqJSON, timeout);
  }

  /**
   * decide
   * Decision to determine action to take
   *
   * @param {string} decisionName - name of the event
   * @param {object} candidates - variations to choose from
   * @param {int} timeout - request timeout in milliseconds will override the value from session or amp
   *
   * @return {Promise<decideResponse>} decideResponse promise object is returned.
   * decisionResponse object
   * decision - decision outcome
   * fallback - true means server errored out, so that a default decision is returned.
   *          - false means a valid decision is returned.
   * ampToken - valid token is returned in case of success amp call otherwise custom or empty token is returned.
   * failureReason -  will capture the server error message if any.
   */
  decide(decisionName, candidates, timeout) {
    if(utils.isEmpty(decisionName)){
      throw new Error('Decision name cannot be empty');
    }
    if(!utils.isObject(candidates)){
      throw new Error('Candidates strictly has to be object of key being string and value being Array');
    }
    if( this._getCandidateCombinationCount(candidates) > 50) {
      throw new Error('Can\'t have more than 50 candidates');
    }

    if(utils.isEmpty(timeout) || timeout <= 0){
      timeout = this.timeOut;
    }
    const specificFields =  {
      decisionName,
      decision:{
        candidates:[candidates],
        limit:1
      }
    };
    const reqJSON = JSON.stringify(Object.assign(this._getBaseFields(), specificFields));
    return this._asDecideResponse(
      this.amp.getDecideUrl(this.userId),
      reqJSON, () => this._getCandidatesAtIndex(candidates,0), timeout
    );
  }

  async _asDecideResponse(url, reqJson, decisionFn, timeout){
    const decideResponse = {
      decision: decisionFn(),
      fallback: true,
      ampToken: this.ampToken
    };
    try {
      const response = await axios.post(url, reqJson, {timeout});
      if(response.status === 200) {
        const { decision, ampToken, fallback, failureReason } = response.data;
        this.ampToken = this.amp.dontUseTokens
          ? this.amp.customToken
          : ampToken;
        decideResponse.ampToken = this.ampToken;
        if(fallback && !utils.isEmpty(failureReason)){
          decideResponse.fallback = true;
          decideResponse.failureReason = `amp-agent error: ${failureReason}`;
        }else if(!fallback && !utils.isEmpty(decision)){
          decideResponse.decision = decision;
          decideResponse.fallback = false;
        }
      }else {
        decideResponse.failureReason = `bad status code from server ${response.code} with reason: ${response.statusText}`;
      }
    }catch(error) {
      const { response } = error;
      decideResponse.failureReason = response
        ? `bad status code from server ${response.status} with reason: ${response.statusText}`
        : error.message;
    }
    return decideResponse;
  }

  async _asObserveResponse(url, reqJson, timeout){
    const observeResponse = {
      ampToken: this.ampToken,
      success:false,
      failureReason: ''
    };
    try {
      const response = await axios.post(url, reqJson, {timeout});
      if(response.status === 200){
        const { ampToken } = response.data;
        this.ampToken = this.amp.dontUseTokens
          ? this.amp.customToken
          : ampToken;
        observeResponse.ampToken = this.ampToken;
        observeResponse.success = true;
      }
    }catch(error){
      const { response } = error;
      observeResponse.failureReason = response
        ? `bad status code from server ${response.status} with reason: ${response.statusText}`
        : error.message;
    }
    return observeResponse;
  }

  _getBaseFields(){
    return {
      userId: this.userId,
      sessionId: this.sessionId,
      index: this.index++,
      ts: Date.now(),
      ampToken: this.ampToken,
      sessionLifetime: this.sessionLifeTime
    };
  }

  _getCandidatesAtIndex(candidates, index) {
    let partial = index;
    return Object.keys(candidates).sort((a,b) => a < b).reduce((results, key) => {
      const values = candidates[key];
      results[key] = values[ partial % values.length];
      partial =  Math.floor(partial / values.length);
      return results;
    }, {});
  }

  _getCandidateCombinationCount(candidates) {
    return Object.keys(candidates).reduce((count, key) => { return candidates[key].length * count; }, 1);
  }

};
