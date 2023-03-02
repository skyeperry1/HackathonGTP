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

const Customer = require("./customer.js");

/*****************************
 * Open AI
 ****************************/
const OpenAI = require('openai-api');
const OPENAI_API_KEY = "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";
const openai = new OpenAI(OPENAI_API_KEY);


let max_customers = 3;
var customers = {};

// let dan = new Customer(1, "change mailing address");
// dan.init(function () {
//     console.log("dan", dan);
// });

const initialilize_customers = async function () {
    for (i = 1; i < max_customers + 1; i++) {
        let base_personality = i % 2;
        let generated_customer = new Customer(i, "change mailing address", base_personality);
        console.log("generated_customer", generated_customer);
        await generated_customer.init(function () {
            console.log("random_customer", generated_customer);
            customers[generated_customer.id] = generated_customer;
            sendMessageToDMS(generated_customer, "escalate");
        });

    }
}


initialilize_customers(function () {
    console.log("customers:", customers);
});


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


function sendMessageToDMS(customer, message) {
    DMS.sendTextMessage(
        customer.id, //
        customer.last_msg_id, //Unique id of the message
        message,
        customer.bio.name,
        function (response) {
            //customers[id].state = "escalate";
            customers[customer.id].last_msg_id++;
        }
    );
}

function handle_customer(message) {

    let customer = customers[message.customer_id]; //Get the customer_id from the message received
    console.log("message.text", message.text);
    console.log("message.text includes", message.text.includes("Thank you. What billing question can we help you with"));

    if (customer.state == "connected") {
        customers[message.customer_id].appendMessageToTranscript(message.text, "agent");
        const CUSTOMER_response = callOpenAI(customers[message.customer_id]);
        CUSTOMER_response.then((response) => {
            const endchat = response.includes("ENDCHAT");
            response.replace("ENDCHAT", "\n");
            DMS.sendTextMessage(
                customer.id, //
                customer.last_msg_id, //Unique id of the message
                response,
                customer.bio.name,
                function (res) {
                    customers[message.customer_id].last_msg_id++;
                    customers[message.customer_id].appendMessageToTranscript(response, "customer");
                    if (endchat) {
                        DMS.sendMessage({ "type": "customer_end_session", "customer_id": message.customer_id, }, function () {
                            customers[message.customer_id].state = "resolved";
                        });

                    }
                }
            );
        });
    }
    else if (message.title.trim() == "What do you need help with?") {
        DMS.sendTextMessage(
            customer.id, //
            customer.last_msg_id, //Unique id of the message
            "Billing",
            customer.bio.name,
            function (response) {
                //Return status from DMS
                //return res.status(response.status).send(response.statusText);
                customers[message.customer_id].last_msg_id++;
                customers[message.customer_id].state = "escalating";
            }
        );
    } else if (message.text.includes("Thank you. What billing question can we help you with")) {
        DMS.sendTextMessage(
            customer.id, //
            customer.last_msg_id, //Unique id of the message
            "I need to change my address",
            customer.bio.name,
            function (response) {
                //Return status from DMS
                //return res.status(response.status).send(response.statusText);
                customers[message.customer_id].last_msg_id++;
                customers[message.customer_id].state = "escalating";
            }
        );
    } else if (message.text.includes("You have been connected with")) {
        customers[message.customer_id].state = "connected";
    }
}


// app.get('/reset', (req, res) => {
//     for (var i = 1; i < 11; i++) {
//         reset_customer(i);
//     }
//     res.status(200).send("success!");
// });


/***************************************************************************
 * Digital Messaging onTextMessage callback
 * @param {object} message message object recieved from the Digital Messaging Channel
 * This function is called when a text message is recieved from the Digital Messaging channel
 **************************************************************************/
DMS.onTextMessage = async (message) => {

    try {
        //let customer_id = message.customer_id; //Get the customer_id from the message received
        handle_customer(message);
    }
    catch (err) {
        //handle error
    }
}


DMS.onMenuMessage = async (message) => {
    try {
        //let customer_id = message.customer_id; //Get the customer_id from the message received
        handle_customer(message);
    }
    catch (err) {
        //handle error
    }
};


DMS.onCsrEndSession = async (customer_id) => {
    try {
        let customer_id = message.customer_id; //Get the customer_id from the message received
        customers[message.customer_id].state = "resolved";
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