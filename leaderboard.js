const {SlashCommandBuilder} = require("discord.js");
const { EmbedBuilder } = require("@discordjs/builders");
const profileModel = require("../models/profileSchema");
const {numberWithCommas} = require("../logic/miscellaneousLogic")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lb")
        .setDescription("Leaderboard for Top 10."),

    async execute(interaction, profileData){
        await interaction.deferReply();

        const { username, id } = interaction.user;
        const { coins } = profileData;
        
        let leaderboardEmbed = new EmbedBuilder()
            .setTitle("Top 10 Rich Folk")
            .setColor(0x45d6fd)
            .setFooter({text: "You are not ranked yet"});

        const members = await profileModel
            .find({serverId: interaction.guild.id})
            .sort({coins: -1})
            .catch((err) => console.log(err));

        const memberIdx = members.findIndex((member) => member.userId === id);

        leaderboardEmbed.setFooter({
            text: (username + ', your rank is '+ (memberIdx + 1) + ' with ' +  await numberWithCommas(coins) + ' coins.')
        });

        const topTen = members.slice(0,10);

        let desc = "";
        for(let i = 0; i< topTen.length; i++)
        {
            let { user } = await interaction.guild.members.fetch(topTen[i].userId);
            if(!user) return;
            let userCoins = topTen[i].coins;
            desc += (i+1) + ". " + user.username + ": $" + await numberWithCommas(userCoins) + " \n";
        }
        if(desc !== ""){
            leaderboardEmbed.setDescription(desc);
        }

        await interaction.editReply({embeds: [leaderboardEmbed]});
    }
}