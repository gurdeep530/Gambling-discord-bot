const {SlashCommandBuilder} = require("discord.js");
const profileModel = require("../models/profileSchema");
const{checkForDebt} = require("../logic/checkForDebt");
const {numberWithCommas} = require("../logic/miscellaneousLogic");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("donate")
        .setDescription("Give money to a broke boy.")
        .addUserOption((option) => 
            option 
                .setName("user")
                .setDescription("The broke person.")
                .setRequired(true)
        )
        .addIntegerOption((option) => 
            option 
                .setName("amount")
                .setDescription("donation amount")    
                .setRequired(true)
                .setMinValue(1)
        ),

    async execute(interaction, profileData){
        const receiver = interaction.options.getUser("user");
        const donateAmt = interaction.options.getInteger("amount");

        const { coins } = profileData;

        if(coins < donateAmt) {
            await interaction.deferReply()
            return await interaction.editReply(
                "your too broke to donate buh."
            )
        }

        const receiverUserData = await profileModel.findOneAndUpdate(
        {$and: [{userId: receiver.id}, {serverId: interaction.guild.id}]},
        {  
            $inc: {
                coins: donateAmt,
            },
        });

        if(!receiverUserData){
            await interaction.deferReply({ephermal: true});
            return await interaction.editReply(`<@${receiver.id}> doesn't exist in the currency system.`);
        }

        await interaction.deferReply();

        await profileModel.findOneAndUpdate(
            {$and:[{userId: interaction.user.id}, {serverId: interaction.guild.id}]},
            {   
                $inc: {
                    coins: -donateAmt,
                },
            }
        );

        await checkForDebt(interaction);

        await interaction.editReply(
            `<@${receiver.id}>received $${await numberWithCommas(donateAmt)} from <@${interaction.user.id}>`
        )
    },
};