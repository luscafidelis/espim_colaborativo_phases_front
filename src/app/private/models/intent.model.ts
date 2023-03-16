export class Intent {
    public name: String;
    public response: {
        text: String,
        type: String
    };

    constructor(intent: any = {}) {
        this.name = intent.name;
        this.response = intent.response;
    }

}