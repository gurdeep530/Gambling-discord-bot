

exports.getBetAmount = async function(interaction, profileData){
    let betAmount;
    if(interaction.options.getString('amount').includes('-'))
    {
        return -1;
    }
    if(interaction.options.getString('amount') == 'all')
        {betAmount = profileData.coins;}

    else if(interaction.options.getString('amount').includes(','))
        {betAmount = parseInt(interaction.options.getString('amount').replace(',', ''));}

    else
        {betAmount = parseInt(interaction.options.getString('amount'));}

    if((betAmount/profileData.coins) >= 2){return null}
    else{return betAmount};
}