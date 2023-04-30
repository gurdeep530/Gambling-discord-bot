const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    userName: {type: String, require: true},
    userId: {type: String, require: true},
    serverId: {type: String, require: true},
    coins: {type: Number, default: 100000},
    workLastUsed: {type: Number, default: 0},
    tryToWork: {type: Number, default: 0 },
    blackJackOngoing: {type: Boolean, default: false, upsert: true},
    blackJackOngoingTime:{type: Number, default: 0, upsert: true},
    debt: {type: Boolean, default: false, upsert: true}
})

const model = mongoose.model("tyroneplayerDB", profileSchema);

module.exports = model;
