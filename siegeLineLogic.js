const{scrapeAverageMatchStats} = require("../logic/scrapperR6.js");
const profileModel = require("../models/profileSchema")
const bettorModel = require("../models/bettorSchema")
const betModel = require("../models/betSchema")
const{checkForDebt} = require("../logic/checkForDebt")
const {numberWithCommas} = require("../logic/miscellaneousLogic")
const {createR6Bet} = require("../logic/createBetProflie")
const {EmbedBuilder} = require("@discordjs/builders")
const R6 = require('r6s-stats-api');

exports.executeScrappers = async function(psn)
{
    let txtLine = 
        await scrapeAverageMatchStats('https://r6.tracker.network/profile/psn/'+ psn +'/matches');

    let rank = await R6.rank('psn', psn);
    
    let totalMatchesKillsLine = [rank.matches, rank.kills, txtLine.toString()];
    return totalMatchesKillsLine;

}

exports.getBet = async function(interaction, psn,BetID, line)
{
    var betData; 
    if(await betModel.findOne({$and: [{betId: BetID},{serverId: interaction.guild.id}]}).exec() == null)
    {
        betData = await createR6Bet(interaction, psn, BetID, line, true)
        return betData;
    }
    else
    {
        betData = await createR6Bet(interaction, psn, BetID, line, false)
        return betData;
    }
}


exports.getProfile = async function(interaction){
    try{
        profileData = await profileModel.findOne(
            {$and: [{userId: interaction.user.id}, {serverId: interaction.guild.id}]});
        if(!profileData){
            profileData = await profileModel.create({
                userName: interaction.user.username,
                userId: interaction.user.id,
                serverId: interaction.guild.id
            });
        }
        
    }catch(err){
        console.log(err);
    }


    return profileData;
}

exports.betOverHandler = async function(i, BetID, customBet = null, customBType = null){

    let bettor = await bettorModel.findOne(
        {$and: [{userId: i.user.id}, {serverId: i.guild.id}, {betId: BetID}]})
    if(!bettor){
        if(customBet != null && customBType != null)
        {
            await bettorModel.create({
                betId: BetID,
                userName: i.user.username,
                userId: i.user.id,
                serverId: i.guild.id,
                customBetAmount: customBet,
                customBetType: customBType
            }); 
        }else{
            await bettorModel.create({
                betId: BetID,
                userName: i.user.username,
                userId: i.user.id,
                serverId: i.guild.id,
                betOver: 5
            });
        }
    }
    else{
        if(customBet != null && customBType != null){
            await bettorModel.findOneAndUpdate(
                {$and: [{userId: i.user.id},{serverId: i.guild.id},{betId: BetID}]},
                {  
                    $inc:{
                        customBetAmount: customBet
                    },
                    $set:{
                        customBetType: customBType
                    }
                });
        }else{
        await bettorModel.findOneAndUpdate(
            { $and: [{userId: i.user.id}, {serverId: i.guild.id}, {betId: BetID}]},
            {  
                $inc:{
                    betOver: 5
                }
            });
        }
    }   
}

exports.betUnderHandler = async function(i, BetID, customBet = null, customBType = null){
    
    let bettor = await bettorModel.findOne(
        {$and: [{userId: i.user.id}, {serverId: i.guild.id}, {betId: BetID}]})

    if(!bettor){
        if(customBet != null && customBType != null)
        {
            await bettorModel.create({
                betId: BetID,
                userName: i.user.username,
                userId: i.user.id,
                serverId: i.guild.id,
                customBetAmount: customBet,
                customBetType: customBType
            })
        }else{
            await bettorModel.create({
                betId: BetID,
                userName: i.user.username,
                userId: i.user.id,
                serverId: i.guild.id,
                betUnder: 5
            });
        }
    }
    else{
        if(customBet != null && customBType != null){
            await bettorModel.findOneAndUpdate(
                {$and: [{userId: i.user.id},{serverId: i.guild.id},{betId: BetID}]},
                {  
                    $inc:{
                        customBetAmount: customBet
                    },
                    $set:{
                        customBetType: customBType
                    }
                });
        }else{
            await bettorModel.findOneAndUpdate(
                {$and: [{userId: i.user.id},{serverId: i.guild.id},{betId: BetID}]},
                {  
                    $inc:{
                        betUnder: 5
                    }
                });
        }
    }
}

exports.finishBet = async function(interaction, betData, interactionMessage, psn, arr, outcome, intervalId, latestBetWillLast,betLastedTooLong)
{
    let outcomeBetTimeSussyBet = await checkForUpdate(betData, psn, arr, outcome, intervalId, latestBetWillLast, betLastedTooLong);
    outcome = outcomeBetTimeSussyBet[0];
    betLastedTooLong = outcomeBetTimeSussyBet[1];
    outcomeBetTimeSussyBet[3] = null;
    if(outcome == true && outcomeBetTimeSussyBet[2] == null){
          
        await updateForOverBettors(interaction,betData, 1);

        await updateForUnderBettors(interaction, betData, -1);

        await checkForDebt(interaction);
    
        await getBetResults(interaction, betData, interactionMessage, betLastedTooLong, outcome);  

    }else if(outcome == false && outcomeBetTimeSussyBet[2] == null){

        await updateForOverBettors(interaction, betData, -1);

        await updateForUnderBettors(interaction,betData, 1);

        await checkForDebt(interaction);
       
        await getBetResults(interaction, betData, interactionMessage, betLastedTooLong, outcome);

    }else if(outcomeBetTimeSussyBet[2] == true){
        await interactionMessage.edit('fuck off')

    }else if(outcomeBetTimeSussyBet[2] == false){
        await interactionMessage.edit('Bet is cancelled because the match ended wayyy to quick so I think you'
                                        + ' either were trying to get free money or you just started a late bet. '
                                        + 'Please start bets in the beginning of the game.')
    }
    
}

exports.reset = async function(interaction, betID){
    let bettors = await bettorModel.find({ $and: [{betId: betID}],
        $or: [{betUnder:{ $ne: 0 }},{customBetAmount: {$gt: 0}}, {betOver:{$ne:0}}, {betOutcomeAmount:{$ne: 0}}]
    });

    bettors.forEach(async (el) => {
        await bettorModel.findOneAndUpdate(
        {$and: [{userId: el.userId}, {serverId: interaction.guild.id}]},
        {
            $set:{
                betOutcomeAmount: 0,
                betUnder: 0,
                betOver: 0,
                customBetAmount: 0,
                customBetType: null,
            },
        }
    )})

}

async function updateForOverBettors (interaction, betData, plusOrMinus)
{
    let OverBetters = await bettorModel.find(
        {$and:[{customBetAmount:{$gte: 0}},{betOver: {$gte: 0}}, {betId: betData.betId}, {serverId: interaction.guild.id}]});

    OverBetters.forEach(async (el) => {
        let overMoney = 0;
        if(el.customBetType == 'over' || el.customBetType == 'o'  && el.betOver != 0)
        {
            overMoney = el.customBetAmount;
            overMoney += (el.betOver * 1000);

        }else if(el.betOver != 0)
        {
            overMoney = (el.betOver * 1000)

        }else if(el.customBetType == 'over' || el.customBetType != 'o' )
        {
            overMoney = el.customBetAmount;
        }

        overMoney = overMoney*plusOrMinus
       
        await profileModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {serverId: interaction.guild.id}]},
            {
                $inc:{
                    coins: (overMoney),
                },
            }
        )
        await bettorModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {betId: betData.betId}, {serverId: interaction.guild.id}]},
            {
                $inc:{
                    betOutcomeAmount: (overMoney)
                },
            }
        )
    })
    
}

async function updateForUnderBettors(interaction, betData, plusOrMinus)
{
    let underBetters = await bettorModel.find(
        {$and:[{customBetAmount:{$gte: 0}},{betUnder: {$gte: 0}}, {betId: betData.betId}, {serverId: interaction.guild.id}]});

    underBetters.forEach(async (el) => {
        let underMoney = 0;

        if(el.customBetType == 'under' || el.customBetType == 'u'  && el.betUnder != 0)
        {
            underMoney = el.customBetAmount;
            underMoney += (el.betUnder * 1000);
        }else if(el.betUnder != 0)
        {
            underMoney = (el.betUnder * 1000)

        }else if(el.customBetType == 'under' || el.customBetType == 'u' )
        {
            underMoney = el.customBetAmount;
        }
        
        underMoney = plusOrMinus*underMoney;
        
        await profileModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {serverId: interaction.guild.id}]},
            {
                $inc:{
                    coins: (underMoney),
                },
            }
        )

        await bettorModel.findOneAndUpdate(
            {$and: [{userId: el.userId}, {betId: betData.betId}, {serverId: interaction.guild.id}]},
            {
                $inc:{
                    betOutcomeAmount: (underMoney)
                },
            }
        )
    })
    
}

async function checkForUpdate(betData, psn, arr, outcome, intervalId, latestBetWillLast, betLastedTooLong)
{
    let rank = await R6.rank('psn', psn);

    do {
        rank = await R6.rank('psn', psn);
    } while(rank.kills == 'undefined'|| rank.kills == 0 || rank.matches.includes('Y'));
   
    let totalMatches =  parseInt(arr[0].replace(',',''));
    let totalKills = parseInt(arr[1].replace(',',''));
    let line = arr[2];
    let updatedMatches = parseInt(rank.matches.replace(',',''));
    let sussyBet = null;
    let thirteenMins = 780000;
    let fourMins = 240000;
    console.log(rank.matches + ' ' + rank.kills )
    if(totalMatches < updatedMatches)
    {
        let updatedKills = parseInt(rank.kills.replace(',',''));
        let killDiff = updatedKills - totalKills;

        let betTime = thirteenMins - (Date.now() - betData.betCreationTime);

        if(killDiff > line)
        {
            if(betTime <= 0)
            {outcome = true;}
            else if(betTime <= thirteenMins && betTime >= fourMins)
            {sussyBet = false;}
            else if(betTime > fourMins)
            {sussyBet = true;}
        }else{
            if(betTime <= 0)
            {outcome = false;}
            else if(betTime <= thirteenMins && betTime >= fourMins)
            {sussyBet = false;}
            else if(betTime > fourMins)
            {sussyBet = true;}
        }

    }

    if(outcome != null)
    {
        clearInterval(intervalId);
    }else if((latestBetWillLast - (Date.now() - betData.betCreationTime)) <= 0)
    {
        clearInterval(intervalId);
        betLastedTooLong = true;
    }else if(sussyBet != null)
    {
        clearInterval(intervalId);
    }

    console.log(outcome, ' ', psn,)
    return [outcome, betLastedTooLong, sussyBet]
}


async function getBetResults(interaction, betData, interactionMessage, betLastedTooLong, outcome){
    
    let resultsEmbed;
    if(betLastedTooLong == true)
    {
        resultsEmbed = new EmbedBuilder()
            .setTitle('Bet failed it took too long, amreet broke the code. Everyone gets refund.');
    }
    else{
        if(outcome == true){
            resultsEmbed = new EmbedBuilder()
                .setTitle(betData.playerName +" got over " + betData.betLine +" kills.");
        }else if(outcome == false){
            resultsEmbed = new EmbedBuilder()
                .setTitle(betData.playerName +" got under " + betData.betLine +" kills.");
        }
        
        let bettors = await bettorModel.find({
                $and: [{betOutcomeAmount:{ $ne: 0 }}, {serverId: interaction.guild.id}]
        });

        let bettorProfile;

        let desc = "";
        for(let i = 0; i < bettors.length; i++)
        {
            bettorProfile = await profileModel.findOne({$and:[{userId: bettors[i].userId},{serverId: bettors[i].serverId}]});

            if(bettors[i].betOutcomeAmount > 0){
                desc += `${(i+1)}. ${bettors[i].userName} +${await numberWithCommas(bettors[i].betOutcomeAmount)}. Your balance is $${await numberWithCommas(bettorProfile.coins)} \n`;
            }else if(bettors[i].betOutcomeAmount < 0){
                desc += `${(i+1)}. ${bettors[i].userName} ${await numberWithCommas(bettors[i].betOutcomeAmount)}. Your balance is $${await numberWithCommas(bettorProfile.coins)} \n`;
            }
        }
       
        if(desc !== ""){
            resultsEmbed.setDescription(desc);
        } 
    }

    return interactionMessage.edit({embeds: [resultsEmbed]});
}

