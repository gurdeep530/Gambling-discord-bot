const {SlashCommandBuilder} = require("discord.js");
const {slotMachine} = require('discord.js-games');
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets } = require("../logic/gamesLogic");
const {numberWithCommas} = require("../logic/miscellaneousLogic");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription('play a game of slots.')
        .addStringOption((option) =>
        option
            .setName('amount')
            .setDescription('Bet Amount')
            .setRequired(true)
        ),
    async execute(interaction, profileData){

        if(profileData.debt == false)
        {
            let betAmount = await getBetAmount(interaction, profileData);
            if(betAmount != null){
                const result = await slotMachine({ 
                    message: interaction,
                    emojis: ['1️⃣', '2️⃣', '3️⃣'],
                    embed:{
                        winMessage: `<@${interaction.user.id}> congratulations, you won $${await numberWithCommas(3*betAmount)}, your balance is: ${await numberWithCommas(profileData.coins+(5*betAmount))}`,
                        loseMessage: `<@${interaction.user.id}> lost $${await numberWithCommas(betAmount)}, your balance is: ${await numberWithCommas(profileData.coins-(betAmount))}`,
                    }
                });
    
                await updateGameBets(interaction, betAmount, result);
                
                console.log(interaction.user.username + "'s slots game result: "+ result);
            }
            else{await interaction.reply(`too high of a bet for you <@${interaction.user.id}>`)}
        }
        else{
            await interaction.reply(`Fuck off <@${interaction.user.id}> you are in debt get ya money if you wanna play.`)
        }

    }
}