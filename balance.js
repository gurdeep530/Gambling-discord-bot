const {SlashCommandBuilder} = require("discord.js");
const {numberWithCommas} = require("../logic/miscellaneousLogic");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription('Shows your coin balence'),
    async execute(interaction, profileData){
        const {coins} = profileData;
        console.log(interaction.user.tag);
        const username = interaction.user.id;
        await interaction.reply( `<@${username}> has $${await numberWithCommas(coins)}`)
    }
}