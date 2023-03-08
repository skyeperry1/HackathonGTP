// address.js
'use strict';

module.exports = class Account {
    constructor() {
        this.number = this.getRandomInt(10000000, 99999999);
        this.type = this.getRandomAccount();
        this.open_date = this.getRandomDate();
        this.last_payment_amount = this.getRandomDollarAmount(50, 1000);
        this.avg_monthly_balance = this.getRandomDollarAmount(150, 10000);
        this.current_balance = this.getRandomDollarAmount(150, 500000);
    }
    number;
    type;
    open_date;
    last_payment_amount;
    avg_monthly_balance;
    current_balance;


    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
    }

    getRandomDollarAmount(min, max) {
        let int = this.getRandomInt(min * 100, max * 100);
        return int / 100;
    }

    getRandomAccount() {
        let rnd = this.getRandomInt(0, 3);
        if (rnd == 0) {
            return "Checking";
        } else if (rnd == 1) {
            return "Savings";
        } else {
            return "credit";
        }
    }

    getRandomDate() {
        const maxDate = Date.now();
        const timestamp = Math.floor(Math.random() * maxDate);
        return new Date(timestamp).toLocaleDateString('en-us', { year: "numeric", month: "short", day: "numeric" });
    }

    generatePromptText() {
        var prompt_txt = "";
        prompt_txt += "Account Number:" + this.number + "\n";
        prompt_txt += "Account Type:" + this.type + "\n";
        prompt_txt += "Account Open Date:" + this.open_date + "\n";
        prompt_txt += "Account Balance:$" + this.balance + "\n";
        prompt_txt += "Last Payment:$" + last_payment_amount + "\n";
        return prompt_txt;
    }
}

