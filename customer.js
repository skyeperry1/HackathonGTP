//customer.js
const Bio = require("./bio.js");
const generator = require('./open_ai.js');
const PersonalityTraits = require('./personality_traits.js');




module.exports = class customer {

    constructor(id, tasks, personality_category = 1) {
        this.id = id;
        this.state = "initializing"
        this.last_msg_id = 1;
        this.transcript = ""
        this.tasks = tasks;
        this.personality_traits = PersonalityTraits.getRandom(personality_category);
    }
    id;
    last_msg_id;
    state;
    transcript;
    tasks;
    personality_traits;
    bio;


    init(callback) {
        const response = generator.generateCustomerBio(this.personality_traits);
        response.then((generated_bio) => {
            this.bio = new Bio(generated_bio);
            // do something async and call the callback:
            callback.bind(this)();
        });
    }

    appendMessageToTranscript(text, participant = "customer") {
        if (participant != "customer") {
            this.transcript += "CSR:" + text + "\nCustomer:";
        } else {
            this.transcript += text + "\n";
        }
    }




}

