const betModel = require("../models/betSchema");

exports.createR6Bet = async function(interaction, psn,  bId, bLine, create){
    let betData;
    if(create == true)
    {
        try {
            betData = await betModel.create(
                {
                    
                    betId: bId,
                    serverId: interaction.guild.id,
                    playerName: psn,
                    betLine: bLine, 
                    betCreationTime: Date.now()
                }
            )
        } catch (error) {
            console.log(error)
        }
    }
    else
    {
        try {
            betData = await betModel.findOneAndUpdate(
                {$and: [{betId: bId}, {serverId: interaction.guild.id}]},
                {
                    $set:{
                        playerName: psn,
                        betLine: bLine,
                        betCreationTime: Date.now()
                    } 
                }
            )
        } catch (error) {
            console.log(error)
        }
    }

    return betData
}
