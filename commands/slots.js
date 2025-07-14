const {SlashCommandBuilder} = require("discord.js");
const {slotMachine} = require('discord.js-games');
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets } = require("../logic/gamesLogic");
const {numberWithCommas} = require("../logic/miscellaneousLogic");
const {getRandomInt} = require('../logic/miscellaneousLogic')


module.exports = {
    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription('play a game of slots.')
        .addStringOption((option) =>
        option
            .setName('amount')
            .setDescription(`Amount you want to bet or 'half' or 'all'`)
            .setRequired(true)
        ),
    async execute(interaction, profileData){

        if(profileData.debt == false)
        {
            let betAmount = await getBetAmount(interaction, profileData);
            let betMultiplier = await getRandomInt(25,50);
            if(betAmount != null){
                const result = await slotMachine({ 
                    message: interaction,
                    emojis: ['1️⃣', '2️⃣', '3️⃣', '4️⃣'],
                    embed:{
                        winMessage: `<@${interaction.user.id}> congratulations, you won $${await numberWithCommas(betMultiplier*betAmount)}, your balance is: ${await numberWithCommas(profileData.coins+(betMultiplier*betAmount))}`,
                        loseMessage: `<@${interaction.user.id}> lost $${await numberWithCommas(betAmount)}, your balance is: ${await numberWithCommas(profileData.coins-(betAmount))}`,
                    }
                });
    
                if(result == false)
                {betMultiplier = -1;}

                await updateGameBets(interaction, betAmount, result, betMultiplier);
                
                console.log(interaction.user.username + "'s slots game result: "+ result + " betMultiplier: "+ betMultiplier);
            }
            else{await interaction.reply(`too high of a bet for you <@${interaction.user.id}>`)}
        }
        else{
            await interaction.reply(`Fuck off <@${interaction.user.id}> you are in debt get ya money if you wanna play.`)
        }

    }
}