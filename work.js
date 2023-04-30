const {SlashCommandBuilder} = require("discord.js");
const parseMilliSeconds = require("parse-ms-2");
const profileModel = require("../models/profileSchema");
const {numberWithCommas, getRandomInt} = require("../logic/miscellaneousLogic")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Work for coins bitch"),
    async execute(interaction, profileData){
        const id  = await interaction.user.id;
        const { workLastUsed, tryToWork, coins } = profileData;
        
        const cooldown = 3600000
        const timeLeft = cooldown - (Date.now() - workLastUsed);

        if(timeLeft > 0)
        {
            await interaction.deferReply({ephemeral: true});
            const {hours, minutes, seconds} = parseMilliSeconds(timeLeft);

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
                await interaction.editReply("You can't work for another "+ minutes + " mins " + seconds + " sec");
            }
           
        }else {
            await interaction.deferReply();

            let randmAmt = await updateLastWorkAndCoins(id, interaction);

            await interaction.editReply(`You earned $${await numberWithCommas(randmAmt)}`);
        }
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

async function updateLastWorkAndCoins(id, interaction)
{
    const randmAmt = await getRandomInt(25000, 100000);
    try{
        await profileModel.findOneAndUpdate(
            {$and:[{userId: id}, {serverId: interaction.guild.id}]},
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