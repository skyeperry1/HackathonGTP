// bio.js
'use strict';

module.exports = class Bio {
    constructor(bio) {
        this.address = bio.address;
        this.name = bio.name;
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
    }
    address;
    name;
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
        var bio_prompt_txt;
        bio_prompt_txt += "Name: " + this.name + "\n";
        bio_prompt_txt += "Address: " + this.address + "\n";

        bio_prompt_txt += "Dob" + this.dob;
        bio_prompt_txt += "Technological Skill(their ability to complete tasks related to tech, scale 1-10):" + this.technological_aptitude + "\n";
        bio_prompt_txt += "I.Q.: " + this.iq + "\n";
        bio_prompt_txt += "Occupation: " + this.occupation + "\n";
        if (this.family) {
            bio_prompt_txt += "Family:"
            this.family.forEach(familyMemeber => {
                bio_prompt_txt += "(" + familyMemeber.name + "," + familyMemeber.age, + "," + familyMemeber.relationship + ")";
            });
            bio_prompt_txt += "\n";
        }
        bio_prompt_txt += "Hobbies:";
        if (this.hobbies) {
            this.hobbies.forEach(hobby => {
                bio_prompt_txt += hobby + ",";
            });
        }
        bio_prompt_txt += "\n";
        bio_prompt_txt += "Patience Level(scale of 1-10):" + this.patience_level + "\n";
        bio_prompt_txt += "Focus Level(scale of 1-10):" + this.focus_level + "\n";
        bio_prompt_txt += "Current Mood:" + this.current_mood + "\n";
        bio_prompt_txt += "Personality Type:" + this.personality_type + "\n";
        bio_prompt_txt += "Bio: " + this.bio + "\n";
        this.prompt_text = bio_prompt_txt;
    }
}

