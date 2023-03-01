/*****************************
 * Express.js setup 
 ****************************/
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
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


async function callOpenAI(customer) {
    console.log("callOpenAI");
    let new_prompt = generatePromptText(customer);
    console.log("prompt", new_prompt);
    try {
        const gptResponse = await openai.complete({
            engine: "text-davinci-003",
            prompt: new_prompt,
            temperature: 0.7,
            maxTokens: 2000,
            topP: 1,
            presencePenalty: 0.23,
            frequencyPenalty: 0.49
        });
        let open_ai_response = gptResponse.data.choices[0].text;
        console.log("open_ai_response", open_ai_response);
        // const open_ai_json_response = JSON.parse(open_ai_response);
        // console.log("callOpenAI response", open_ai_json_response);
        return open_ai_response;
    } catch {
        return 0;
    }
}

// "Hi there, I had a Billing"
// CSR:

function generatePromptText(customer) {
    let prompt_fixed = "The following is a conversation between an AI customer persona, called Customer, and a human user,\ncalled CSR.\nIn the following interactions, CSR and Customer will converse in natural language, and Customer will assume the persona of a customer of a major insurance company who has contacted the CSR through a chat widget. Customer should ask questions that align with common customer serrvice inquries that are relevant to the insurance industry. Customer should have a few customer-service specific tasks that it is trying to complete (e.g. getting a quote, filing a claim, chaning account information).\n\nThe conversation begins:\n";
    let transcript = customer.transcript;
    return prompt_fixed + transcript;
}


function generateTranscriptEntry(text, participant = "customer") {
    if (participant == "agent") {
        return "CSR:" + text + "\n";
    } else {
        return "Customer:" + text + "\n";
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
        console.log(err);
        return res.status(401).send(err);
    }
});


// const initiate_escalation_msgs = {
//     "queues": ["Billing"]
// }


var customers = {}

let customer1 = {
    "id": "1",
    "state": "idle",
    "name": "Skye Perry",
    "last_msg_id": 1,
    "conv_transcript": ""

}

customers[customer1.id] = customer1;

DMS.sendTextMessage(
    customers["1"].id, //
    customers["1"].last_msg_id, //Unique id of the message
    "escalate",
    customers["1"].name,
    function (response) {
        customers["1"].state = "queue_select";
        customers["1"].last_msg_id++;
    }
);



function handle_customer(message) {
    console.log("handle customer");
    let customer = customers[message.customer_id]; //Get the customer_id from the message received
    if (customer.state == "queue_select") {
        DMS.sendTextMessage(
            customer.id, //
            customer.last_msg_id + 1, //Unique id of the message
            "Billing",
            customer.name,
            function (response) {
                //Return status from DMS
                //return res.status(response.status).send(response.statusText);
                customers[message.customer_id].last_msg_id++;
                customers[message.customer_id].state = "pre_chat_q";
            }
        );
    } else if (customer.state == "pre_chat_q") {
        DMS.sendTextMessage(
            customer.id, //
            customer.last_msg_id + 1, //Unique id of the message
            "I had a question about my recent bill",
            customer.name,
            function (response) {
                //Return status from DMS
                //return res.status(response.status).send(response.statusText);
                customers[message.customer_id].last_msg_id++;
                customers[message.customer_id].state = "in_queue";
                customers[message.customer_id].transcript += generateTranscriptEntry("I had a question about my recent bill");
            }
        );
    } else if (customer.state == "in_queue" & message.text.includes("You have been connected")) {
        // DMS.sendTextMessage(
        //     customer.id, //
        //     customer.last_msg_id + 1, //Unique id of the message
        //     "I had a question about my account",
        //     customer.name,
        //     function (response) {
        //         //Return status from DMS
        //         //return res.status(response.status).send(response.statusText);
        //         customers[message.customer_id].last_msg_id++;
        //         customers[message.customer_id].state = "connected";
        //     }
        // );
        customers[message.customer_id].last_msg_id++;
        customers[message.customer_id].state = "connected";
    } else if (customer.state == "connected") {
        customers[message.customer_id].transcript += generateTranscriptEntry(message.text, "agent");
        const CUSTOMER_response = callOpenAI(customers[message.customer_id]);
        CUSTOMER_response.then((response) => {
            DMS.sendTextMessage(
                customer.id, //
                customer.last_msg_id + 1, //Unique id of the message
                response,
                customer.name,
                function (res) {
                    customers[message.customer_id].last_msg_id++;
                    customers[message.customer_id].transcript += generateTranscriptEntry(response, "customer");
                }
            );
        });
    }

}

/***************************************************************************
 * Digital Messaging onTextMessage callback
 * @param {object} message message object recieved from the Digital Messaging Channel
 * This function is called when a text message is recieved from the Digital Messaging channel
 **************************************************************************/
//  {
// 	"type": "text",
// 	"customer_id": "string",
// 	"message_id": "string",
// 	"csr_name": "string",
// 	"text": ["string"],
// 	"attachments": [{
// 		"url": "string",
// 		"content_type": "string",
// 		"file_name": "string",
// 		"size": numeric
// 	}]
// }
DMS.onTextMessage = async (message) => {

    try {
        //let customer_id = message.customer_id; //Get the customer_id from the message received
        handle_customer(message);
    }
    catch (err) {
        //handle error
    }
}


// //Menu Message object
// {
//     "type": "menu",
//     "customer_id": "string",
//     "message_id": "string",
//     "csr_name": "string",
//     "title": "string",
//     "items": [
//       {
//         "text": "string",
//         "payload": "string",
//         "image_url": "string"
//       }
//     ]
//   }
DMS.onMenuMessage = async (message) => {
    try {
        //let customer_id = message.customer_id; //Get the customer_id from the message received
        handle_customer(message);
    }
    catch (err) {
        //handle error
    }
};

/***************************************************************************
 * Handle Signal interuption gracefully
 * This terminates the process on Ctrl + C input when running the application locally through terminal
 **************************************************************************/
process.on("SIGINT", function () {
    process.exit();
});


app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
// module.exports = app;