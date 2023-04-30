const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const profileModel = require("../models/profileSchema");
const{checkForDebt} = require("../logic/checkForDebt");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("admin")
        .setDescription("All my masters commands")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => 
            subcommand
                .setName("add")
                .setDescription("Add coins to user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user getting the coins")
                        .setRequired(true)
                )
                .addIntegerOption((option) => 
                    option
                        .setName("amount")
                        .setDescription("The amount of coins to add")
                        .setRequired(true)
                        .setMinValue(1)
                ) 
        )
        .addSubcommand((subcommand) => 
            subcommand
                .setName("sub")
                .setDescription("Subtract coins to user")
                .addUserOption((option) => 
                    option
                        .setName("user")
                        .setDescription("The user getting the coins")
                        .setRequired(true)
                )
                .addIntegerOption((option) => 
                    option
                        .setName("amount")
                        .setDescription("The amount of coins to subtract")
                        .setRequired(true)
                        .setMinValue(1)
                ) 

        ),

    async execute(interaction){
        await interaction.deferReply();
        const adminSubCommand = interaction.options.getSubcommand();

        if(adminSubCommand === "add")
        {
            await adminAdd(interaction);
            await checkForDebt(interaction);
        }
        if(adminSubCommand === "sub")
        {
            await adminSub(interaction);
            await checkForDebt(interaction);
        }

        
    }
}

async function adminAdd(interaction){
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    await profileModel.findOneAndUpdate(
        {$and: [{userId: user.id}, {serverId: interaction.guild.id}]},
        {
            $inc: {
                coins: amount, 
            }
        }
    );
    await interaction.editReply(`Added $${amount} to <@${user.id}>'s bank`);
}

async function adminSub(interaction){
    const user = interaction.options.getUser("user");
    const amount = interaction.options.getInteger("amount");

    await profileModel.findOneAndUpdate(
        {$and: [{userId: user.id}, {serverId: interaction.guild.id}]},
        {
            $inc: {
                coins: -amount, 
            }
        }
    );

    await interaction.editReply(`Subtracted $${amount} from <@${user.id}>'s bank`);
}
