const request = require("request");
const Utils = require("./Utils");
const Version = require("./Version");

export class Session {
    constructor(options) {
        this.amp = amp;
        this.options = options;
        this.index = 1;
        this.timeout = options.timeout || 1000;

        this.userId = options.userId || amp.options.userId || Utils.randomString(5);
        this.sessionId = Utils.randomString();
    }

    observe(name, properties, options, cb) {
        let url = this.options.domain + this.options.apiPath + "/observe";
        let body = {
            name, 
            properties, 
            userId: this.userId,
            sessionId: this.sessionId,
            index: this.index,
            client: { "Node":Version }
        };

        request({
            url: url,
            timeout: options.timeout || this.timeout,
            method: options.method || "POST",
            body: body,
            json: true
        }, function(err, response) {
            cb(err, response);
        });
    }

    decide(name, candidates, options, cb) {
        let url = this.options.domain + this.options.apiPath + "/decide";
        let body = {
            name, 
            decision: candidates,
            userId: this.userId,
            sessionId: this.sessionId,
            index: this.index,
            client: { "Node":Version }
        };

        request({
            url: url,
            timeout: options.timeout || this.timeout,
            method: options.method || "POST",
            body: body,
            json: true
        }, function(err, decision, response) {
            cb(err, decision, response);
        });
    }

    description() {
        return "<Session projectKey: `${this.amp.projectKey} sessionId: `${this.sessionId} userId: `${this.userId}`>";
    }
}