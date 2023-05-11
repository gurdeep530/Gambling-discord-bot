const { Events } = require("discord.js");
const profileModel = require("../models/profileSchema")
 
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand()){
        
        let profileData;
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
 
        const command = interaction.client.commands.get(interaction.commandName);
 
        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }
 
        try {
            await command.execute(interaction, profileData);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
        }
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
    
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
    
            try {
                await command.autocomplete(interaction);
            } catch (error) {
                console.error(error);
            }
        }
    },
};
