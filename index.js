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
const generator = require('./open_ai.js');

let max_customers = 20;
var customers = {};

for (let i = 0; i < max_customers + 1; i++) {
    DMS.sendMessage({ "type": "customer_end_session", "customer_id": i }, function () {

    });
}

const initialilize_customers = async function () {
    for (i = 1; i < max_customers + 1; i++) {
        let base_personality = i % 2;
        let generated_customer = new Customer(i, "change mailing address", base_personality);
        console.log("generated_customer", generated_customer);
        await generated_customer.init(function () {
            console.log("random_customer", generated_customer);
            customers[generated_customer.id] = generated_customer;
            customers[generated_customer.id].state = "escalating";

            DMS.sendMessage({ "type": "customer_end_session", "customer_id": generated_customer.id }, function () {
                sendMessageToDMS(generated_customer, "escalate");
            });

        });

    }
}


initialilize_customers(function () {
    console.log(customers);
});

function reset_customer(customer, new_customer = false) {
    DMS.sendMessage({ "type": "customer_end_session", "customer_id": customer.id, }, function () {
        customers[customer.id].state = "escalating";
        customers[customer.id].transcript = "";
        sendMessageToDMS(customers[customer.id], "escalate");
    });

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
    try {

        let customer = customers[message.customer_id]; //Get the customer_id from the message received
        if (!customer) {
            return;
        }
        //console.log("customer state", customer.state);
        //console.log("message.text includes", message.text.includes("Thank you. What billing question can we help you with"));


        if (message.type == "text" && message.text.includes("has left the conversation. If you")) {
            customers[message.customer_id].state = "resolved";
            reset_customer(customer);
        }


        if (customer.state === "connected" && message.author != "bot") {
            customers[message.customer_id].appendMessageToTranscript(message.text, "agent");
            DMS.sendTypingIndicator(message.customer_id);
            const CUSTOMER_response = generator.getCustomerResponse(customers[message.customer_id]);
            CUSTOMER_response.then((response) => {
                console.log("response", response);
                const endchat = response.includes("ENDCHAT");
                response.replace("ENDCHAT", "");
                DMS.sendTextMessage(
                    customer.id, //
                    customer.last_msg_id, //Unique id of the message
                    response,
                    customer.bio.name,
                    function (res) {
                        customers[message.customer_id].last_msg_id++;
                        customers[message.customer_id].appendMessageToTranscript(response, "customer");
                        if (endchat) {
                            customers[message.customer_id].state = "resolved";
                            reset_customer(customers[message.customer_id]);

                        }
                    }
                );
            });
        }


        if (message.type == "menu" && message.title.trim() === "What do you need help with?") {
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
        }

        if (message.type == "text") {
            if (message.text.includes("Thank you. What billing question can we help you with")) {
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
            }

            if (message.text.includes("You have been connected")) {
                customers[message.customer_id].state = "connected";
            }



        }

    } catch (err) {
        console.log(err);
    }
}


// app.get('/reset', (req, res) => {
//     for (var i = 1; i < 11; i++) {
//         reset_customer(i);
//     }
//     res.status(200).send("success!");
// });

//Crystal Claw Incorporated
// {
//  "type": "typing_indicator",
//  "customer_id": "string", }
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
    customers[customer_id].state = "resolved";
    try {
        //reset_customer(customers[customer_id]);
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