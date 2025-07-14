
let rouletteChoices =  [
    {name:'red', value: 1, id: 0},{name:'black', value: 1, id: 0},{name:'green', value: 36, id: 0},
    {name:'even', value:1, id: 9},{name:'odd', value: 1, id: 9},
    {name:'1-18', value:1, id: 10},{name:'19-26', value: 1, id: 10},
    {name:'0', value: 36, id: 1},{name:'1', value: 36, id: 1},{name:'2', value: 36, id: 1},{name:'3', value: 36, id: 1},
    {name:'4', value: 36, id: 1},{name:'5', value: 36, id: 1},{name:'6', value: 36, id: 1},{name:'7', value: 36, id: 1},
    {name:'8', value: 36, id: 1},{name:'9', value: 36, id: 1},{name:'10', value: 36, id: 1},{name:'11', value: 36, id: 1},
    {name:'12', value: 36, id: 1},{name:'13', value: 36, id: 1},{name:'14', value: 36, id: 1},{name:'15', value: 36, id: 1},
    {name:'16', value: 36, id: 1},{name:'17', value: 36, id: 1},{name:'18', value: 36, id: 1},{name:'19', value: 36, id: 1}, 
    {name:'20', value: 36, id: 1},{name:'21', value: 36, id: 1},{name:'22', value: 36, id: 1},{name:'23', value: 36, id: 1},
    {name:'24', value: 36, id: 1},{name:'25', value: 36, id: 1},{name:'26', value: 36, id: 1},{name:'27', value: 36, id: 1},
    {name:'28', value: 36, id: 1},{name:'29', value: 36, id: 1},{name:'30', value: 36, id: 1},{name:'31', value: 36, id: 1},
    {name:'32', value: 36, id: 1},{name:'33', value: 36, id: 1},{name:'34', value: 36, id: 1},{name:'35', value: 36, id: 1},
    {name:'36', value: 36, id: 1},

    {name:'red odd 1-18', value: 3, id: 2},{name:'black odd 1-18', value: 3, id: 2},
    {name:'red even 1-18', value: 3, id: 2},{name:'black even 1-18', value: 3, id: 2},
    {name:'red odd 19-36', value: 3, id: 2},{name:'black odd 19-36', value: 3, id: 2},
    {name:'red even 19-36', value: 3, id: 2},{name:'black even 19-36', value: 3, id: 2},

    {name:'red odd', value: 2, id: 3},{name:'red even', value: 2, id: 3},
    {name:'black odd', value: 2, id: 3},{name:'black even', value: 2, id: 3},

    {name:'odd 1-18', value: 2, id: 4},{name:'even 1-18', value: 2, id: 4},
    {name:'odd 19-36', value: 2, id: 4},{name:'even 19-36', value: 2, id: 4},

    {name:'red 1-18', value: 2, id: 5},{name:'black 1-18', value: 2, id: 5},
    {name:'red 19-36', value: 2, id: 5},{name:'black 19-36', value: 2, id: 5},

    {name:'green 0', value: 72, id: 6},
    {name:'red 1', value: 37, id: 7}, {name:'red 2', value: 37, id: 7},{name:'red 3', value: 37, id: 7},
    {name:'red 4', value: 37, id: 7}, {name:'red 5', value: 37, id: 7},{name:'red 6', value: 37, id: 7},
    {name:'red 7', value: 37, id: 7}, {name:'red 8', value: 37, id: 7},{name:'red 9', value: 37, id: 7},
    {name:'red 10', value: 37, id: 7}, {name:'red 11', value: 37, id: 7},{name:'red 12', value: 37, id: 7},
    {name:'red 13', value: 37, id: 7}, {name:'red 14', value: 37, id: 7},{name:'red 15', value: 37, id: 7},
    {name:'red 16', value: 37, id: 7}, {name:'red 17', value: 37, id: 7},{name:'red 18', value: 37, id: 7},
    {name:'red 19', value: 37, id: 7}, {name:'red 20', value: 37, id: 7},{name:'red 21', value: 37, id: 7},
    {name:'red 22', value: 37, id: 7}, {name:'red 23', value: 37, id: 7},{name:'red 24', value: 37, id: 7},
    {name:'red 25', value: 37, id: 7}, {name:'red 26', value: 37, id: 7},{name:'red 27', value: 37, id: 7},
    {name:'red 28', value: 37, id: 7}, {name:'red 29', value: 37, id: 7},{name:'red 30', value: 37, id: 7},
    {name:'red 31', value: 37, id: 7}, {name:'red 32', value: 37, id: 7},{name:'red 33', value: 37, id: 7},
    {name:'red 34', value: 37, id: 7}, {name:'red 35', value: 37, id: 7},{name:'red 36', value: 37, id: 7},

    {name:'black 1', value: 37, id: 8}, {name:'black 2', value: 37, id: 8},{name:'black 3', value: 37, id: 8},
    {name:'black 4', value: 37, id: 8}, {name:'black 5', value: 37, id: 8},{name:'black 6', value: 37, id: 8},
    {name:'black 7', value: 37, id: 8}, {name:'black 8', value: 37, id: 8},{name:'black 9', value: 37, id: 8},
    {name:'black 10', value: 37, id: 8}, {name:'black 11', value: 37, id: 8},{name:'black 12', value: 37, id: 8},
    {name:'black 13', value: 37, id: 8}, {name:'black 14', value: 37, id: 8},{name:'black 15', value: 37, id: 8},
    {name:'black 16', value: 37, id: 8}, {name:'black 17', value: 37, id: 8},{name:'black 18', value: 37, id: 8},
    {name:'black 19', value: 37, id: 8}, {name:'black 20', value: 37, id: 8},{name:'black 21', value: 37, id: 8},
    {name:'black 22', value: 37, id: 8}, {name:'black 23', value: 37, id: 8},{name:'black 24', value: 37, id: 8},
    {name:'black 25', value: 37, id: 8}, {name:'black 26', value: 37, id: 8},{name:'black 27', value: 37, id: 8},
    {name:'black 28', value: 37, id: 8}, {name:'black 29', value: 37, id: 8},{name:'black 30', value: 37, id: 8},
    {name:'black 31', value: 37, id: 8}, {name:'black 32', value: 37, id: 8},{name:'black 33', value: 37, id: 8},
    {name:'black 34', value: 37, id: 8}, {name:'black 35', value: 37, id: 8},{name:'black 36', value: 37, id: 8},
    ];


let playerNames = [  {name:'Gurdeep', value:'Goldendeep'}, 
                    {name:'Gursi', value:'Papi2raw'},
                    {name:'Ranjit', value:'Theloneranjer'},
                    {name:'Jaybir', value:'Ogicecreamman'},
                    {name:'Amreet', value:'LickMyToto'},
                    {name:'Amitpal', value:'slamitpal'},
                    {name:'Vish', value:'Travishscott'},
                    {name:'Jasjit', value:'Jpmann24'},
                    {name:'Karandeep', value:'UntappdP0t3ntal'},
                    {name:'Gurvinder', value:'Lonelygangster'},
                    {name:'Aaron', value:'PhilosopherJatt'},
                    {name:'Neehal', value:'iiconspiracies'},
                    {name:'Atif', value:'supermaniphone6'},
                    {name:'Parm', value:'parm3016'},
                    {name:'Sahil', value:'Mr_4thquarter2'},
                    {name:'DojaPhat', value:'Dojaphat'},
                    {name:'Tajji', value:'ancient-replayys'},
                    {name:'Jassilassi', value:'jassilassi'},
                    {name:'StealYoKills', value:'StealYoKills'},
                    {name:'Gurdeeps smurf', value:'oglcecreamman'},
                    {name:'LickMyphudi', value:'lickmyphudi'}
                ]

exports.playerNames = playerNames;
exports.rouletteChoices = rouletteChoices;
exports.autoComplete = async function (interaction, choices)
{
    const focusedValue = interaction.options.getFocused();

    const filtered = choices.filter(choice => choice.name.startsWith(focusedValue.toLowerCase()));

    let options;
    if (filtered.length > 25) {
        options = filtered.slice(0, 25);
    } else {
        options = filtered;
    }

    await interaction.respond(
        options.map(choice => ({ name: choice.name, value: choice.name})),
    );
}

