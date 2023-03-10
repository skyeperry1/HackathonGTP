// bio.js
'use strict';
const Address = require("./address.js");

module.exports = class Bio {
    constructor(bio) {
        this.address = new Address(bio.address.street, bio.address.city, bio.address.state, bio.address.zip);
        this.previous_address = new Address(bio.previous_address.street, bio.previous_address.city, bio.previous_address.state, bio.previous_address.zip);
        this.first_name = bio.first_name;
        this.last_name = bio.last_name;
        this.phone_number = bio.current_phone_number;
        this.previous_phone_number = bio.previous_phone_number;
        this.social_security_number = bio.nsocial_security_number;
        this.dob = bio.dob;
        this.technological_aptitude = bio.technological_aptitude;
        this.iq = bio.iq;
        this.occupation = bio.occupation;
        this.family = bio.family;
        this.hobbies = bio.hobbies;
        this.patience_level = bio.patience_level;
        this.focus_level = bio.focus_level;
        this.current_mood = bio.current_mood;
        this.personality_type = bio.personality_type;
        this.bio = bio.bio;
        this.gender = bio.gender;
        this.salutation = bio.salutation;
        this.email_address = bio.email_address;
    }
    address;
    first_name;
    last_name;
    gender;
    email_address;
    salutation;
    previous_address;
    social_security_number;
    phone_number;
    previous_phone_number;
    dob;
    technological_aptitude;
    iq;
    occupation;
    family;
    hobbies;
    patience_level;
    current_mood;
    focus_level;
    bio;
    personality_type;
    prompt_text;

    generateBioProptText() {
        var bio_prompt_txt = "";
        bio_prompt_txt += "Name: " + this.first_name + " " + this.last_name + "\n";
        bio_prompt_txt += "Current address(Customer should speak in a tone and manor that aligns with the local dialect of this region. They will make sure to Correct the CSR if they use the wrong address.): " + this.address + "\n";
        bio_prompt_txt += "Previous address(the previous address of the customer): " + this.previous_address + "\n";
        bio_prompt_txt += "Email:" + this.email_address + "\n";
        bio_prompt_txt += "Current Phone Number:" + this.phone_number + "\n";
        bio_prompt_txt += "Previous Phone Number:" + this.previous_phone_number + "\n";
        bio_prompt_txt += "Social:" + this.social_security_number + "\n";
        bio_prompt_txt += "Gender:" + this.gender + "\n";
        bio_prompt_txt += "Dob:" + this.dob + "\n";
        bio_prompt_txt += "Technological Skill(their ability to complete tasks related to tech, scale 1-10):" + this.technological_aptitude + "\n";
        bio_prompt_txt += "I.Q.(This effects Customers ability to unsderstand instructions, laungage and spelling): " + this.iq + "\n";
        bio_prompt_txt += "Occupation: " + this.occupation + "\n";
        if (Array.isArray(this.family)) {
            bio_prompt_txt += "Family:"
            this.family.forEach(familyMemeber => {
                bio_prompt_txt += "(" + familyMemeber.name + "," + familyMemeber.age, + "," + familyMemeber.relationship + ")";
            });
            bio_prompt_txt += "\n";
        }
        bio_prompt_txt += "Hobbies:";
        if (Array.isArray(this.hobbies)) {
            this.hobbies.forEach(hobby => {
                bio_prompt_txt += hobby + ",";
            });
        }
        bio_prompt_txt += "\n";
        bio_prompt_txt += "Patience Level(This effects how likeley Customer is to become frustraded and ENDCHAT. Scale of 1-10):" + this.patience_level + "\n";
        bio_prompt_txt += "Focus Level(Effects how likeley Customer is to stay on topic. Scale of 1-10):" + this.focus_level + "\n";
        bio_prompt_txt += "Current Mood (Effects the tone of the conversation. If CSR is unhelpful, unprofessional or otherwise rude the Current Mood should be considered diminished):" + this.current_mood + "\n";
        bio_prompt_txt += "Personality Type (This lightly effects how Customer responds ):" + this.personality_type + "\n";
        bio_prompt_txt += "Bio (a Brief background of Customer): " + this.bio + "\n";
        this.prompt_text = bio_prompt_txt;
    }
}

