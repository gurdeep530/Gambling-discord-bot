const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
    serverId: {type: String, require: true},
    playerName: {type: String},
    betCreationTime: {type: Number, default: 0},
    betId:{type: Number, require: false, default: null},
    betLine: {type: String, default: null}
    
})

const model = mongoose.model("tyroneBetDB", betSchema);

module.exports = model;
