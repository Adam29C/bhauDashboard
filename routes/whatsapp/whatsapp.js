const Provider = require("../../model/games/Games_Provider");
const GameSettings = require("../../model/games/AddSetting");
const gameRate = require("../../model/games/GameList");
const digits = require("../../model/digits");
const gameBids = require("../../model/games/gameBids");
const moment = require("moment");
const axios = require("axios");
const pannaDigits = require("../../model/digits");

const whatsAppHandler = async function (
  str,
  total,
  session,
  varient,
  provider,
  mobile
) {

  const url = `https://graph.facebook.com/v17.0/203391342863130/messages`;
  const token = process.env.WHATSAPP_TOKEN;
  const body = {
    messaging_product: "whatsapp",
    to:mobile,
    type: "template",
    template: {
      name: varient == "Single" ? "user_bid10":"user_pana20",
      language: {
        code: "en",
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: provider + " (" + session + ") " + varient, //Type Name
            },
            ...str,
            {
              type:'text',
              text:`${total}`
            }
          ],
        },
      ],
    },
  };
  const headers = { authorization: "Bearer " + token };
  try{
    const response = await axios.post(url+"", body, { headers: headers });
  }catch(err){
    console.log("Whatsapp", err.message)
  }
};

async function getAllProviders(providerId) {
  const allProviders = await Provider.findOne({ _id: providerId });
  return allProviders;
}

async function getGameSetting(time) {
  
  const date = new Date();
  const day = date.toLocaleDateString("en-US", { weekday: "long" });
  const allSettingsOpen = await GameSettings.find({
    gameDay: day,

    OBT: time,
  });
  const allSettingsClose = await GameSettings.find({
    gameDay: day,

    CBT: time,
  });

  let allSettings = [];
  if (allSettingsOpen.length) {
    allSettings = [...allSettingsOpen];
  } else if (allSettingsClose.length) {
    allSettings = [...allSettingsClose];
  }

  if (allSettings.length == 0) {
    // Time not matched
    return;
  }

  const promiseArray = [];

  for (let setting of allSettings) {
    const pend = getAllProviders(setting.providerId);
    promiseArray.push(pend);
  }

  const providersAll = await Promise.all(promiseArray);

  const allMobiles = [];
  const openBids = [];
  const closeBids = [];

  if (providersAll.length > 0 && !providersAll.includes(null)) {
    for (const p of providersAll) {
      if (p.mobile) {
        const mobs = p.mobile.split(",");
        allMobiles.push(...mobs);
        const todayDate = moment().format("MM/DD/YYYY");
        // const todayDate = "03/29/2024";
        const open = await commonQuery(p._id, todayDate, "Open");
        const close = await commonQuery(p._id, todayDate, "Close");
        open.providerId = p._id;
        open.providerName = p.providerName;

        close.providerId = p._id;
        close.providerName = p.providerName;

        open.date = todayDate;
        close.date = todayDate;

        openBids.push(open);
        closeBids.push(close);
      }
    }
  }

  for (const mobile of allMobiles) {
    if (openBids.length > 0 && allSettingsOpen.length > 0) {
      // Generate Data
      for (const bid of openBids) {
        if (bid.status) {
          const openFinalData = await evaluateData(
            bid,
            bid.providerId,
            bid.date
          );
          const finalCuttingSingleDigits = prepareCutting(openFinalData,'Single');
          const finalCuttingPannaDigits = prepareCutting(openFinalData,'Panna');
          const whatsKeysForSingle= prepareKeysForWhatsapp(finalCuttingSingleDigits);
          const whatsKeysForPanna= prepareKeysForWhatsapp(finalCuttingPannaDigits);
          // openFinalData.finalData.panaArray = preparePanna(openFinalData.finalData.panaArray);
          // const finalSingleDigitString = generateDataForSingle(
          //   openFinalData.finalData.singleDigitArray
          // );
          // const pannaDigitString = generateDataForPanna(
          //   openFinalData.finalData.panaArray
          // );
      
          whatsAppHandler(
            whatsKeysForSingle.whatsKeys.slice(0,10),
            // openFinalData.dataSum.singleDigit,
            whatsKeysForSingle.total,
            "Open",
            "Single",
            bid.providerName,
            mobile
          );
          whatsAppHandler(
            whatsKeysForPanna.whatsKeys.slice(0,20),
            // openFinalData.dataSum.Pana,
            whatsKeysForPanna.total,
            "Open",
            "Panna",
            bid.providerName,
            mobile
          );
        } else {
          // Send WhatsApp Blank Message
          sendBlankWhatsAppMessage(openBids[0].providerName, mobile, "Open");
        }
      }
    }

    if (closeBids.length > 0 && allSettingsClose.length > 0) {
      for (const bid of closeBids) {
        if (bid.status) {
          const openFinalData = await evaluateData(
            bid,
            bid.providerId,
            bid.date
          );
          
          const finalCuttingSingleDigits = prepareCutting(openFinalData,'Single');
          const finalCuttingPannaDigits = prepareCutting(openFinalData,'Panna');
          const whatsKeysForSingle= prepareKeysForWhatsapp(finalCuttingSingleDigits);
          const whatsKeysForPanna= prepareKeysForWhatsapp(finalCuttingPannaDigits);
          // openFinalData.finalData.panaArray = preparePanna(openFinalData.finalData.panaArray)
          // const finalSingleDigitString = generateDataForSingle(
          //   openFinalData.finalData.singleDigitArray
          // );
          // const pannaDigitString = generateDataForPanna(
          //   openFinalData.finalData.panaArray
          // );
          // whatsAppHandler(
          //   finalSingleDigitString,
          //   openFinalData.dataSum.singleDigit,
          //   "Close",
          //   "Single",
          //   bid.providerName,
          //   mobile
          // );
          // whatsAppHandler(
          //   pannaDigitString,
          //   openFinalData.dataSum.Pana,
          //   "Close",
          //   "Panna",
          //   bid.providerName,
          //   mobile
          // );

          whatsAppHandler(
            whatsKeysForSingle.whatsKeys.slice(0,10),
            // openFinalData.dataSum.singleDigit,
            whatsKeysForSingle.total,
            "Close",
            "Single",
            bid.providerName,
            mobile
          );
          whatsAppHandler(
            whatsKeysForPanna.whatsKeys.slice(0,20),
            // openFinalData.dataSum.Pana,
            whatsKeysForPanna.total,
            "Close",
            "Panna",
            bid.providerName,
            mobile
          );
        } else {
          // Send WhatsApp Blank Message
          sendBlankWhatsAppMessage(closeBids[0].providerName, mobile, "Close");
        }
      }
    }
  }
}

async function commonQuery(providerId, date, session) {
  const allBidData = await gameBids.find(
    { providerId: providerId, gameDate: date, gameSession: session },
    { bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 }
  );

  if (Object.keys(allBidData).length != 0) {
    let singleDigitSum = 0;
    let panaSum = 0;
    let panaArray = {};
    let singleDigitArray = {
      0: { digit: "0", biddingPoints: 0 },
      1: { digit: "1", biddingPoints: 0 },
      2: { digit: "2", biddingPoints: 0 },
      3: { digit: "3", biddingPoints: 0 },
      4: { digit: "4", biddingPoints: 0 },
      5: { digit: "5", biddingPoints: 0 },
      6: { digit: "6", biddingPoints: 0 },
      7: { digit: "7", biddingPoints: 0 },
      8: { digit: "8", biddingPoints: 0 },
      9: { digit: "9", biddingPoints: 0 },
    };

    const panaDigit = await digits.find();
    for (index in panaDigit) {
      let key = panaDigit[index].Digit.toString();
      panaArray[key] = {
        digit: key,
        digitFamily: panaDigit[index].DigitFamily,
        biddingPoints: 0,
      };
    }

    for (index in allBidData) {
      let bidDigit = allBidData[index].bidDigit;
      let length = bidDigit.length;
      let points = allBidData[index].biddingPoints;

      if (length == 1) {
        singleDigitSum = singleDigitSum + points;
      }
      if (length == 3) {
        panaSum = panaSum + points;
      }

      switch (length) {
        case 1:
          singleDigitArray[bidDigit]["biddingPoints"] += points;
          break;
        case 3:
          panaArray[bidDigit]["biddingPoints"] += points;
          break;
      }
    }

    let returnData = {
      status: 1,
      singleDigitArray: singleDigitArray,
      panaArray: panaArray,
      panaSum: panaSum,
      singleDigitSum: singleDigitSum,
    };
    return Promise.resolve(returnData);
  } else {
    let returnData = { status: 0 };
    return Promise.resolve(returnData);
  }
}

function generateDataForSingle(singleDigitArray) {
  let str = "";
  let len = Object.keys(singleDigitArray).length;
  let count = 1;
  for (let key in singleDigitArray) {
    count++;
    str =
      str +
      `${key}=${singleDigitArray[key].biddingPoints}${
        len >= count ? ", " : ""
      }`;
  }
  return str;
}

function generateDataForPanna(pannaArray) {
  return generateDataForSingle(pannaArray);
}

async function evaluateData(data, providerId, date) {
  let status = data.status;
  if (status != 0) {
    let panaSum = data.panaSum;
    let singleDigitSum = data.singleDigitSum;
    let panaArray = data.panaArray;
    let singleDigitArray = data.singleDigitArray;

    const allBidDataOC = await gameBids.find(
      {
        providerId: providerId,
        gameDate: date,
        $and: [
          {
            $or: [
              { gameTypeName: "Jodi Digit" },
              { gameTypeName: "Half Sangam Digits" },
              { gameTypeName: "Full Sangam Digits" },
            ],
          },
        ],
      },
      { bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 }
    );

    const rate = await gameRate
      .find(
        {
          $and: [
            {
              $or: [
                { gameName: "Single Pana" },
                { gameName: "Double Pana" },
                { gameName: "Triple Pana" },
              ],
            },
          ],
        },
        { gameName: 1, gamePrice: 1, _id: 0 }
      )
      .sort({ gamePrice: 1 });

    let sp = rate[0]?.gamePrice;
    let dp = rate[1]?.gamePrice;
    let tp = rate[2]?.gamePrice;

    let jodiPrice = 10;

    for (index in allBidDataOC) {
      let bidDigit = allBidDataOC[index].bidDigit;
      let bidPoints = allBidDataOC[index].biddingPoints;
      let splitDigit = bidDigit.split("-");
      let digit = splitDigit[0];
      let length = splitDigit[0].length;

      if (length == 1 || length == 2) {
        singleDigitSum = singleDigitSum + bidPoints;
      } else {
        panaSum = panaSum + bidPoints;
      }
      switch (length) {
        case 1:
          singleDigitArray[digit]["biddingPoints"] += bidPoints;
          break;
        case 2:
          let char0 = parseInt(digit.charAt(0));
          singleDigitArray[char0]["biddingPoints"] += bidPoints;
          break;
        case 3:
          panaArray[digit]["biddingPoints"] += bidPoints;
          break;
      }
    }

    return {
      status: 1,
      message: "success",
      finalData: {
        singleDigitArray: singleDigitArray,
        panaArray: panaArray,
      },
      dataSum: { singleDigit: singleDigitSum, Pana: panaSum },
      price: {
        sp: sp,
        dp: dp,
        tp: tp,
        jodiPrice: jodiPrice,
      },
    };
  } else {
    return {
      status: 0,
      message: "No Data Found",
    };
  }
}

async function sendBlankWhatsAppMessage(provider, mobile, session) {
  let singleDigitArray = {
    0: { digit: "0", biddingPoints: 0 },
    1: { digit: "1", biddingPoints: 0 },
    2: { digit: "2", biddingPoints: 0 },
    3: { digit: "3", biddingPoints: 0 },
    4: { digit: "4", biddingPoints: 0 },
    5: { digit: "5", biddingPoints: 0 },
    6: { digit: "6", biddingPoints: 0 },
    7: { digit: "7", biddingPoints: 0 },
    8: { digit: "8", biddingPoints: 0 },
    9: { digit: "9", biddingPoints: 0 },
  };
  const holdSingleKeys = []
  
  for(const key in singleDigitArray){
    holdSingleKeys.push({ key:key,cutting:0,total: 0})
  }
 const finalSingleDigitString = prepareKeysForWhatsapp(holdSingleKeys);


  const pannaDigitsAll = await pannaDigits.find().sort({ Digit: 1 }).limit(20);
  let pannaStr = "";
  const holdPana =[];

  for (let digit of pannaDigitsAll) {
    holdPana.push({ key:digit.Digit,cutting:0,total: 0})
  }

  pannaStr = prepareKeysForWhatsapp(holdPana);
  whatsAppHandler(
    finalSingleDigitString.whatsKeys,
    0,
    session,
    "Single",
    provider,
    mobile
  );

  whatsAppHandler(pannaStr.whatsKeys, 0, session, "Panna", provider, mobile);
}

function preparePanna(obj){
  const arrayOfPanna =Object.entries(obj);
  arrayOfPanna.sort((a,b)=>{
 
   if(a[1].biddingPoints < b[1].biddingPoints){
     return 1;
   }else if(a[1].biddingPoints > b[1].biddingPoints){
     return -1
   }
   return 0;
 })
 
 const finalObj = {};

 for(let i =0;i<20 ;i++){
   const key = arrayOfPanna[i][0]
   finalObj[key] = arrayOfPanna[i][1];
 }

 return finalObj;
}


function prepareCutting(body, varient=""){
  const singleDigitSum = body.dataSum.singleDigit;
  const panaDigitSum = body.dataSum.Pana;
  let pana220 = body.finalData.panaArray;
  let singleDigit = body.finalData.singleDigitArray;
  let singleDigitPrice = parseFloat(body.price.jodiPrice);
  let total = 0;
  const divideBy =16;
  const singleDigitFinalData = [];
  const pannaFinalData=[]
  let spArray = {
    127: 1,
    136: 1,
    145: 1,
    190: 1,
    235: 1,
    280: 1,
    370: 1,
    389: 1,
    460: 1,
    479: 1,
    569: 1,
    578: 1,
    128: 1,
    137: 1,
    146: 1,
    236: 1,
    245: 1,
    290: 1,
    380: 1,
    470: 1,
    489: 1,
    560: 1,
    579: 1,
    678: 1,
    129: 1,
    138: 1,
    147: 1,
    156: 1,
    237: 1,
    246: 1,
    345: 1,
    390: 1,
    480: 1,
    570: 1,
    589: 1,
    679: 1,
    120: 1,
    139: 1,
    148: 1,
    157: 1,
    238: 1,
    247: 1,
    256: 1,
    346: 1,
    490: 1,
    580: 1,
    670: 1,
    689: 1,
    130: 1,
    149: 1,
    158: 1,
    167: 1,
    239: 1,
    248: 1,
    257: 1,
    347: 1,
    356: 1,
    590: 1,
    680: 1,
    789: 1,
    140: 1,
    159: 1,
    168: 1,
    230: 1,
    249: 1,
    258: 1,
    267: 1,
    348: 1,
    357: 1,
    456: 1,
    690: 1,
    780: 1,
    123: 1,
    150: 1,
    169: 1,
    178: 1,
    240: 1,
    259: 1,
    268: 1,
    349: 1,
    358: 1,
    367: 1,
    457: 1,
    790: 1,
    124: 1,
    160: 1,
    278: 1,
    179: 1,
    250: 1,
    269: 1,
    340: 1,
    359: 1,
    368: 1,
    458: 1,
    467: 1,
    890: 1,
    125: 1,
    134: 1,
    170: 1,
    189: 1,
    260: 1,
    279: 1,
    350: 1,
    369: 1,
    468: 1,
    378: 1,
    459: 1,
    567: 1,
    126: 1,
    135: 1,
    180: 1,
    234: 1,
    270: 1,
    289: 1,
    360: 1,
    379: 1,
    450: 1,
    469: 1,
    478: 1,
    568: 1,
    118: 2,
    226: 2,
    244: 2,
    299: 2,
    334: 2,
    488: 2,
    550: 2,
    668: 2,
    677: 2,
    100: 2,
    119: 2,
    155: 2,
    227: 2,
    335: 2,
    344: 2,
    399: 2,
    588: 2,
    669: 2,
    110: 2,
    200: 2,
    228: 2,
    255: 2,
    336: 2,
    499: 2,
    660: 2,
    688: 2,
    778: 2,
    166: 2,
    229: 2,
    300: 2,
    337: 2,
    355: 2,
    445: 2,
    599: 2,
    779: 2,
    788: 2,
    112: 2,
    220: 2,
    266: 2,
    338: 2,
    400: 2,
    446: 2,
    455: 2,
    699: 2,
    770: 2,
    113: 2,
    122: 2,
    177: 2,
    339: 2,
    366: 2,
    447: 2,
    500: 2,
    799: 2,
    889: 2,
    555: 2,
    600: 2,
    114: 2,
    277: 2,
    330: 2,
    448: 2,
    466: 2,
    556: 2,
    880: 2,
    899: 2,
    115: 2,
    133: 2,
    188: 2,
    223: 2,
    377: 2,
    449: 2,
    557: 2,
    566: 2,
    700: 2,
    116: 2,
    224: 2,
    233: 2,
    288: 2,
    440: 2,
    477: 2,
    558: 2,
    800: 2,
    990: 2,
    117: 2,
    144: 2,
    199: 2,
    225: 2,
    388: 2,
    559: 2,
    577: 2,
    667: 2,
    900: 2,
    "000": 3,
    111: 3,
    222: 3,
    333: 3,
    444: 3,
    555: 3,
    666: 3,
    777: 3,
    888: 3,
    999: 3,
  };

  if(varient=='Single'){
    for(const key in singleDigit){
      const e = singleDigit[key];
      let amountToPay = e.biddingPoints * singleDigitPrice;
      let loss = 0;
      let FinalLoss = 0;
      let pl = amountToPay;
      if (pl > singleDigitSum) {
        //loss
        loss = pl - singleDigitSum;
        FinalLoss = (loss / divideBy).toFixed();
        total = total + parseInt(FinalLoss);
      }
  
      singleDigitFinalData.push({ key:key,cutting:FinalLoss,total: total})
    }
    return singleDigitFinalData;
  }else if(varient=='Panna') {
    let singlePanaPrice = parseInt(body.price.sp);
    let doublePanaPrice = parseInt(body.price.dp);
    let triplePanaPrice = parseInt(body.price.tp);
    let totalSum = 0;
    for(const key in pana220){
      const e = pana220[key];
      let spdptpCheck = spArray[key];
      let amountToPay = 0;
      let bidPoints = e.biddingPoints;
      let price;

      if (spdptpCheck === 1) {
        price = singlePanaPrice;
        amountToPay = bidPoints * singlePanaPrice;
      } else if (spdptpCheck === 2) {
        price = doublePanaPrice;
        amountToPay = bidPoints * doublePanaPrice;
      } else {
        price = doublePanaPrice;
        amountToPay = bidPoints * triplePanaPrice;
      }

      let lossPana = 0;
      let pl = amountToPay;
      let finalCal = 0;
      if (pl > panaDigitSum) {
        lossPana = pl - panaDigitSum;
        finalCal = (lossPana / price).toFixed();
        totalSum += parseInt(finalCal);
      }
      pannaFinalData.push({ key:key,cutting:finalCal,total: totalSum})
    }

   return pannaFinalData;
  }

return [];
}

function prepareKeysForWhatsapp(data=[]){
  const total =  data[data.length-1].total;
  data.sort((a,b)=>{
    if(parseInt(a.cutting) < parseInt(b.cutting)){
      return 1;
    }else if(parseInt(a.cutting) > parseInt(b.cutting)){
      return -1
    }else{
      return 0;
    }
   })

   const whatsKeys = data.map((ele)=>{
     return { type :'text',text:`${ele.key}=${ele.cutting}` }
   });
   


   return {
    whatsKeys:whatsKeys,
    total:total
   }

}

// getGameSetting("4:00 PM")

exports.executeWhatsAppTrigger = getGameSetting;
