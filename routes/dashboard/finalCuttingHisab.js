const router = require("express").Router();
const gameBids = require("../../model/games/gameBids");
const result = require("../../model/games/GameResult");
const gameRate = require("../../model/games/GameList");
const sum = require("../../model/dashBoard/BidSumGames");
const moment = require("moment");
const mongodb = require("mongodb");
const { MongoClient, ObjectID } = mongodb;

const fs = require('fs');
const path = require('path');

router.post("/getFinalCutting", async (req, res) => {
	try {
        // Need To Test
		return res.status(400).json({
			status: 0,
			message: "Something Went Wrong"
		});
        const {dateStart, dateEnd, providerId} = req.body;
		const session = "Open";
        const sdate = moment(dateStart, "YYYY-MM-DD").format("MM/DD/YYYY");
        const edate = moment(dateEnd, "YYYY-MM-DD").format("MM/DD/YYYY");
        const startDate = moment(sdate, "MM/DD/YYYY").unix();
        let endDate = moment(edate, "MM/DD/YYYY").unix();
        const todayDate = moment().format("MM/DD/YYYY");
        if(todayDate === edate){
            endDate = moment().unix();
        }
        const dataReci = await commonQuery(providerId, startDate, endDate, session);
        let status = dataReci.status;
        if (status != 0) {
            let allData = dataReci.dayWiseData;
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
            let sp = rate[0].gamePrice;
            let dp = rate[1].gamePrice;
            let tp = rate[2].gamePrice;
            let jodiPrice = 10;
            for(index in allData)
            {
                let panaSum = allData[index].panaSum;
                let singleDigitSum = allData[index].singleDigitSum;
                let panaArray = allData[index].panaArray;
                let singleDigitArray = allData[index].singleDigitArray;
                let resultParticular =  allData[index].gameResult;
                let bidDate = allData[index].bidDate;
                let allBidDataOC = await gameBids.find(
                    {
                        providerId: mongodb.ObjectId(providerId),
                        gameDate : bidDate,
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
                    { bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1 });

                let dayResult = await result.findOne({providerId: providerId, resultDate: bidDate, session: "Open"},{winningDigit: 1 ,winningDigitFamily: 1});

                resultParticular.winningDigit = dayResult.winningDigit
                resultParticular.winningDigitFamily = dayResult.winningDigitFamily

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
            }

            res.json({
                status: 1,
                message: "success",
                allData : allData,
                price: {
                    sp: sp,
                    dp: dp,
                    tp: tp,
                    jodiPrice: jodiPrice,
                }
            });
        } else {
            res.status(200).json({
                status: 0,
                message: "No Data Found",
            });
        }
	} catch (error) {
		return res.status(400).json({
			status: 0,
			messag: "Something Went Wrong Contact Support mohit",
			Error: error.toString(),
		});
	}
});

router.post("/finalCloseCutingGroup", async (req, res) => {
	try {
        // Need To Test
		return res.status(400).json({
			status: 0,
			message: "Something Went Wrong"
		});
        const {dateStart, dateEnd, providerId} = req.body;
		const session = "Close";
        const sdate = moment(dateStart, "YYYY-MM-DD").format("MM/DD/YYYY");
        const edate = moment(dateEnd, "YYYY-MM-DD").format("MM/DD/YYYY");
        const resultDate = moment(dateEnd, "YYYY-MM-DD").format("MM/DD/YYYY");
        const startDate = moment(sdate, "MM/DD/YYYY").unix();
        let endDate = moment(edate, "MM/DD/YYYY").unix();

        const todayDate = moment().format("MM/DD/YYYY");
        if(todayDate === edate){
            endDate = moment().unix();
        }

		const openResut = await result.findOne({
			providerId: providerId,
			session: "Open",
			resultDate: resultDate,
		});

        if (openResut)
        {
			
			const rate = await gameRate
				.find({
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
			let sp = rate[0].gamePrice;
			let dp = rate[1].gamePrice;
            let tp = rate[2].gamePrice;
            let jodiPrice = 10;

			commonQueryNew(providerId, startDate, endDate, session)
				.then(async function (data) {
                    let status = data.status;
                    if(status != 0) {
                        let allData = data.dayWiseData;
                        for(index in allData)
                        {
                            let resultParticular =  allData[index].gameResult;
                            let panaArray = allData[index].panaArray;
                            let singleDigitArray = allData[index].singleDigitArray;
                            let bidDate = allData[index].bidDate;
                            let diffe = allData[index].diffe;
                            let tempPanaSum = 0;
                            let tempSingSum = 0;
                            let resultDate = await result.findOne({
                                providerId: providerId,
                                session: "Open",
                                resultDate: bidDate,
                            });
                            let resultSingleDigit = parseInt(resultDate.winningDigitFamily);
                            let resultpanaDigit = parseInt(resultDate.winningDigit);
                            let dayResult = await result.findOne({providerId: providerId, resultDate: bidDate, session: "Close"},{winningDigit: 1 ,winningDigitFamily: 1});
                            resultParticular.winningDigit = dayResult.winningDigit;
                            resultParticular.winningDigitFamily = dayResult.winningDigitFamily;
                            const allBidDataOC = await gameBids.find(
                                {
                                    providerId: providerId,
                                    gameDate: bidDate,
                                    $and: [
                                        {
                                            $or: [
                                                { gameTypeName: "Jodi Digit" },
                                                { gameTypeName: "Full Sangam Digits" },
                                                { gameTypeName: "Half Sangam Digits" },
                                            ],
                                        },
                                    ],
                                },
                                { bidDigit: 1, biddingPoints: 1, gameTypePrice: 1, gameSession: 1, gameDate :1 }
                            );
                            const sumhf = await sum.findOne({
                                providerId: providerId,
                                date: bidDate,
                            });
                            let halfSangamTotal = sumhf.half_Sangamsum;
                            let fullSangamTotal = sumhf.full_Sangamsum;
                            for (indexNew in allBidDataOC) 
                            {
                                let bidDigit = allBidDataOC[indexNew].bidDigit;
                                let bidPoints = allBidDataOC[indexNew].biddingPoints;
                                let gamePrice = allBidDataOC[indexNew].gameTypePrice;
                                let amtToPay = bidPoints * gamePrice;
                                let strLength = bidDigit.length;

                                switch (strLength) {
                                    case 2:
                                        let digit1 = parseInt(bidDigit.charAt(0));
                                        let digit2 = parseInt(bidDigit.charAt(1));
                                        if (digit1 === resultSingleDigit) {
                                            let pointsNew = bidPoints * jodiPrice;
                                            tempSingSum = tempSingSum + pointsNew;
                                            singleDigitArray[digit2]["biddingPoints"] += pointsNew;
                                        }
                                        break;
                                    case 5:
                                        let digitSplithalf = bidDigit.split("-");
                                        let digitpana3 = parseInt(digitSplithalf[0]);
                                        let digitpana4 = digitSplithalf[1];
                                        if (
                                            digitpana3 === resultpanaDigit ||
                                            digitpana3 === resultSingleDigit
                                        ) {
                                            let loss = amtToPay - halfSangamTotal;
                                            if (digitpana4.toString().length === 3) {
                                                let sum = rates(digitpana4, loss, sp, dp, tp);
                                                tempPanaSum = tempPanaSum + parseInt(sum);
                                                let addDigit = digitpana4.toString();
                                                panaArray[addDigit]["biddingPoints"] += parseInt(sum);
                                            } else {
                                                let sum = loss / jodiPrice;
                                                tempSingSum = tempSingSum + sum;
                                                singleDigitArray[digitpana4]["biddingPoints"] += sum;
                                            }
                                        }
                                        break;
                                    case 7:
                                        let digitSplit = bidDigit.split("-");
                                        let digitpana1 = parseInt(digitSplit[0]);
                                        let digitpana2 = digitSplit[1];
                                        if (digitpana1 === resultpanaDigit) {
                                            let loss = amtToPay - fullSangamTotal;
                                            let sum = rates(digitpana1, loss, sp, dp, tp);
                                            tempPanaSum = tempPanaSum + parseInt(sum);
                                            let addDigit = digitpana2.toString();
                                            panaArray[addDigit]["biddingPoints"] += parseInt(sum);
                                        }
                                        break;
                                }
                            }
                            diffe.panaSum = tempPanaSum.toString();
                            diffe.singleDigitSum = tempSingSum.toString();
                        }
                        return res.json({
                            status: 1,
                            message: "success",
                            allData : allData,
                            price: {
                                sp: sp,
                                dp: dp,
                                tp: tp,
                                jodiPrice: jodiPrice,
                            }
                        });
                    }
                    else{
                        return res.json({
                            status : 0,
                            message : "No Data Found"
                        })
                    }
				})
				.catch(function (err) {
					return res.status(400).json({
						status: 0,
						message: "Something Went Wrong Contact Support",
						error: err.toString(),
					});
				});
		} else {
			return res.status(200).json({
				status: 0,
				message: "Open Result Not Declared",
			});
		}
	} catch (error) {
		res.status(200).json({
			status: 0,
			message: "Something Went Wrong Contact Support",
		});
	}
});

function rates(digit, loss, spp, dpp, tpp) {
	let spArray = [127,136,145,190,235,280,370,389,460,479,569,578,128,137,146,236,245,290,380,470,489,560,579,678,129,138,147,156,237,246,345,390,480,570,589,679,120,139,148,157,238,247,256,346,490,580,670,689,130,149,158,167,239,248,257,347,356,590,680,789,140,159,168,230,249,258,267,348,357,456,690,780,123,150,169,178,240,259,268,349,358,367,457,790,124,160,278,179,250,269,340,359,368,458,467,890,125,134,170,189,260,279,350,369,468,378,459,567,126,135,180,234,270,289,360,379,450,469,478,568];

	let dpArray = [118,226,244,299,334,488,550,668,677,100,119,155,227,335,344,399,588,669,110,200,228,255,336,499,660,688,778,166,229,300,337,355,445,599,779,788,112,220,266,338,400,446,455,699,770,113,122,177,339,366,447,500,799,889,600,114,277,330,448,466,556,880,899,115,133,188,223,377,449,557,566,700,116,224,233,288,440,477,558,800,990,117,144,199,225,388,559,577,667,900];

	let tpArray = [000, 111, 222, 333, 444, 555, 666, 777, 888, 999];

	let sp = spArray.includes(digit);
	let dp = dpArray.includes(digit);
	// let tp = tpArray.includes(digit);
	let divideResult = "";

	if (sp) {
		divideResult = (loss / spp).toFixed(0);
	} else if (dp) {
		divideResult = (loss / dpp).toFixed(0);
	} else {
		divideResult = (loss / tpp).toFixed(0);
	}

	return divideResult;
}

async function commonQuery(providerId, startDate, endDate, session) {

    const allBidData = await gameBids.aggregate([
        {
            $match: {
                providerId: mongodb.ObjectId(providerId),
                gameSession: session,
                dateStamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        },
        {
            $group: {
                _id: "$gameDate",
                items: {
                    $push: '$$ROOT'
                }
            }
        }
    ])
    .sort({_id : 1});

    if (Object.keys(allBidData).length != 0){
		for (index in allBidData) {
            let bids = allBidData[index].items;
            let singleDigitSum = 0;
            let panaSum = 0;
            
            let singleArr = {"0": { digit: "0", biddingPoints: 0 },"1": { digit: "1", biddingPoints: 0 },"2": { digit: "2", biddingPoints: 0 },"3": { digit: "3", biddingPoints: 0 },"4": { digit: "4", biddingPoints: 0 },"5": { digit: "5", biddingPoints: 0 },"6": { digit: "6", biddingPoints: 0 },"7": { digit: "7", biddingPoints: 0 },"8": { digit: "8", biddingPoints: 0 },"9": { digit: "9", biddingPoints: 0 }};

            let panaArray =  {'100': { digit: '100', digitFamily: '1', biddingPoints: 0 },'110': { digit: '110', digitFamily: '2', biddingPoints: 0 },'111': { digit: '111', digitFamily: '3', biddingPoints: 0 },'112': { digit: '112', digitFamily: '4', biddingPoints: 0 },'113': { digit: '113', digitFamily: '5', biddingPoints: 0 },'114': { digit: '114', digitFamily: '6', biddingPoints: 0 },'115': { digit: '115', digitFamily: '7', biddingPoints: 0 },'116': { digit: '116', digitFamily: '8', biddingPoints: 0 },'117': { digit: '117', digitFamily: '9', biddingPoints: 0 },'118': { digit: '118', digitFamily: '0', biddingPoints: 0 },'119': { digit: '119', digitFamily: '1', biddingPoints: 0 },'120': { digit: '120', digitFamily: '3', biddingPoints: 0 },'122': { digit: '122', digitFamily: '5', biddingPoints: 0 },'123': { digit: '123', digitFamily: '6', biddingPoints: 0 },'124': { digit: '124', digitFamily: '7', biddingPoints: 0 },'125': { digit: '125', digitFamily: '8', biddingPoints: 0 },'126': { digit: '126', digitFamily: '9', biddingPoints: 0 },'127': { digit: '127', digitFamily: '0', biddingPoints: 0 },'128': { digit: '128', digitFamily: '1', biddingPoints: 0 },'129': { digit: '129', digitFamily: '2', biddingPoints: 0 },'130': { digit: '130', digitFamily: '4', biddingPoints: 0 },'133': { digit: '133', digitFamily: '7', biddingPoints: 0 },'134': { digit: '134', digitFamily: '8', biddingPoints: 0 },'135': { digit: '135', digitFamily: '9', biddingPoints: 0 },'136': { digit: '136', digitFamily: '0', biddingPoints: 0 },'137': { digit: '137', digitFamily: '1', biddingPoints: 0 },'138': { digit: '138', digitFamily: '2', biddingPoints: 0 },'139': { digit: '139', digitFamily: '3', biddingPoints: 0 },'140': { digit: '140', digitFamily: '5', biddingPoints: 0 },'144': { digit: '144', digitFamily: '9', biddingPoints: 0 },'145': { digit: '145', digitFamily: '0', biddingPoints: 0 },'146': { digit: '146', digitFamily: '1', biddingPoints: 0 },'147': { digit: '147', digitFamily: '2', biddingPoints: 0 },'148': { digit: '148', digitFamily: '3', biddingPoints: 0 },'149': { digit: '149', digitFamily: '4', biddingPoints: 0 },'150': { digit: '150', digitFamily: '6', biddingPoints: 0 },'155': { digit: '155', digitFamily: '1', biddingPoints: 0 },'156': { digit: '156', digitFamily: '2', biddingPoints: 0 },'157': { digit: '157', digitFamily: '3', biddingPoints: 0 },'158': { digit: '158', digitFamily: '4', biddingPoints: 0 },'159': { digit: '159', digitFamily: '5', biddingPoints: 0 },'160': { digit: '160', digitFamily: '7', biddingPoints: 0 },'166': { digit: '166', digitFamily: '3', biddingPoints: 0 },'167': { digit: '167', digitFamily: '4', biddingPoints: 0 },'168': { digit: '168', digitFamily: '5', biddingPoints: 0 },'169': { digit: '169', digitFamily: '6', biddingPoints: 0 },'170': { digit: '170', digitFamily: '8', biddingPoints: 0 },'177': { digit: '177', digitFamily: '5', biddingPoints: 0 },'178': { digit: '178', digitFamily: '6', biddingPoints: 0 },'179': { digit: '179', digitFamily: '7', biddingPoints: 0 },'180': { digit: '180', digitFamily: '9', biddingPoints: 0 },'188': { digit: '188', digitFamily: '7', biddingPoints: 0 },'189': { digit: '189', digitFamily: '8', biddingPoints: 0 },'190': { digit: '190', digitFamily: '0', biddingPoints: 0 },'199': { digit: '199', digitFamily: '9', biddingPoints: 0 },'200': { digit: '200', digitFamily: '2', biddingPoints: 0 },'220': { digit: '220', digitFamily: '4', biddingPoints: 0 },'222': { digit: '222', digitFamily: '6', biddingPoints: 0 },'223': { digit: '223', digitFamily: '7', biddingPoints: 0 },'224': { digit: '224', digitFamily: '8', biddingPoints: 0 },'225': { digit: '225', digitFamily: '9', biddingPoints: 0 },'226': { digit: '226', digitFamily: '0', biddingPoints: 0 },'227': { digit: '227', digitFamily: '1', biddingPoints: 0 },'228': { digit: '228', digitFamily: '2', biddingPoints: 0 },'229': { digit: '229', digitFamily: '3', biddingPoints: 0 },'230': { digit: '230', digitFamily: '5', biddingPoints: 0 },'233': { digit: '233', digitFamily: '8', biddingPoints: 0 },'234': { digit: '234', digitFamily: '9', biddingPoints: 0 },'235': { digit: '235', digitFamily: '0', biddingPoints: 0 },'236': { digit: '236', digitFamily: '1', biddingPoints: 0 },'237': { digit: '237', digitFamily: '2', biddingPoints: 0 },'238': { digit: '238', digitFamily: '3', biddingPoints: 0 },'239': { digit: '239', digitFamily: '4', biddingPoints: 0 },'240': { digit: '240', digitFamily: '6', biddingPoints: 0 },'244': { digit: '244', digitFamily: '0', biddingPoints: 0 },'245': { digit: '245', digitFamily: '1', biddingPoints: 0 },'246': { digit: '246', digitFamily: '2', biddingPoints: 0 },'247': { digit: '247', digitFamily: '3', biddingPoints: 0 },'248': { digit: '248', digitFamily: '4', biddingPoints: 0 },'249': { digit: '249', digitFamily: '5', biddingPoints: 0 },'250': { digit: '250', digitFamily: '7', biddingPoints: 0 },'255': { digit: '255', digitFamily: '2', biddingPoints: 0 },'256': { digit: '256', digitFamily: '3', biddingPoints: 0 },'257': { digit: '257', digitFamily: '4', biddingPoints: 0 },'258': { digit: '258', digitFamily: '5', biddingPoints: 0 },'259': { digit: '259', digitFamily: '6', biddingPoints: 0 },'260': { digit: '260', digitFamily: '8', biddingPoints: 0 },'266': { digit: '266', digitFamily: '4', biddingPoints: 0 },'267': { digit: '267', digitFamily: '5', biddingPoints: 0 },'268': { digit: '268', digitFamily: '6', biddingPoints: 0 },'269': { digit: '269', digitFamily: '7', biddingPoints: 0 },'270': { digit: '270', digitFamily: '9', biddingPoints: 0 },'277': { digit: '277', digitFamily: '6', biddingPoints: 0 },'278': { digit: '278', digitFamily: '7', biddingPoints: 0 },'279': { digit: '279', digitFamily: '8', biddingPoints: 0 },'280': { digit: '280', digitFamily: '0', biddingPoints: 0 },'288': { digit: '288', digitFamily: '8', biddingPoints: 0 },'289': { digit: '289', digitFamily: '9', biddingPoints: 0 },'290': { digit: '290', digitFamily: '1', biddingPoints: 0 },'299': { digit: '299', digitFamily: '0', biddingPoints: 0 },'300': { digit: '300', digitFamily: '3', biddingPoints: 0 },'330': { digit: '330', digitFamily: '6', biddingPoints: 0 },'333': { digit: '333', digitFamily: '9', biddingPoints: 0 },'334': { digit: '334', digitFamily: '0', biddingPoints: 0 },'335': { digit: '335', digitFamily: '1', biddingPoints: 0 },'336': { digit: '336', digitFamily: '2', biddingPoints: 0 },'337': { digit: '337', digitFamily: '3', biddingPoints: 0 },'338': { digit: '338', digitFamily: '4', biddingPoints: 0 },'339': { digit: '339', digitFamily: '5', biddingPoints: 0 },'340': { digit: '340', digitFamily: '7', biddingPoints: 0 },'344': { digit: '344', digitFamily: '1', biddingPoints: 0 },'345': { digit: '345', digitFamily: '2', biddingPoints: 0 },'346': { digit: '346', digitFamily: '3', biddingPoints: 0 },'347': { digit: '347', digitFamily: '4', biddingPoints: 0 },'348': { digit: '348', digitFamily: '5', biddingPoints: 0 },'349': { digit: '349', digitFamily: '6', biddingPoints: 0 },'350': { digit: '350', digitFamily: '8', biddingPoints: 0 },'355': { digit: '355', digitFamily: '3', biddingPoints: 0 },'356': { digit: '356', digitFamily: '4', biddingPoints: 0 },'357': { digit: '357', digitFamily: '5', biddingPoints: 0 },'358': { digit: '358', digitFamily: '6', biddingPoints: 0 },'359': { digit: '359', digitFamily: '7', biddingPoints: 0 },'360': { digit: '360', digitFamily: '9', biddingPoints: 0 },'366': { digit: '366', digitFamily: '5', biddingPoints: 0 },'367': { digit: '367', digitFamily: '6', biddingPoints: 0 },'368': { digit: '368', digitFamily: '7', biddingPoints: 0 },'369': { digit: '369', digitFamily: '8', biddingPoints: 0 },'370': { digit: '370', digitFamily: '0', biddingPoints: 0 },'377': { digit: '377', digitFamily: '7', biddingPoints: 0 },'378': { digit: '378', digitFamily: '8', biddingPoints: 0 },'379': { digit: '379', digitFamily: '9', biddingPoints: 0 },'380': { digit: '380', digitFamily: '1', biddingPoints: 0 },'388': { digit: '388', digitFamily: '9', biddingPoints: 0 },'389': { digit: '389', digitFamily: '0', biddingPoints: 0 },'390': { digit: '390', digitFamily: '2', biddingPoints: 0 },'399': { digit: '399', digitFamily: '1', biddingPoints: 0 },'400': { digit: '400', digitFamily: '4', biddingPoints: 0 },'440': { digit: '440', digitFamily: '8', biddingPoints: 0 },'444': { digit: '444', digitFamily: '2', biddingPoints: 0 },'445': { digit: '445', digitFamily: '3', biddingPoints: 0 },'446': { digit: '446', digitFamily: '4', biddingPoints: 0 },'447': { digit: '447', digitFamily: '5', biddingPoints: 0 },'448': { digit: '448', digitFamily: '6', biddingPoints: 0 },'449': { digit: '449', digitFamily: '7', biddingPoints: 0 },'450': { digit: '450', digitFamily: '9', biddingPoints: 0 },'455': { digit: '455', digitFamily: '4', biddingPoints: 0 },'456': { digit: '456', digitFamily: '5', biddingPoints: 0 },'457': { digit: '457', digitFamily: '6', biddingPoints: 0 },'458': { digit: '458', digitFamily: '7', biddingPoints: 0 },'459': { digit: '459', digitFamily: '8', biddingPoints: 0 },'460': { digit: '460', digitFamily: '0', biddingPoints: 0 },'466': { digit: '466', digitFamily: '6', biddingPoints: 0 },'467': { digit: '467', digitFamily: '7', biddingPoints: 0 },'468': { digit: '468', digitFamily: '8', biddingPoints: 0 },'469': { digit: '469', digitFamily: '9', biddingPoints: 0 },'470': { digit: '470', digitFamily: '1', biddingPoints: 0 },'477': { digit: '477', digitFamily: '8', biddingPoints: 0 },'478': { digit: '478', digitFamily: '9', biddingPoints: 0 },'479': { digit: '479', digitFamily: '0', biddingPoints: 0 },'480': { digit: '480', digitFamily: '2', biddingPoints: 0 },'488': { digit: '488', digitFamily: '0', biddingPoints: 0 },'489': { digit: '489', digitFamily: '1', biddingPoints: 0 },'490': { digit: '490', digitFamily: '3', biddingPoints: 0 },'499': { digit: '499', digitFamily: '2', biddingPoints: 0 },'500': { digit: '500', digitFamily: '5', biddingPoints: 0 },'550': { digit: '550', digitFamily: '0', biddingPoints: 0 },'555': { digit: '555', digitFamily: '5', biddingPoints: 0 },'556': { digit: '556', digitFamily: '6', biddingPoints: 0 },'557': { digit: '557', digitFamily: '7', biddingPoints: 0 },'558': { digit: '558', digitFamily: '8', biddingPoints: 0 },'559': { digit: '559', digitFamily: '9', biddingPoints: 0 },'560': { digit: '560', digitFamily: '1', biddingPoints: 0 },'566': { digit: '566', digitFamily: '7', biddingPoints: 0 },'567': { digit: '567', digitFamily: '8', biddingPoints: 0 },'568': { digit: '568', digitFamily: '9', biddingPoints: 0 },'569': { digit: '569', digitFamily: '0', biddingPoints: 0 },'570': { digit: '570', digitFamily: '2', biddingPoints: 0 },'577': { digit: '577', digitFamily: '9', biddingPoints: 0 },'578': { digit: '578', digitFamily: '0', biddingPoints: 0 },'579': { digit: '579', digitFamily: '1', biddingPoints: 0 },'580': { digit: '580', digitFamily: '3', biddingPoints: 0 },'588': { digit: '588', digitFamily: '1', biddingPoints: 0 },'589': { digit: '589', digitFamily: '2', biddingPoints: 0 },'590': { digit: '590', digitFamily: '4', biddingPoints: 0 },'599': { digit: '599', digitFamily: '3', biddingPoints: 0 },'600': { digit: '600', digitFamily: '6', biddingPoints: 0 },'660': { digit: '660', digitFamily: '2', biddingPoints: 0 },'666': { digit: '666', digitFamily: '8', biddingPoints: 0 },'667': { digit: '667', digitFamily: '9', biddingPoints: 0 },'668': { digit: '668', digitFamily: '0', biddingPoints: 0 },'669': { digit: '669', digitFamily: '1', biddingPoints: 0 },'670': { digit: '670', digitFamily: '3', biddingPoints: 0 },'677': { digit: '677', digitFamily: '0', biddingPoints: 0 },'678': { digit: '678', digitFamily: '1', biddingPoints: 0 },'679': { digit: '679', digitFamily: '2', biddingPoints: 0 },'680': { digit: '680', digitFamily: '4', biddingPoints: 0 },'688': { digit: '688', digitFamily: '2', biddingPoints: 0 },'689': { digit: '689', digitFamily: '3', biddingPoints: 0 },'690': { digit: '690', digitFamily: '5', biddingPoints: 0 },'699': { digit: '699', digitFamily: '4', biddingPoints: 0 },'700': { digit: '700', digitFamily: '7', biddingPoints: 0 },'770': { digit: '770', digitFamily: '4', biddingPoints: 0 },'777': { digit: '777', digitFamily: '1', biddingPoints: 0 },'778': { digit: '778', digitFamily: '2', biddingPoints: 0 },'779': { digit: '779', digitFamily: '3', biddingPoints: 0 },'780': { digit: '780', digitFamily: '5', biddingPoints: 0 },'788': { digit: '788', digitFamily: '3', biddingPoints: 0 },'789': { digit: '789', digitFamily: '4', biddingPoints: 0 },'790': { digit: '790', digitFamily: '6', biddingPoints: 0 },'799': { digit: '799', digitFamily: '5', biddingPoints: 0 },'800': { digit: '800', digitFamily: '8', biddingPoints: 0 },'880': { digit: '880', digitFamily: '6', biddingPoints: 0 },'888': { digit: '888', digitFamily: '4', biddingPoints: 0 },'889': { digit: '889', digitFamily: '5', biddingPoints: 0 },'890': { digit: '890', digitFamily: '7', biddingPoints: 0 },'899': { digit: '899', digitFamily: '6', biddingPoints: 0 },'900': { digit: '900', digitFamily: '9', biddingPoints: 0 },'990': { digit: '990', digitFamily: '8', biddingPoints: 0 },'999': { digit: '999', digitFamily: '7', biddingPoints: 0 },'000': { digit: '000', digitFamily: '0', biddingPoints: 0 }
          }

            let dateBid = allBidData[index]._id;;
            for(index1 in bids)
            {
                let bidDigit = bids[index1].bidDigit;
                let length = bidDigit.length;
                let points = bids[index1].biddingPoints;

                if (length == 1) {
                    singleDigitSum = singleDigitSum + points;
                }
                if (length == 3) {
                    panaSum = panaSum + points;
                }

                switch (length) {
                    case 1:
                        singleArr[bidDigit]["biddingPoints"] += points;
                        break;
                    case 3:
                        panaArray[bidDigit]["biddingPoints"] += points;
                        break;
                }
            }

            allBidData[index] = {
                gameResult : {winningDigit : '', winningDigitFamily : ''},
                bidDate : dateBid,
                singleDigitArray : singleArr,
                panaArray : panaArray,
                panaSum: panaSum,
                singleDigitSum: singleDigitSum
            }
        }

		let returnData = {
            status: 1,
            dayWiseData : allBidData
		};
		return Promise.resolve(returnData);
	} else {
		let returnData = { status: 0 };
		return Promise.resolve(returnData);
	}
}

module.exports = router;

async function commonQueryNew(providerId, startDate, endDate, session) {
    // const certPath = path.join(__dirname, '../../global-bundle.pem');
    const client = await MongoClient.connect(process.env.DB_CONNECT,{
		useNewUrlParser: true,
		useUnifiedTopology: true,
    });

    // const client = new MongoClient(uri, {
    //     useNewUrlParser: true,
    //     useUnifiedTopology: true,
    //     tls: true,
    //     tlsCAFile: certPath
    // });

    const db = client.db("dhandb")
    const allBidData = await db.collection("game_bids").aggregate([{
            $match: {
                providerId: ObjectID(providerId),
                gameSession: session,
                dateStamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }
        }, {
            $group: {
                _id: "$gameDate",
                items: {
                    $push: "$$ROOT"
                }
            }
        }], {
            "allowDiskUse": true
        })
        .sort({_id : 1})
        .toArray();

    client.close();
   
    if (Object.keys(allBidData).length != 0) 
    {
		for (index in allBidData) {
            let bids = allBidData[index].items;
            let singleDigitSum = 0;
            let panaSum = 0;
            
            let singleArr = {"0": { digit: "0", biddingPoints: 0 },"1": { digit: "1", biddingPoints: 0 },"2": { digit: "2", biddingPoints: 0 },"3": { digit: "3", biddingPoints: 0 },"4": { digit: "4", biddingPoints: 0 },"5": { digit: "5", biddingPoints: 0 },"6": { digit: "6", biddingPoints: 0 },"7": { digit: "7", biddingPoints: 0 },"8": { digit: "8", biddingPoints: 0 },"9": { digit: "9", biddingPoints: 0 }};

            let panaArray =  {'100': { digit: '100', digitFamily: '1', biddingPoints: 0 },'110': { digit: '110', digitFamily: '2', biddingPoints: 0 },'111': { digit: '111', digitFamily: '3', biddingPoints: 0 },'112': { digit: '112', digitFamily: '4', biddingPoints: 0 },'113': { digit: '113', digitFamily: '5', biddingPoints: 0 },'114': { digit: '114', digitFamily: '6', biddingPoints: 0 },'115': { digit: '115', digitFamily: '7', biddingPoints: 0 },'116': { digit: '116', digitFamily: '8', biddingPoints: 0 },'117': { digit: '117', digitFamily: '9', biddingPoints: 0 },'118': { digit: '118', digitFamily: '0', biddingPoints: 0 },'119': { digit: '119', digitFamily: '1', biddingPoints: 0 },'120': { digit: '120', digitFamily: '3', biddingPoints: 0 },'122': { digit: '122', digitFamily: '5', biddingPoints: 0 },'123': { digit: '123', digitFamily: '6', biddingPoints: 0 },'124': { digit: '124', digitFamily: '7', biddingPoints: 0 },'125': { digit: '125', digitFamily: '8', biddingPoints: 0 },'126': { digit: '126', digitFamily: '9', biddingPoints: 0 },'127': { digit: '127', digitFamily: '0', biddingPoints: 0 },'128': { digit: '128', digitFamily: '1', biddingPoints: 0 },'129': { digit: '129', digitFamily: '2', biddingPoints: 0 },'130': { digit: '130', digitFamily: '4', biddingPoints: 0 },'133': { digit: '133', digitFamily: '7', biddingPoints: 0 },'134': { digit: '134', digitFamily: '8', biddingPoints: 0 },'135': { digit: '135', digitFamily: '9', biddingPoints: 0 },'136': { digit: '136', digitFamily: '0', biddingPoints: 0 },'137': { digit: '137', digitFamily: '1', biddingPoints: 0 },'138': { digit: '138', digitFamily: '2', biddingPoints: 0 },'139': { digit: '139', digitFamily: '3', biddingPoints: 0 },'140': { digit: '140', digitFamily: '5', biddingPoints: 0 },'144': { digit: '144', digitFamily: '9', biddingPoints: 0 },'145': { digit: '145', digitFamily: '0', biddingPoints: 0 },'146': { digit: '146', digitFamily: '1', biddingPoints: 0 },'147': { digit: '147', digitFamily: '2', biddingPoints: 0 },'148': { digit: '148', digitFamily: '3', biddingPoints: 0 },'149': { digit: '149', digitFamily: '4', biddingPoints: 0 },'150': { digit: '150', digitFamily: '6', biddingPoints: 0 },'155': { digit: '155', digitFamily: '1', biddingPoints: 0 },'156': { digit: '156', digitFamily: '2', biddingPoints: 0 },'157': { digit: '157', digitFamily: '3', biddingPoints: 0 },'158': { digit: '158', digitFamily: '4', biddingPoints: 0 },'159': { digit: '159', digitFamily: '5', biddingPoints: 0 },'160': { digit: '160', digitFamily: '7', biddingPoints: 0 },'166': { digit: '166', digitFamily: '3', biddingPoints: 0 },'167': { digit: '167', digitFamily: '4', biddingPoints: 0 },'168': { digit: '168', digitFamily: '5', biddingPoints: 0 },'169': { digit: '169', digitFamily: '6', biddingPoints: 0 },'170': { digit: '170', digitFamily: '8', biddingPoints: 0 },'177': { digit: '177', digitFamily: '5', biddingPoints: 0 },'178': { digit: '178', digitFamily: '6', biddingPoints: 0 },'179': { digit: '179', digitFamily: '7', biddingPoints: 0 },'180': { digit: '180', digitFamily: '9', biddingPoints: 0 },'188': { digit: '188', digitFamily: '7', biddingPoints: 0 },'189': { digit: '189', digitFamily: '8', biddingPoints: 0 },'190': { digit: '190', digitFamily: '0', biddingPoints: 0 },'199': { digit: '199', digitFamily: '9', biddingPoints: 0 },'200': { digit: '200', digitFamily: '2', biddingPoints: 0 },'220': { digit: '220', digitFamily: '4', biddingPoints: 0 },'222': { digit: '222', digitFamily: '6', biddingPoints: 0 },'223': { digit: '223', digitFamily: '7', biddingPoints: 0 },'224': { digit: '224', digitFamily: '8', biddingPoints: 0 },'225': { digit: '225', digitFamily: '9', biddingPoints: 0 },'226': { digit: '226', digitFamily: '0', biddingPoints: 0 },'227': { digit: '227', digitFamily: '1', biddingPoints: 0 },'228': { digit: '228', digitFamily: '2', biddingPoints: 0 },'229': { digit: '229', digitFamily: '3', biddingPoints: 0 },'230': { digit: '230', digitFamily: '5', biddingPoints: 0 },'233': { digit: '233', digitFamily: '8', biddingPoints: 0 },'234': { digit: '234', digitFamily: '9', biddingPoints: 0 },'235': { digit: '235', digitFamily: '0', biddingPoints: 0 },'236': { digit: '236', digitFamily: '1', biddingPoints: 0 },'237': { digit: '237', digitFamily: '2', biddingPoints: 0 },'238': { digit: '238', digitFamily: '3', biddingPoints: 0 },'239': { digit: '239', digitFamily: '4', biddingPoints: 0 },'240': { digit: '240', digitFamily: '6', biddingPoints: 0 },'244': { digit: '244', digitFamily: '0', biddingPoints: 0 },'245': { digit: '245', digitFamily: '1', biddingPoints: 0 },'246': { digit: '246', digitFamily: '2', biddingPoints: 0 },'247': { digit: '247', digitFamily: '3', biddingPoints: 0 },'248': { digit: '248', digitFamily: '4', biddingPoints: 0 },'249': { digit: '249', digitFamily: '5', biddingPoints: 0 },'250': { digit: '250', digitFamily: '7', biddingPoints: 0 },'255': { digit: '255', digitFamily: '2', biddingPoints: 0 },'256': { digit: '256', digitFamily: '3', biddingPoints: 0 },'257': { digit: '257', digitFamily: '4', biddingPoints: 0 },'258': { digit: '258', digitFamily: '5', biddingPoints: 0 },'259': { digit: '259', digitFamily: '6', biddingPoints: 0 },'260': { digit: '260', digitFamily: '8', biddingPoints: 0 },'266': { digit: '266', digitFamily: '4', biddingPoints: 0 },'267': { digit: '267', digitFamily: '5', biddingPoints: 0 },'268': { digit: '268', digitFamily: '6', biddingPoints: 0 },'269': { digit: '269', digitFamily: '7', biddingPoints: 0 },'270': { digit: '270', digitFamily: '9', biddingPoints: 0 },'277': { digit: '277', digitFamily: '6', biddingPoints: 0 },'278': { digit: '278', digitFamily: '7', biddingPoints: 0 },'279': { digit: '279', digitFamily: '8', biddingPoints: 0 },'280': { digit: '280', digitFamily: '0', biddingPoints: 0 },'288': { digit: '288', digitFamily: '8', biddingPoints: 0 },'289': { digit: '289', digitFamily: '9', biddingPoints: 0 },'290': { digit: '290', digitFamily: '1', biddingPoints: 0 },'299': { digit: '299', digitFamily: '0', biddingPoints: 0 },'300': { digit: '300', digitFamily: '3', biddingPoints: 0 },'330': { digit: '330', digitFamily: '6', biddingPoints: 0 },'333': { digit: '333', digitFamily: '9', biddingPoints: 0 },'334': { digit: '334', digitFamily: '0', biddingPoints: 0 },'335': { digit: '335', digitFamily: '1', biddingPoints: 0 },'336': { digit: '336', digitFamily: '2', biddingPoints: 0 },'337': { digit: '337', digitFamily: '3', biddingPoints: 0 },'338': { digit: '338', digitFamily: '4', biddingPoints: 0 },'339': { digit: '339', digitFamily: '5', biddingPoints: 0 },'340': { digit: '340', digitFamily: '7', biddingPoints: 0 },'344': { digit: '344', digitFamily: '1', biddingPoints: 0 },'345': { digit: '345', digitFamily: '2', biddingPoints: 0 },'346': { digit: '346', digitFamily: '3', biddingPoints: 0 },'347': { digit: '347', digitFamily: '4', biddingPoints: 0 },'348': { digit: '348', digitFamily: '5', biddingPoints: 0 },'349': { digit: '349', digitFamily: '6', biddingPoints: 0 },'350': { digit: '350', digitFamily: '8', biddingPoints: 0 },'355': { digit: '355', digitFamily: '3', biddingPoints: 0 },'356': { digit: '356', digitFamily: '4', biddingPoints: 0 },'357': { digit: '357', digitFamily: '5', biddingPoints: 0 },'358': { digit: '358', digitFamily: '6', biddingPoints: 0 },'359': { digit: '359', digitFamily: '7', biddingPoints: 0 },'360': { digit: '360', digitFamily: '9', biddingPoints: 0 },'366': { digit: '366', digitFamily: '5', biddingPoints: 0 },'367': { digit: '367', digitFamily: '6', biddingPoints: 0 },'368': { digit: '368', digitFamily: '7', biddingPoints: 0 },'369': { digit: '369', digitFamily: '8', biddingPoints: 0 },'370': { digit: '370', digitFamily: '0', biddingPoints: 0 },'377': { digit: '377', digitFamily: '7', biddingPoints: 0 },'378': { digit: '378', digitFamily: '8', biddingPoints: 0 },'379': { digit: '379', digitFamily: '9', biddingPoints: 0 },'380': { digit: '380', digitFamily: '1', biddingPoints: 0 },'388': { digit: '388', digitFamily: '9', biddingPoints: 0 },'389': { digit: '389', digitFamily: '0', biddingPoints: 0 },'390': { digit: '390', digitFamily: '2', biddingPoints: 0 },'399': { digit: '399', digitFamily: '1', biddingPoints: 0 },'400': { digit: '400', digitFamily: '4', biddingPoints: 0 },'440': { digit: '440', digitFamily: '8', biddingPoints: 0 },'444': { digit: '444', digitFamily: '2', biddingPoints: 0 },'445': { digit: '445', digitFamily: '3', biddingPoints: 0 },'446': { digit: '446', digitFamily: '4', biddingPoints: 0 },'447': { digit: '447', digitFamily: '5', biddingPoints: 0 },'448': { digit: '448', digitFamily: '6', biddingPoints: 0 },'449': { digit: '449', digitFamily: '7', biddingPoints: 0 },'450': { digit: '450', digitFamily: '9', biddingPoints: 0 },'455': { digit: '455', digitFamily: '4', biddingPoints: 0 },'456': { digit: '456', digitFamily: '5', biddingPoints: 0 },'457': { digit: '457', digitFamily: '6', biddingPoints: 0 },'458': { digit: '458', digitFamily: '7', biddingPoints: 0 },'459': { digit: '459', digitFamily: '8', biddingPoints: 0 },'460': { digit: '460', digitFamily: '0', biddingPoints: 0 },'466': { digit: '466', digitFamily: '6', biddingPoints: 0 },'467': { digit: '467', digitFamily: '7', biddingPoints: 0 },'468': { digit: '468', digitFamily: '8', biddingPoints: 0 },'469': { digit: '469', digitFamily: '9', biddingPoints: 0 },'470': { digit: '470', digitFamily: '1', biddingPoints: 0 },'477': { digit: '477', digitFamily: '8', biddingPoints: 0 },'478': { digit: '478', digitFamily: '9', biddingPoints: 0 },'479': { digit: '479', digitFamily: '0', biddingPoints: 0 },'480': { digit: '480', digitFamily: '2', biddingPoints: 0 },'488': { digit: '488', digitFamily: '0', biddingPoints: 0 },'489': { digit: '489', digitFamily: '1', biddingPoints: 0 },'490': { digit: '490', digitFamily: '3', biddingPoints: 0 },'499': { digit: '499', digitFamily: '2', biddingPoints: 0 },'500': { digit: '500', digitFamily: '5', biddingPoints: 0 },'550': { digit: '550', digitFamily: '0', biddingPoints: 0 },'555': { digit: '555', digitFamily: '5', biddingPoints: 0 },'556': { digit: '556', digitFamily: '6', biddingPoints: 0 },'557': { digit: '557', digitFamily: '7', biddingPoints: 0 },'558': { digit: '558', digitFamily: '8', biddingPoints: 0 },'559': { digit: '559', digitFamily: '9', biddingPoints: 0 },'560': { digit: '560', digitFamily: '1', biddingPoints: 0 },'566': { digit: '566', digitFamily: '7', biddingPoints: 0 },'567': { digit: '567', digitFamily: '8', biddingPoints: 0 },'568': { digit: '568', digitFamily: '9', biddingPoints: 0 },'569': { digit: '569', digitFamily: '0', biddingPoints: 0 },'570': { digit: '570', digitFamily: '2', biddingPoints: 0 },'577': { digit: '577', digitFamily: '9', biddingPoints: 0 },'578': { digit: '578', digitFamily: '0', biddingPoints: 0 },'579': { digit: '579', digitFamily: '1', biddingPoints: 0 },'580': { digit: '580', digitFamily: '3', biddingPoints: 0 },'588': { digit: '588', digitFamily: '1', biddingPoints: 0 },'589': { digit: '589', digitFamily: '2', biddingPoints: 0 },'590': { digit: '590', digitFamily: '4', biddingPoints: 0 },'599': { digit: '599', digitFamily: '3', biddingPoints: 0 },'600': { digit: '600', digitFamily: '6', biddingPoints: 0 },'660': { digit: '660', digitFamily: '2', biddingPoints: 0 },'666': { digit: '666', digitFamily: '8', biddingPoints: 0 },'667': { digit: '667', digitFamily: '9', biddingPoints: 0 },'668': { digit: '668', digitFamily: '0', biddingPoints: 0 },'669': { digit: '669', digitFamily: '1', biddingPoints: 0 },'670': { digit: '670', digitFamily: '3', biddingPoints: 0 },'677': { digit: '677', digitFamily: '0', biddingPoints: 0 },'678': { digit: '678', digitFamily: '1', biddingPoints: 0 },'679': { digit: '679', digitFamily: '2', biddingPoints: 0 },'680': { digit: '680', digitFamily: '4', biddingPoints: 0 },'688': { digit: '688', digitFamily: '2', biddingPoints: 0 },'689': { digit: '689', digitFamily: '3', biddingPoints: 0 },'690': { digit: '690', digitFamily: '5', biddingPoints: 0 },'699': { digit: '699', digitFamily: '4', biddingPoints: 0 },'700': { digit: '700', digitFamily: '7', biddingPoints: 0 },'770': { digit: '770', digitFamily: '4', biddingPoints: 0 },'777': { digit: '777', digitFamily: '1', biddingPoints: 0 },'778': { digit: '778', digitFamily: '2', biddingPoints: 0 },'779': { digit: '779', digitFamily: '3', biddingPoints: 0 },'780': { digit: '780', digitFamily: '5', biddingPoints: 0 },'788': { digit: '788', digitFamily: '3', biddingPoints: 0 },'789': { digit: '789', digitFamily: '4', biddingPoints: 0 },'790': { digit: '790', digitFamily: '6', biddingPoints: 0 },'799': { digit: '799', digitFamily: '5', biddingPoints: 0 },'800': { digit: '800', digitFamily: '8', biddingPoints: 0 },'880': { digit: '880', digitFamily: '6', biddingPoints: 0 },'888': { digit: '888', digitFamily: '4', biddingPoints: 0 },'889': { digit: '889', digitFamily: '5', biddingPoints: 0 },'890': { digit: '890', digitFamily: '7', biddingPoints: 0 },'899': { digit: '899', digitFamily: '6', biddingPoints: 0 },'900': { digit: '900', digitFamily: '9', biddingPoints: 0 },'990': { digit: '990', digitFamily: '8', biddingPoints: 0 },'999': { digit: '999', digitFamily: '7', biddingPoints: 0 },'000': { digit: '000', digitFamily: '0', biddingPoints: 0 }
          }

            let dateBid = allBidData[index]._id;;
            for(index1 in bids)
            {
                let bidDigit = bids[index1].bidDigit;
                let length = bidDigit.length;
                let points = bids[index1].biddingPoints;

                if (length == 1) {
                    singleDigitSum = singleDigitSum + points;
                }
                if (length == 3) {
                    panaSum = panaSum + points;
                }

                switch (length) {
                    case 1:
                        singleArr[bidDigit]["biddingPoints"] += points;
                        break;
                    case 3:
                        panaArray[bidDigit]["biddingPoints"] += points;
                        break;
                }
            }

            allBidData[index] = {
                gameResult : {winningDigit : '', winningDigitFamily : ''},
                sum : {panaSum : panaSum, singleDigitSum : singleDigitSum},
                diffe : {panaSum : "0", singleDigitSum : "0"},
                bidDate : dateBid,
                singleDigitArray : singleArr,
                panaArray : panaArray,
            }
        }

		let returnData = {
            status: 1,
            dayWiseData : allBidData
		};
		return Promise.resolve(returnData);
	} else {
		let returnData = { status: 0 };
		return Promise.resolve(returnData);
	}
}