const {SlashCommandBuilder} = require("discord.js");
const {dice} = require('discord.js-games');
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets } = require("../logic/gamesLogic");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("dice")
        .setDescription('gamble ya money away.')
        .addStringOption((option) =>
        option
            .setName('amount')
            .setDescription('Bet Amount')
            .setRequired(true)
        ),
    async execute(interaction, profileData){

        if(profileData.debt == false)
        {
            let betAmount = await getBetAmount(interaction, profileData)
            const result = await dice({ 
                message: interaction,
                /*embed:{
                    winMessage: '{user} congratulations, you won '+ betAmount +' dollars',
                    loseMessage: '{user} lost '+ betAmount +' dollars'
                }*/
            });

            updateGameBets(interaction, betAmount, result);
            
            console.log(interaction.user.username + "'s dice game result: "+ result);
        }
        else{
            await interaction.reply('Fuck off ' + interaction.user.username + ' you are in debt get ya money if you wanna play.')
        }

    }
}