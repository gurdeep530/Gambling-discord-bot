const {SlashCommandBuilder} = require("discord.js");
const { blackjack} = require('discord.js-games');
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets, updateOnGoingBJ } = require("../logic/gamesLogic");
const {numberWithCommas} = require("../logic/miscellaneousLogic");


module.exports = {
    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription('Where Amreet loses all his money')
        .addStringOption((option) =>
        option
            .setName('amount')
            .setDescription(`Amount you want to bet or 'half' or 'all'`)
            .setRequired(true)
        ),
    async execute(interaction, profileData){
        
        if(profileData.debt == false && profileData.blackJackOngoing == false)
        {
            let betAmount = await getBetAmount(interaction, profileData);

            if(betAmount != null && betAmount != -1){

                updateOnGoingBJ(interaction, true)

                const result = await blackjack({ 
                    message: interaction, 
                    embed:{
                        winMessage: '{user} congratulations, you won '+ await numberWithCommas(betAmount) +' dollars, your balance is: '+ await numberWithCommas(profileData.coins+betAmount),
                        loseMessage: '{user} lost '+ await numberWithCommas(betAmount) +' dollars, your balance is: '+ await numberWithCommas(profileData.coins-betAmount),
                        timeEndMessage :`Time ended, <@${interaction.user.id}> lost 75% of ${await numberWithCommas(betAmount)} dollar bet, your balance is: ${await numberWithCommas(profileData.coins-(betAmount*.75))}`,
                    }
                });
               
                await updateGameBets(interaction, betAmount, result);
                
                console.log(interaction.user.username + "'s blackjack game result: "+ result);
            }else if(betAmount == -1)
            {
                await interaction.reply(`fuck off <@${interaction.user.id}>`)
            }
            else{await interaction.reply(`too high of a bet for you <@${interaction.user.id}>`)}
            
        }else if(profileData.blackJackOngoing == true)
        {
            await interaction.reply(`<@${interaction.user.id}> you still have a blackjack game going play it or let it end before starting a new game.`)
        }
        else{
            await interaction.reply(`Fuck off <@${interaction.user.id}> you are in debt get ya money if you wanna play.`)
        }

    }
}

