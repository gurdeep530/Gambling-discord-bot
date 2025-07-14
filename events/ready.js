const {Events} = require("discord.js");
const {updateOnGoingBJ } = require("../logic/gamesLogic");

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client){
        updateOnGoingBJ(null,null,true)
        console.log('Ready');
    }
}