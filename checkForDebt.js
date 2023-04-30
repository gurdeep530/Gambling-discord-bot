const profileModel = require("../models/profileSchema")


exports.checkForDebt = async function(interaction)
{
    let brokeboys = await profileModel.find({$and: [{coins: {$lt: 0}}, {serverId: interaction.guild.id}]})

    brokeboys.forEach(async (el) => {
        await profileModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {serverId: interaction.guild.id}]},
            {  
                $set: {
                    debt: true,
                },
            });
    })
    
    let nonBroke = await profileModel.find({$and: [{coins: {$gte: 0}}, {serverId: interaction.guild.id}]})
    nonBroke.forEach(async (el) => {
        await profileModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {serverId: interaction.guild.id}]},
            {
                $set:{
                    debt: false
                },
            })
    })
}

