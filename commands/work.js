const {SlashCommandBuilder} = require("discord.js");
const parseMilliSeconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const {numberWithCommas, getRandomInt} = require("../logic/miscellaneousLogic");
const { get } = require("mongoose");
const { checkForDebt } = require("../logic/checkForDebt");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Work for coins bitch"),
    async execute(interaction, profileData){
        const id  = await interaction.user.id;
        let { workLastUsed, tryToWork, coins } = profileData;
        const cooldown = 3600000
        let timeLeft = cooldown - (Date.now() - workLastUsed);

        if(timeLeft > 0)
        {
            await interaction.deferReply({ephemeral: true});
            let {hours, minutes, seconds} = parseMilliSeconds(timeLeft);
            
            if(minutes > 30 && tryToWork <= 1 )
            {
                await increaseTryToWork(id, interaction);
                await interaction.editReply("Impatient fuck, you can't work for another "+ minutes + " mins " + seconds + " sec" )
            }
            else if (minutes > 30 && tryToWork == 2)
            {
                await increaseTryToWork(id, interaction);
                await interaction.editReply("Motherfucker, don't ask me again you, can work after "+ minutes + " mins " + seconds + " sec");
            }
            else if(minutes > 30 && tryToWork == 3)
            {
                await increaseTryToWork(id, interaction);
                await interaction.editReply("Do it again bitch, I fucking dare you, I will teach you discipline you little fuck.");
            }
            else if(minutes > 30 && tryToWork > 3)
            {
                await pissed(id, coins, interaction)
                profileData = await profileModel.findOne({userId: id});
                await interaction.editReply(`<@${interaction.user.id}> has $${await numberWithCommas(profileData.coins)}.`, {ephemeral: false});
            }
            else{
                if(await getRandomInt(1,2) == 1){
                    let randmAmt = await updateLastWorkAndCoins(profileData, interaction);

                    await interaction.editReply(`I killed the time left. You earned $${await numberWithCommas(randmAmt)}. Your balance is $${await numberWithCommas(profileData.coins + randmAmt)}.`);
                }else{
                    await interaction.editReply("You can't work for another "+ minutes + " mins " + seconds + " sec");
                }
            }
           
        }else {
            await interaction.deferReply();

            let randmAmt = await updateLastWorkAndCoins(profileData, interaction);

            await interaction.editReply(`You earned $${await numberWithCommas(randmAmt)}. Your balance is $${await numberWithCommas(profileData.coins + randmAmt)}.`);
        }
        checkForDebt(interaction)
    },

}

async function increaseTryToWork(id, interaction)
{
    try{
        await profileModel.findOneAndUpdate(
            {$and:[{userId: id}, {serverId: interaction.guild.id}]},
            {
                $inc:{
                    tryToWork: 1,
                }
            }
        )
    }catch(err){
        console.log(err);
    }
}

async function getRandomAmount(profileData)
{
    let randmAmt;
    let hundredK = 100000;
    let mill = 10 * hundredK;
    let fiveHundMill = 500 * mill;
    let bill = 1000 * mill;
    let coins = parseFloat(profileData.coins);
    let debt = profileData.debt;
    if(debt == true)
    {
        let posCoins = coins * -1;
        if(coins < -100000)
            randmAmt = await getRandomInt(posCoins* .9, posCoins*1.005)
        else
            randmAmt = await getRandomInt(posCoins*1.05, posCoins*2)
    }
    else if(debt == false && coins <= (2.5*hundredK)){
        randmAmt = await getRandomInt(0, hundredK);
    }
    else if(coins > (2.5*hundredK) && coins <= mill && debt == false){
        randmAmt = await getRandomInt(coins/100, coins/2);
    }
    else if(coins > mill &&  coins <= (100*mill) && debt == false){
        randmAmt = await getRandomInt(coins/10, coins/2);
    }
    else if(coins > (100*mill) && coins <= fiveHundMill && debt == false){
        randmAmt = await getRandomInt(coins/500, coins/2)
    }
    else if(coins > fiveHundMill && coins <= bill && debt == false){
        randmAmt = await getRandomInt(coins/100, coins/2);
    }
    else if(coins > bill && debt == false){
        randmAmt = await getRandomInt(0, coins/2); 
    }

    return randmAmt;
}

async function updateLastWorkAndCoins(profileData, interaction)
{
    let randmAmt = await getRandomAmount(profileData);

    try{
        await profileModel.findOneAndUpdate(
            {$and:[{userId: profileData.userId}, {serverId: interaction.guild.id}]},
            { 
                $set: {
                    workLastUsed: Date.now(),
                    tryToWork: 0,
                },
                $inc: {
                    coins: randmAmt,
                },
            }
    )
    }catch(err){
        console.log(err);
    }
    return randmAmt;
}
async function pissed(id, c, interaction)
{
    try{
        await profileModel.findOneAndUpdate(
            {$and:[{userId: id}, {serverId: interaction.guild.id}]},
            { 
                $set: {
                    workLastUsed: Date.now(),
                },
                $inc: {
                    coins: -c,
                },
                $set: {
                    tryToWork: 0,
                }
            }
    )
    }catch(err){
        console.log(err);
    } 
}