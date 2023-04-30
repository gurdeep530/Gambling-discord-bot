const {SlashCommandBuilder} = require("discord.js");
const {connectFour} = require('discord.js-games');
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
                const result = await connectFour({ 
                    message: interaction,
                    emojis: ['1️⃣', '2️⃣', '3️⃣'],
                    embed:{
                        winMessage: interaction.user.username +' congratulations, you won '+ betAmount +' dollars, your balance is: '+ await numberWithCommas(profileData.coins),
                        loseMessage: interaction.user.username +' lost '+ betAmount +' dollars, your balance is: '+ await numberWithCommas(profileData.coins),
                    }
                });
    
                updateGameBets(interaction, betAmount, result);
                
                console.log(interaction.user.username + "'s slots game result: "+ result);
            }
            else{await interaction.reply('too high of a bet for you '+interaction.user.username)}
        }
        else{
            await interaction.reply('Fuck off ' + interaction.user.username + ' you are in debt get ya money if you wanna play.')
        }

    }
}