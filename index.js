/*****************************
 * Express.js setup 
 ****************************/
const express = require("express");
const app = express();
//to force JSON parser middleware
app.use(express.json());

/*****************************
 * Digitial Messaging client channel API setup
 ****************************/
const dms = require("dms-client-channel");
const DMS_CONFIG = require('./dms_config.json');
// Initialize Digital Messaging framework
var DMS = dms(DMS_CONFIG);
//Enable request logging in DMS
DMS.logRequests(true);

/*****************************
 * Open AI
 ****************************/
const OpenAI = require('openai-api');
const OPENAI_API_KEY = "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";
const openai = new OpenAI(OPENAI_API_KEY);


async function callOpenAI(prompt, customer_id) {
    try {
        const gptResponse = await openai.complete({
            engine: "text-davinci-003",
            prompt: prompt,
            temperature: 0,
            maxTokens: 2000,
            topP: 1,
            presencePenalty: 0,
            frequencyPenalty: 0
        });
        let open_ai_response = gptResponse.data.choices[0].text;
        const open_ai_json_response = JSON.parse(open_ai_response);
        console.log("callOpenAI response", open_ai_json_response);
        return obj;
    } catch {
        return 0;
    }
}

/***************************************************************************
 * DIGITAL MESSAGING ENDPOINT
 **************************************************************************/
app.post('/dms', async (req, res) => {
    try {
        //call the DMS on request method everytime a request is recieved and pass in the request 
        DMS.onRequest(req, async (status, message) => {
            res.status(status).send(message);
        });

    } catch (err) {
        return res.status(401).send(err);
    }
});


const initiate_escalation_msgs = {
    "queues": ["Billing"]
}


DMS.sendTextMessage(
    "123", //
    "123", //Unique id of the message
    "Billing",
    "Skye Perry",
    function (response) {
        //Return status from DMS
        //return res.status(response.status).send(response.statusText);
    }
);

setTimeout(() => {
    DMS.sendTextMessage(
        "123", //
        "1234", //Unique id of the message
        "Billing",
        "Skye Perry",
        function (response) {
            //Return status from DMS
            //return res.status(response.status).send(response.statusText);
        }
    );
}, "5000")

setTimeout(() => {
    DMS.sendTextMessage(
        "123", //
        "1234", //Unique id of the message
        "a question about billing",
        "Skye Perry",
        function (response) {
            //Return status from DMS
            //return res.status(response.status).send(response.statusText);
        }
    );
}, "10000")


/***************************************************************************
 * Digital Messaging onTextMessage callback
 * @param {object} message message object recieved from the Digital Messaging Channel
 * This function is called when a text message is recieved from the Digital Messaging channel
 **************************************************************************/
DMS.onTextMessage = async (message) => {
    try {
        let customer_id = message.customer_id; //Get the customer_id from the message received
    }
    catch (err) {
        //handle error
    }
}

/***************************************************************************
 * Handle Signal interuption gracefully
 * This terminates the process on Ctrl + C input when running the application locally through terminal
 **************************************************************************/
process.on("SIGINT", function () {
    process.exit();
});

module.exports = app;