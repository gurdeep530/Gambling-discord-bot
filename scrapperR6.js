const puppeteer = require('puppeteer')
const {getRandomInt} = require('../logic/miscellaneousLogic')

var matches = new Array();
var wins = new Array();
var kills = new Array();
var avgKillMatch = new Array();


exports.scrapeAverageMatchStats = async function(url){
    
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url,{timeout: 0});

    const rankbtn = '//*[@id="profile"]/div[2]/div/div[1]/div[1]/div/div/div[4]';

    try {
        await page.click('xpath/'+rankbtn);
    } catch (error) {
        console.log('Scrapper could not find Rank button\n' + error)
    }

    for(i = 0; i <= 5; i++){
        let txtMatches, rawMatches, el;

        [el] = await page.$x('//*[@id="profile"]/div[3]/section/div['+(2+i)+']/div[1]/h2');
        if(!el == false)
        {
            txtMatches = await el.getProperty('textContent');
            rawMatches = await txtMatches.jsonValue(); 
        }else{
            rawMatches = null;
        }

        let el2, txt, rawTxt;

        [el2] = await page.$x('//*[@id="profile"]/div[3]/section/div['+(2+i)+']/div[1]/div');
        if(!el2 == false)
        {
            txt = await el2.getProperty('textContent')
            rawTxt = await txt.jsonValue();
        }else{
            rawTxt = null;
        }

        matches[i] = await getMatches(rawMatches);
        wins[i] = await getWins(rawTxt);
        kills[i] = await getKills(rawTxt);

        if(kills[i] != null && matches[i] != null)
            avgKillMatch[i] = kills[i] / matches[i];

    }

    return lineAdjustor(avgKillMatch);
    
}

async function lineAdjustor(avgKillMatch)
{
    let adjustor, line = 0, realElCounter = 0, todayAdjustor = false;

    avgKillMatch.forEach(el => {
        if(el != null)
        {
            line += el;
            realElCounter++
        }
    });
    
    line = line / (realElCounter);
    console.log('Average: ' + line)

    if(((line - avgKillMatch[0]) > 2) && (avgKillMatch[0] < line))
    {
        adjustor = await getRandomInt(0,2);
        line -= adjustor;    
        todayAdjustor = true

    }else if(((line - avgKillMatch[0]) < 0) && (avgKillMatch[0] > line))
    {
        adjustor = await getRandomInt(1,3);
        line += adjustor;
        todayAdjustor = true
    }

    if(line >= 4 && line <= 7 && todayAdjustor == false)
    {
        adjustor = await getRandomInt(0,2);

        if(adjustor == 0)
        {
            if(await getRandomInt(0,3) >= 1){
                adjustor = 1;
            }
        }

        opDeterminer = await getRandomInt(0,5)
        if( opDeterminer <= 2 )
            {line += adjustor;}
        else if( opDeterminer >= 2 && opDeterminer <= 4 )
            {line -= adjustor;}
       

    }else if(line > 4 && todayAdjustor == false)
    {
        adjustor = await getRandomInt(0,2);

        if(adjustor == 0)
        {
            if(await getRandomInt(0,3) >= 1){
                adjustor = 1;
            }
        }

        opDeterminer = await getRandomInt(0,3)
        if( opDeterminer == 0 )
            {line += adjustor;}
        else if( opDeterminer == 1)
            {line -= adjustor;}
       
    }

    if(line > 10)
    {
        line = 9
    }else if (line < 0 )
    {
        line = 0;
    }
    return line;
}


async function getMatches(rawMatches) {

    if(!rawMatches == false && rawMatches != null){
        let match;
        if(parseInt(rawMatches[rawMatches.indexOf('-') + 4]) != 'M' || parseInt(rawMatches[rawMatches.indexOf('-') + 4]) != ' ')
            match = parseInt(rawMatches[rawMatches.indexOf('-') + 2].concat(rawMatches[rawMatches.indexOf('-') + 3]).concat(rawMatches[rawMatches.indexOf('-') + 4]));
        else{
            match = parseInt(rawMatches[rawMatches.indexOf('-') + 2].concat(rawMatches[rawMatches.indexOf('-') + 3]));
        }
        return match;
    }else {
        return null;
    }
}

async function getWins(rawTxt)
{
    if(!rawTxt == false && rawTxt != null)
        return parseInt(rawTxt[rawTxt.indexOf('W')+5].concat(rawTxt[rawTxt.indexOf('W')+6]))
    else{
        return null;
    }
}

async function getKills(rawTxt)
{
    if(!rawTxt == false && rawTxt != null){
        let kill;
        if(parseInt(rawTxt[rawTxt.indexOf('K') + 8]) != ' ' || parseInt(rawTxt[rawTxt.indexOf('K') + 8]) != 'K')
        {
            kill = parseInt(rawTxt[rawTxt.indexOf('K') + 6].concat(rawTxt[rawTxt.indexOf('K') + 7]).concat(parseInt(rawTxt[rawTxt.indexOf('K') + 8])));
        }else
            kill = parseInt(rawTxt[rawTxt.indexOf('K') + 6].concat(rawTxt[rawTxt.indexOf('K') + 7]));
        return kill;
    }
    else
        return null;
}





