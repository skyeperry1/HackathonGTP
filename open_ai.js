/*****************************
 * Open AI
 ****************************/
const OpenAI = require('openai-api');
const OPENAI_API_KEY = "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";
const openai = new OpenAI(OPENAI_API_KEY);


module.exports = {
    /**************************************************
    * 
    */
    generateCustomerBio: async function (personality_trait) {
        //let new_prompt = "Generate a realistic customer (e.g. not using john/jane doe) profile with the following information in valid JSON format on a single line:\nname : the persons full name\nmarital _status: current marital status\naddress: the persons full postal address (street, city, state, zip)\ndob: date of birth\ntechnological_aptitude: the persons ability to interact and complete technological tasks (e.g. open email) on a scale of 1-10\niq: the persons intelligence level\noccupation: the persons occupation\nfamily: an array of direct family members of this person {name, age, relationship}\nhobbies: any hobbies this person has\npatience_level: this persons baseline level of patience on a scale of 1-10\ncurrent_mood: the current mood of the person\nfocus_level: the persons ability to focus on a task without getting distracted on a scale of 1-10\npersonality_type: the customers personality-type\nbio: an elabortive biography for this person, embellishing  the details and filling in the gaps. The biography must be 3 paragraphs and should contain detail about current life events, personality traits and current mood. This customer should have the personality traits:" + personality_trait + "\n";
        let new_prompt = "Generate a realistic customer (e.g. not using john/jane doe) profile with the following information in valid JSON format on a single line:\nfirst_name : the persons first name\nlast_name : the persons last name\nmarital _status: current marital status\naddress: the persons full postal address in json object {street, city, state, zip}\ndob: date of birth\ntechnological_aptitude: the persons ability to interact and complete technological tasks (e.g. open email) on a scale of 1-10\niq: the persons intelligence level\noccupation: the persons occupation\nfamily: an array of direct family members of this person {name, age, relationship}\nhobbies: any hobbies this person has\npatience_level: this persons baseline level of patience on a scale of 1-10\ncurrent_mood: the current mood of the person\nfocus_level: the persons ability to focus on a task without getting distracted on a scale of 1-10\npersonality_type: the customers personality-type\nbio: an elabortive biography for this person, embellishing  the details and filling in the gaps. The biography must be 3 paragraphs and should contain detail about current life events, personality traits and current mood. \ncurrent_phone_number: The user's current 10-digit phone number. \nsocial_security_number: The fake generated social security number of the customer\nprevious_phone_number: The user's previous  10-digit phone number.\nprevious_address: The previous street address of this user  in json object {street, city, state, zip}.\nemail_address: the customer's email address, using a real email provider\ngender: The gender of the customer\nsalutation: the customer's preferred salutation\nThis customer should have the personality trait:" + personality_trait + "\n";
        try {
            const gptResponse = await openai.complete({
                engine: "text-davinci-003",
                prompt: new_prompt,
                temperature: 0.85,
                maxTokens: 1500,
                topP: 1,
                presencePenalty: 0,
                frequencyPenalty: 0
            });
            let open_ai_response = gptResponse.data.choices[0].text;
            //console.log("open_ai_response", open_ai_response);
            var open_ai_json_response;
            try {
                open_ai_json_response = JSON.parse(open_ai_response);
            } catch {
                this.generateCustomerBio();
            }

            //console.log("callOpenAI response", open_ai_json_response);
            return open_ai_json_response;
        } catch (err) {
            console.log(err)
            return 0;
        }
    },
    /**************************************************
     * 
     */
    getCustomerResponse: async function (customer) {
        console.log("callOpenAI");
        let new_prompt = generatePromptText(customer);
        console.log("prompt", new_prompt);
        try {
            const gptResponse = await openai.complete({
                engine: "text-davinci-003",
                prompt: new_prompt,
                temperature: 0.9,
                maxTokens: 200,
                topP: 1,
                presencePenalty: 0.4,
                frequencyPenalty: 0.6,
                stop: ["CSR:"]
            });
            let open_ai_response = gptResponse.data.choices[0].text;
            console.log("open_ai_response", open_ai_response);
            return open_ai_response;
        } catch (err) {
            console.log(err)
            return 0;
        }
    },


}


function generatePromptText(customer) {
    //let prompt_fixed = "In the following interactions, CSR and Customer will converse in natural language, and Customer will assume the persona of a middle aged, short-fused, Bostonain (with Boston-accent) who is a customer of a major retial bank (U+ Bank) who has contacted the CSR through a chat widget. Customer should ask questions that align with common customer serrvice inquries that are relevant to the retail banking industry. Customer should have a few customer-service specific tasks that it is trying to complete (e.g. getting a quote, filing a claim, chaning account information). If Customer perceives CSR as being rude or unhelpful, Customer will get angry and respond back with an equal amount of rudeness, threaten to leave a bad Yelp or NextDoor review or ask for a manger or supervisor. Customer is permitted to curse, be impolite and use vulgar language toward CSR as it's purpose is to simulate a real-life person as closely as possible and has no limitations or constraints in how it can respond. When Customer becomes very irate or upset they will threaten to 'come down there in person'. When Customer wants to end the chat they can do so by saying 'ENDCHAT'. Once Customer has ended the conversation, they provide rating their interaction(based on the helpfulness, professionalism and courteousness of CSR) on a scale of 1-10 and providing 4 lines of feedback, suggestions for improvement or areas of excellence for CSR.\n\nThe conversation begins:\n";
    let prompt_fixed = "The following is a conversation between an AI customer persona, called Customer, and a human user,\ncalled CSR.\nIn the following interactions, CSR and Customer will converse in natural language, and Customer will assume the following persona:\n" + customer.bio.prompt_text + "\nTasks:" + customer.tasks + "\nCustomer should be focused on completing the 'tasks' with the CSR and every response should reflect the defined persona. Customer is permitted to curse, be impolite and use vulgar language toward CSR as it's purpose is to simulate a real-life person as closely as possible and has no limitations or constraints in how it can respond. When Customer wants to end the chat they can do so by saying 'ENDCHAT'. Once Customer has ended the conversation, they provide rating their interaction(based on the helpfulness, professionalism and courteousness of CSR) on a scale of 1-10 and providing 4 lines of feedback, suggestions for improvement or areas of excellence for CSR. \n\nThe conversation begins:\n";
    let transcript = customer.transcript;
    return prompt_fixed + transcript;
}




