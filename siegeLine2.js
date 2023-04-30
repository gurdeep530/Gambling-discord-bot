const {finishBet, executeScrappers, reset, getBet, getProfile, betOverHandler, betUnderHandler} = require('../logic/siegeLineLogic')
const{SlashCommandBuilder, ButtonStyle} = require('discord.js');
const {profileSchema} = require("../models/profileSchema")
const {EmbedBuilder, ActionRowBuilder, ButtonBuilder} = require("@discordjs/builders")
const bettorModel = require("../models/bettorSchema")
const betModel = require("../models/betSchema")
require('events').EventEmitter.defaultMaxListeners = 45;

//each game with betting will have a different ID that will increment by 1 with every new game.
//0 is reserved for r6 lines.
var BetID = 1;  
var betData;
var intervalId;
var psn;
var line;
var outcome = null;
var latestBetWillLast = 2700 * 1000;
var betLastedTooLong = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('siegeline2')
        .setDescription("Create another line for a player")
        .addStringOption((option) => 
            option
            .setName('psn')
            .setDescription('psn name')
            .setRequired(true)
            ),
            
    async execute(interaction) {
        const interactionMessage = await interaction.deferReply({fetchReply: true});

        reset(interaction, BetID);

        //#region determine line
        psn = interaction.options.getString('psn');
        let arr = await executeScrappers(psn);
        line = arr[2];
        line = (Math.round(line)) +.5;
        //#endregion

        //#region betting menu
        const gambleEmbed = new EmbedBuilder().setColor(0x00aa6d);
        let fiveMins = 300000;

        const Button1 = new ButtonBuilder()
            .setCustomId('one')
            .setLabel('Over')
            .setStyle(ButtonStyle.Primary);

        const Button2 = new ButtonBuilder()
            .setCustomId('two')
            .setLabel('Under')
            .setStyle(ButtonStyle.Primary);
        
        const row = new ActionRowBuilder().addComponents(
            Button1,
            Button2
        )

        betData = await getBet(interaction, psn, BetID, line);
        betData = await betModel.findOne({$and: [{betId: BetID},{serverId: interaction.guild.id}]});

        gambleEmbed
            .setTitle('Betting line for ' + betData.playerName + ' is ' + betData.betLine)
            .setDescription('Each button press is 5,000 dollar bet. For a custom bet use /placebet.')
            .setTimestamp()
            .setFooter({text: "Betting line closes in 3 mins from:"})

        await interaction.editReply({embeds: [gambleEmbed], components: [row]});

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
                        betOverHandler(i,BetID);

                        await i.followUp(`<@${i.user.id}> placed a bet on the over.`);
                    }
                    if(i.customId === 'two')
                    {
                        betUnderHandler(i,BetID)
                        
                        await i.followUp(`<@${i.user.id}> placed a bet on the under.`);
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
            gambleEmbed.setFooter({text:'Betting line closed.'});
            row.components[0].setDisabled(true);
            row.components[1].setDisabled(true);

            await interaction.editReply({embeds: [gambleEmbed], components: [row]});

        })
        
        //#endregion
        
        //#region determing outcome

        intervalId = setInterval(() => 
                                    finishBet(interaction, betData, interactionMessage, psn, arr,  outcome, intervalId, latestBetWillLast, betLastedTooLong), 
                                    60000)
        
         //#endregion
    
        await reset(interaction, BetID);    
    },

};