const mongoose = require("mongoose");

const bettorSchema = new mongoose.Schema({
    userName: {type: String, require: true, upsert: true},
    userId: {type: String, require: true},
    serverId: {type: String, require: true},
    betId:{type: Number, default: null},
    betOver: {type: Number, default: 0, upsert: true},
    betUnder: {type: Number, default: 0, upsert: true},
    customBetAmount: {type: Number, default: 0, upsert: true},
    customBetType:{type: String, default: null, upsert: true},
    betOutcomeAmount: {type: Number, default: 0, upsert: true}
})

const model = mongoose.model("tyroneBettordb", bettorSchema);

module.exports = model;
