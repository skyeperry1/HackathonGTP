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
    console.log("/dms*************");
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
    "initialize",
    customers["1"].name,
    function (response) {
        console.log("response");
        customers["1"].state = "queue_select";
        customers["1"].last_msg_id++;
        console.log("response_end");
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
            "I had a question about my account",
            customer.name,
            function (response) {
                //Return status from DMS
                //return res.status(response.status).send(response.statusText);
                customers[message.customer_id].last_msg_id++;
                customers[message.customer_id].state = "in_queue";
            }
        );
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

    // try {
    //     //let customer_id = message.customer_id; //Get the customer_id from the message received
    //     handle_customer(message);
    // }
    // catch (err) {
    //     //handle error
    // }
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
    // try {
    //     //let customer_id = message.customer_id; //Get the customer_id from the message received
    //     handle_customer(message);
    // }
    // catch (err) {
    //     //handle error
    // }
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