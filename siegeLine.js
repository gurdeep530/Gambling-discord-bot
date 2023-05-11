const {finishBet, executeScrappers, reset, getBet, getProfile, betOverHandler, betUnderHandler, getBettorsEmbed} = require('../logic/siegeLineLogic')
const{SlashCommandBuilder, ButtonStyle, ButtonInteraction, ApplicationCommandPermissionType} = require('discord.js');
const {profileSchema} = require("../models/profileSchema")
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require("@discordjs/builders")
const bettorModel = require("../models/bettorSchema")
const betModel = require("../models/betSchema")
const {numberWithCommas} = require("../logic/miscellaneousLogic");
const {autoComplete, playerNames} = require('../logic/autoComplete')
require('events').EventEmitter.defaultMaxListeners = 45;

//each game with betting will have a different ID that will increment by 1 with every new game.
//0 is reserved for r6 lines.
var BetID = 0;  
var betData;
var intervalId;
var psn;
var line;
var outcome = null;
var latestBetWillLast = 2700 * 1000;
var betLastedTooLong = false;
const wait = require('node:timers/promises').setTimeout;
module.exports = {
    data: new SlashCommandBuilder()
        .setName('siegeline')
        .setDescription("Create a line for a player")
        .addStringOption((option) => 
            option
            .setName('player-name')
            .setDescription('Choose the player name or psn')
            .setRequired(true)
            .setAutocomplete(true)
            ),
    async autocomplete(interaction)
    {
        await autoComplete(interaction,playerNames);
    },
            
    async execute(interaction) {
        const interactionMessage = await interaction.deferReply({fetchReply: true});

        reset(interaction, BetID);

        //#region determine line
        let map = new Map(playerNames.map(el => {return[el.name, el.value]}))
        psn = map.get(interaction.options.getString('player-name'));
        console.log(psn);
        let arr = await executeScrappers(psn);
        line = arr[2];
        line = (Math.round(line)) +.5;
        //#endregion

        //#region betting menu
        const gambleEmbed = new EmbedBuilder().setColor(0x00aa6d);

        const Button1 = new ButtonBuilder()
            .setCustomId('one')
            .setLabel('5K Over')
            .setStyle(ButtonStyle.Secondary);

        const Button2 = new ButtonBuilder()
            .setCustomId('two')
            .setLabel('5K Under')
            .setStyle(ButtonStyle.Secondary);

        const Button3 = new ButtonBuilder()
            .setCustomId('three')
            .setLabel('50K Over')
            .setStyle(ButtonStyle.Success);

        const Button4 = new ButtonBuilder()
            .setCustomId('four')
            .setLabel('50K Under')
            .setStyle(ButtonStyle.Success);
    
        const Button5 = new ButtonBuilder()
            .setCustomId('five')
            .setLabel('100K Over')
            .setStyle(ButtonStyle.Primary);

        const Button6 = new ButtonBuilder()
            .setCustomId('six')
            .setLabel('100K Under')
            .setStyle(ButtonStyle.Primary);

        const Button7 = new ButtonBuilder()
            .setCustomId('seven')
            .setLabel('1M Over')
            .setStyle(ButtonStyle.Danger);

        const Button8 = new ButtonBuilder()
            .setCustomId('eight')
            .setLabel('1M Under')
            .setStyle(ButtonStyle.Danger);
        
        
        const row1 = new ActionRowBuilder().addComponents(
            Button1,
            Button2,
            Button3,
            Button4,
        )
        const row2 = new ActionRowBuilder().addComponents(
            Button5,
            Button6,
            Button7,
            Button8
        )

        betData = await getBet(interaction, psn, BetID, line);
        betData = await betModel.findOne({$and: [{betId: BetID},{serverId: interaction.guild.id}]});

        gambleEmbed
            .setTitle('Betting line for ' + betData.playerName + ' is ' + betData.betLine)
            .setTimestamp()
            .setFooter({text: "Betting line closes in 3 mins from:"})

        await interaction.editReply({embeds: [gambleEmbed], components: [row1, row2]});

        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            time: 1000 * 180,
        });
        //#endregion

        //#region saving under and over bets
        collector.on("collect", async (i) => {

            profileData = await getProfile(i);
            await i.deferReply({ephemeral: true})

            if(profileData.debt == false)
            {
                try {
                    if(i.customId === 'one')
                    {
                        overButtonHandler(i, BetID, profileData, 5);
                    }
                    if(i.customId === 'two')
                    {
                        underButtonHandler(i, BetID, profileData, 5);
                    }
                    if(i.customId === 'three')
                    {
                        overButtonHandler(i, BetID, profileData, 50)
                    }
                    if(i.customId === 'four')
                    {
                        underButtonHandler(i, BetID, profileData, 50)
                    }
                    if(i.customId === 'five')
                    {
                        overButtonHandler(i, BetID, profileData, 100)
                    }
                    if(i.customId === 'six')
                    {
                        underButtonHandler(i, BetID, profileData, 100)
                    }
                    if(i.customId === 'seven')
                    {
                        overButtonHandler(i, BetID, profileData, 1000)
                    }
                    if(i.customId === 'eight')
                    {
                        underButtonHandler(i, BetID, profileData, 1000)
                    }
                    
                } 
                catch (error) {
                    console.log(error)   
                }
            }else{
                await interaction.followUp(`<@${interaction.user.id}> you're in debt. Get ya money up before you bet bitch.`, {ephermal: true})
            }
        });

        collector.on('end', async (i) =>{
            row1.components[0].setDisabled(true);
            row1.components[1].setDisabled(true);
            row1.components[2].setDisabled(true);
            row1.components[3].setDisabled(true);
            row2.components[0].setDisabled(true);
            row2.components[1].setDisabled(true);
            row2.components[2].setDisabled(true);
            row2.components[3].setDisabled(true);

            await getBettorsEmbed(interaction, interactionMessage, betData, row1, row2);

        })
        
        //#endregion
        
        //#region determing outcome

        intervalId = setInterval(async () => await finishBet(interaction, betData, interactionMessage, psn, arr,  outcome, intervalId, latestBetWillLast, betLastedTooLong), 
                                    60000)
        
         //#endregion
    
        await reset(interaction, BetID);    
    },

};

async function overButtonHandler(i, BetID, profileData, betMultiplier){
    let bettor =  await betOverHandler(i,BetID, betMultiplier);
    let amount = (bettor.betOver + betMultiplier) * 1000;

    if(amount > (profileData.coins * 2.5)){
        await i.followUp(`<@${i.user.id}> too high of a bet for you`);
    }
    else{
        await i.followUp(`<@${i.user.id}> placed a ${await numberWithCommas(amount)} on the over.`);
        await wait(4000);
        await i.deleteReply();
    }
}

async function underButtonHandler(i, BetID, profileData, betMultiplier){
    let bettor =  await betUnderHandler(i,BetID, betMultiplier);
    let amount = (bettor.betUnder + betMultiplier) * 1000;

    if(amount > (profileData.coins * 2.5)){
        await i.followUp(`<@${i.user.id}> too high of a bet for you`);
    }else{
        await i.followUp(`<@${i.user.id}> placed a ${await numberWithCommas(amount)} on the under.`);
        await wait(4000);
        await i.deleteReply();
    }
}
