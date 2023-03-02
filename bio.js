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
}

