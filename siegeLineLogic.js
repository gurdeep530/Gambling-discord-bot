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

    let rank = await getRank(psn);
    
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

//#region bethandlers

exports.betOverHandler = async function(i, BetID, betMultiplier, customBet = null, customBType = null){

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
                betOver: betMultiplier
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
                    betOver: betMultiplier
                }
            });
        }
    }   
    return bettor;
}

exports.betUnderHandler = async function(i, BetID, betMultiplier, customBet = null, customBType = null){
    
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
                betUnder: betMultiplier
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
                        betUnder: betMultiplier
                    }
                });
        }
    }
    return bettor;
}
//#endregion

exports.finishBet = async function(interaction, betData, interactionMessage, psn, arr, outcome, intervalId, latestBetWillLast,betLastedTooLong)
{
    let outcomeBetTimeSussyBet = await checkForUpdate(betData, psn, arr, outcome, intervalId, latestBetWillLast, betLastedTooLong);
    outcome = outcomeBetTimeSussyBet[0];
    betLastedTooLong = outcomeBetTimeSussyBet[1];

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
        await interactionMessage.edit('fuck off, Bet is cancelled.')

    }else if(outcomeBetTimeSussyBet[2] == false){
        await interactionMessage.edit('Bet is cancelled because the match ended to quick.')
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
    let rank = await getRank(psn);
    
    let totalMatches =  parseInt(arr[0].replace(',',''));
    let totalKills = parseInt(arr[1].replace(',',''));
    let line = arr[2];
    let updatedMatches = parseInt(rank.matches.replace(',',''));
    let sussyBet = null;
    let thirteenMins = 780000;
    let fourMins = 240000;
    console.log('sieglineLogic line 317\n checkForUpdate #s',rank.matches + ' ' + rank.kills)
    if(totalMatches < updatedMatches)
    {
        let updatedKills = parseInt(rank.kills.replace(',',''));
        let killDiff = updatedKills - totalKills;

        let betTime = thirteenMins - (Date.now() - betData.betCreationTime);
        

        if(killDiff > line)
        {
            if(betTime <= 0)
            {outcome = true;}
            else if(betTime <= thirteenMins && betTime >= fourMins && betTime < fourMins)
            {sussyBet = false;}
            else if(betTime > fourMins)
            {sussyBet = true;}
        }else{
            if(betTime <= 0)
            {outcome = false;}
            else if(betTime <= thirteenMins && betTime >= fourMins && betTime < fourMins)
            {sussyBet = false;}
            else if(betTime > fourMins)
            {sussyBet = true;}
        }
        console.log(sussyBet);

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

    console.log('sieglineLogic line 356\n checkForUpdate results: ' + outcome, ' ', psn,)
    return [outcome, betLastedTooLong, sussyBet]
}

exports.getBettorsEmbed = async function(interaction, interactionMessage, betData, row1, row2){
    let betsEmbed = new EmbedBuilder().setTitle(`Bettors for ${betData.playerName}'s line of ${betData.betLine}`)
                                        .setFooter({text:'Betting line closed'})
                                        .setTimestamp();
    let bettors = await bettorModel.find({
        $and:[{$or: [{betOver:{$ne:0}}, {betUnder:{$ne:0}}]}, {serverId: interaction.guild.id}, {betId: betData.betId}]
    });

    let desc = "";
    for(let i = 0; i < bettors.length; i++)
    {
        bettorProfile = await profileModel.findOne({$and:[{userId: bettors[i].userId},{serverId: bettors[i].serverId}]});

        if(bettors[i].betOver > 0 || bettors[i].betUnder > 0)
        {
            let amount = (bettors[i].betOver - bettors[i].betUnder) * 1000
            if(amount < 0 ){amount *= -1}
            desc += `${(i+1)}. ${bettors[i].userName} bet $${await numberWithCommas(amount)}. \n`;
        }
    }
    if(desc !== ""){
            betsEmbed.setDescription(desc);
    } 
    return interactionMessage.edit({embeds: [betsEmbed], components: [row1, row2]});
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

async function getRank(psn)
{
    let rank;
    rank = await R6.rank('psn', psn);

    console.log('sieglineLogic line 408\n getRank #s: '+ rank.matches + ' ' + rank.kills )

    while(typeof rank.kills !== 'string' ||typeof rank.matches !== 'string'
            || rank.kills == 'undefined'|| rank.matches == 'undefined' 
            || rank.kills == 0 || rank.matches.includes('Y')){
        rank = await R6.rank('psn', psn);
        
    }
    
    return rank;
}
