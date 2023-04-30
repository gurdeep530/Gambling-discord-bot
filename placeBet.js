const {SlashCommandBuilder} = require("discord.js");
const {betOverHandler, betUnderHandler} = require('../logic/siegeLineLogic');
const {getBetAmount} = require('../logic/getBetAmount');
const {numberWithCommas} = require("../logic/miscellaneousLogic");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("placebet")
        .setDescription('Place a bet on one of the SiegeLines')
        .addStringOption((option) =>
            option
                .setName('amount')
                .setDescription('Bet Amount')
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName('bet-type')
                .setDescription('Type U for Under or O for Over')
                .setRequired(true)
        )
        .addIntegerOption((option) =>
            option
                .setName('line-number')
                .setDescription('Number of the line you want to bet on.')
                .setRequired(true)
        ),
    async execute(interaction, profileData){
        await interaction.deferReply({ephemeral: true});
        
        let betAmount, betId, betType;
        betAmount = await getBetAmount(interaction, profileData);
        if(betAmount != null && betAmount != -1)
        {

            betId = interaction.options.getInteger('line-number') - 1;
            betType = interaction.options.getString('bet-type').toLowerCase();
    
            if(betType =='o' || betType == 'over')
            {
                betOverHandler(interaction, betId, betAmount, betType);
                await interaction.editReply(await numberWithCommas(betAmount) + ' dollars place on over for siegeline'+ (betId+1) +'.');

            }else if( betType == 'u' || betType == 'under')
            {
                betUnderHandler(interaction, betId, betAmount, betType);
                await interaction.editReply(await numberWithCommas(betAmount) + ' dollars place on under for siegeline'+ (betId+1) +'.');

            }else {
                await interaction.editReply("Couldn't understand if you wanted to bet on the under or over. Try again." );
            }
        }else if(betAmount == -1)
        {
            await interaction.reply(`fuck off <@${interaction.user.id}>`)
        }
        else{
            await interaction.editReply(`too high of a bet for you <@${interaction.user.id}>`);
        }


    }
}