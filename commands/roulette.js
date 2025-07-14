const {SlashCommandBuilder, EmbedBuilder} = require("discord.js");
const {numberWithCommas, getRandomInt} = require("../logic/miscellaneousLogic");
const {getBetAmount} = require('../logic/getBetAmount');
const { updateGameBets } = require("../logic/gamesLogic");
const {autoComplete, rouletteChoices} = require('../logic/autoComplete')

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roulette")
        .setDescription('Play a game of Roulette')
        .addStringOption((option) =>
            option
            .setName('amount')
            .setDescription(`Amount you want to bet or 'half' or 'all'`)
            .setRequired(true)
        )
        .addStringOption((option) =>
            option
            .setName('space')
            .setDescription('The space to bet on. Even/Odd, Red/Black, 1-18/19-36 or random number.')
            .setRequired(true)
            .setAutocomplete(true)
        ),
    async autocomplete(interaction){

        await autoComplete(interaction, rouletteChoices)
    },
    async execute(interaction, profileData){
        let results = await rouletteAlg(interaction, profileData);
        
        let bet = await getBetAmount(interaction, profileData);
        if(bet == null)
        {
            await interaction.reply(`too high of a bet for you <@${interaction.user.id}>.`)
        }else{
            let rouletteEmbed = await executeRouletteGame(interaction, profileData, results, bet)

            await interaction.reply({embeds: [rouletteEmbed]});
        }
    }
}

async function executeRouletteGame(interaction, profileData, results, bet)
{
    let betMultiplier = results[4];
    let classification = results[3];
    let color = results[2];
    let number = results[1];
    let entry = results[0];
    let win;

    let winMessage = `<@${interaction.user.id}> congratulation, you won ${await numberWithCommas(bet * betMultiplier)} dollars, your balance is ${await numberWithCommas(profileData.coins + (bet * betMultiplier))}`
    let loseMessage = `<@${interaction.user.id}> you lost ${await numberWithCommas(bet)} dollars, your balance is ${await numberWithCommas(profileData.coins - (bet))}`
    
    let rouletteEmbed = new EmbedBuilder()
                        .setColor('Random')
                        .setAuthor({name:`${interaction.user.tag}`, iconURL:`${interaction.user.displayAvatarURL()}`})
                        .setTitle('Roulette')
                        .setTimestamp()

    if(betMultiplier != -1)
    {
        rouletteEmbed.setDescription(winMessage)
        win = true;
    }
    else
    {
        rouletteEmbed.setDescription(loseMessage)
        win = false
    }

    rouletteEmbed.addFields(
        {name: `Your Bet:`, value: `${await numberWithCommas(bet)} on ${entry}`, inline: true},
        {name: `Spin Result:`, value: `Landed on ${color} ${number}.`, inline: true}
    )

    await updateGameBets(interaction, bet, win, betMultiplier);

    return rouletteEmbed;
}

async function rouletteAlg(interaction)
{   
    //1-18 red and 19-36 is black
    let color = await getRandomInt(0,36);
    let number = await getRandomInt(0,36);
    let numbersBetween;
    let classification;
    let betMultiplier;
    let entry  = interaction.options.getString('space');
    
    if(color <= 18){color = 'red'}
    else if(color > 18){color = 'black'}
    else if(color == 0 || number == 0){ color ='green' }

    if(number % 2 == 0){classification = 'even'}
    else{classification = 'odd'}

    if(number <= 18 && number != 0)
        {numbersBetween = '1-18'}
    else{numbersBetween = '19-36'}

    let map = new Map(rouletteChoices.map(el => {return[el.name, [el.value, el.id]]}))

    betMultiplier = await rouletteSwitchCase(map, entry, number, classification, color, numbersBetween);

    return [entry, number, color, classification, betMultiplier];

}

async function rouletteSwitchCase(map, entry, number, classification, color, numbersBetween)
{
    let id = map.get(entry)[1];
    let betMultiplier = -1;
    switch (id) {
        case 0:
            if(entry == color)
                betMultiplier = map.get(entry)[0];
            break;
        case 9:
            if(entry == classification)
                betMultiplier = map.get(entry)[0];
            break;
        case 10:
            if(entry == numbersBetween)
                betMultiplier = map.get(entry)[0];
            break;
        case 1:
            if(entry == number)
                betMultiplier = map.get(entry)[0];
            break; 
        case 2:
            console.log(color.concat(" ",classification).concat(" ",numbersBetween))
            if(entry == color.concat(" ",classification).concat(" ",numbersBetween))
                betMultiplier = map.get(entry)[0];
            break;
        case 3:
            console.log(color.concat(" ",classification));
            if(entry == color.concat(" ",classification))
                betMultiplier = map.get(entry)[0];
            break;
        case 4:
            console.log(classification.concat(" ",numbersBetween));
            if(entry == classification.concat(" ",numbersBetween))
                betMultiplier = map.get(entry)[0];
            break; 
        case 5:
            console.log(color.concat(" ",numbersBetween))
            if(entry == color.concat(" ",numbersBetween))
                betMultiplier = map.get(entry)[0];
            break;
        case 6,7,8:
            console.log(color.concat(" ",number))
            if(entry == color.concat(" ",number))
                betMultiplier = map.get(entry)[0];
            break; 
        default:
            betMultiplier = -1;
            break;
    }

    return betMultiplier;
}