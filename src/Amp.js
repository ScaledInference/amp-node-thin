import Session from "./Session";

export default class Amp {
    constructor(projectKey, options) {
        this.projectKey = projectKey;

        if (!options.domain) {
            options.domain = "https://amp.ai";
        }

        if (!options.apiPath) {
            options.apiPath = "/api/ampagent/v1/" + projectKey;
        }

        this.options = options;
    }

    session(options) {
        options.amp = this;
        return Session(this, options);
    }

    description() {
        return "<Amp projectKey: `${projectKey}`>";
    }
}