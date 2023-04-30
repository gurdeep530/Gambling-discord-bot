const {SlashCommandBuilder} = require("discord.js");
const {rps} = require('discord.js-games');
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets } = require("../logic/gamesLogic");
const {numberWithCommas} = require("../logic/miscellaneousLogic");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("rps")
        .setDescription('play a game of Rock Paper Scissors.')
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
                const result = await rps({ 
                    message: interaction, 
                    embed:{
                        winMessage: '{user} congratulations, you won '+ betAmount +' dollars, your balance is: '+ await numberWithCommas(profileData.coins),
                        loseMessage: '{user} lost '+ betAmount +' dollars, your balance is: '+ await numberWithCommas(profileData.coins),
                    }
                });
    
                updateGameBets(interaction, betAmount, result);
                
                console.log(interaction.user.username + "'s dice game result: "+ result);
            }
            else{await interaction.reply('too high of a bet for you '+interaction.user.username)}
        }
        else{
            await interaction.reply('Fuck off ' + interaction.user.username + ' you are in debt get ya money if you wanna play.')
        }

    }
}