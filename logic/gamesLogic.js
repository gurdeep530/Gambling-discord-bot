const profileModel = require("../models/profileSchema");
const{checkForDebt} = require("./checkForDebt");


exports.updateGameBets = async function(interaction, betAmount, result, betMultiplier = 0,  bj = true){
    
    //blackjack
    if(result == 'win')
    {
        betMultiplier = 1
        await updateMoney(interaction, betAmount,betMultiplier)
        await checkForDebt(interaction);
    }
    else if(result == 'loss')
    {
        betMultiplier = -1
        await updateMoney(interaction, betAmount, betMultiplier)
        await checkForDebt(interaction);

    }else if(result == 'time ended')
    {
        betMultiplier = -.75
        await updateMoney(interaction, betAmount, betMultiplier)
        await checkForDebt(interaction);
    }
    //slots and roulette
    else if(result == true)
    {
        await updateMoney(interaction, betAmount, betMultiplier)
        await checkForDebt(interaction);

    }else if(result == false)
    {
        await updateMoney(interaction, betAmount, betMultiplier)
        await checkForDebt(interaction);

    }

    if(bj == true){
        await updateOnGoingBJ(interaction, false)
    }
}
exports.updateOnGoingBJ = updateOnGoingBJ;
async function updateOnGoingBJ(interaction = null, trueOrFalse = null, reset = false)
{
    if(reset == true)
    {
        let users = await profileModel.find({blackJackOngoing: true});

        users.forEach(async (el) => {
            await profileModel.findOneAndUpdate(
                {userId: el.userId},
                {  
                    $set: {
                        blackJackOngoing: false,
                        blackJackOngoingTime: 0,
                    },
                });
        })
    }

    if(trueOrFalse == true && trueOrFalse != null)
    {
        await profileModel.findOneAndUpdate(
            {$and: [{userId: interaction.user.id}, {serverId: interaction.guild.id}]},
            {  
                $set: {
                    blackJackOngoing: true,
                    blackJackOngoingTime: Date.now()
                },
            });
    }else if(trueOrFalse == false && trueOrFalse != null){
        await profileModel.findOneAndUpdate(
            {$and: [{userId: interaction.user.id}, {serverId: interaction.guild.id}]},
            {  
                $set: {
                    blackJackOngoing: false,
                    blackJackOngoingTime: 0
                },
            });
    }
}

async function updateMoney(interaction, betAmount, plusOrMinusAndMultiplier){
    await profileModel.findOneAndUpdate(
        {$and: [{userId: interaction.user.id}, {serverId: interaction.guild.id}]},
        {  
            $inc: {
                coins: Math.ceil(plusOrMinusAndMultiplier*betAmount),
            },
        });
}