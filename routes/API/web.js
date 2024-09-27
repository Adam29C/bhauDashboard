const router = require("express").Router();
const WalletContact = require("../../model/appSetting/WalletContact");
const gamesProvider = require("../../model/games/Games_Provider");
const gamesSetting = require("../../model/games/AddSetting");
const gameResult = require("../../model/games/GameResult");
const AbGame = require("../../model/AndarBahar/ABAddSetting");
const ABgameResult = require("../../model/AndarBahar/ABGameResult");
const AB_provider = require("../../model/AndarBahar/ABProvider");
const starline_game_Result = require("../../model/starline/GameResult");
const starProvider = require("../../model/starline/Starline_Provider");
const starSettings = require("../../model/starline/AddSetting");
const gameList = require("../../model/games/GameList");
const mongoose = require("mongoose");
const moment = require("moment");
const AppVersion = require("../../model/dashBoard/AppVersion");

router.get("/web/walletContact", async (req, res) => {
  try {
    const response = await WalletContact.aggregate([
      {
        $project: { number: 1 },
      },
    ]);
    res.send({ status: true, data: response });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
});


// router.get("/web/allgames", async (req, res) => {
//   try {
//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const today = moment();
//     const dayOfWeek = today.format('dddd').toUpperCase();
//     let gameSettings= gameSetting.find({gameDay:dayOfWeek},{providerId:1,OBT:1})
//     // res.send({ data: provider, data1:gameSettings });
//     res.json({data: provider, data1:gameSettings })
//   } catch (e) {
//     console.log(e)
//     res.json({ message: e });
//   }
// });
router.get("/web/allgames", async (req, res) => {
  try {
    const providers = await gamesProvider.find().sort({ _id: 1 });
    const today = moment();
    const dayOfWeek = today.format('dddd');
    const gameSettings = await gamesSetting.find({ gameDay: dayOfWeek }, { providerId: 1, OBT: 1 });
    const gameSettingsMap = {};
    gameSettings.forEach(setting => {
      gameSettingsMap[setting.providerId] = setting.OBT;
    });
    const filteredProviders = providers.filter(provider => gameSettingsMap[provider._id]);
    const providersWithOBT = filteredProviders.map(provider => ({
      ...provider.toObject(),
      OBT: gameSettingsMap[provider._id]
    }));
    providersWithOBT.sort((a, b) => {
      const timeA = moment(a.OBT, 'hh:mm A');
      const timeB = moment(b.OBT, 'hh:mm A');
      return timeA - timeB;
    });
    // res.json({ data: providersWithOBT});
    res.send({ data: providersWithOBT});
  } catch (e) {
    res.json({ message: e.message });
  }
});

// router.get("/web/games", async (req, res) => {
//   try {
//     const id = mongoose.Types.ObjectId("61fbd0cd41b0d43022cabf27");
//     const userInfo = req.session.details;
//     const permissionArray = req.view;
//     let finalArr = {};
//     const provider = await gamesProvider.find({}).sort({ _id: 1 });

//     let finalNew = [];

//     for (index in provider) {
//       let id = mongoose.Types.ObjectId(provider[index]._id);
//       const settings = await gamesSetting.find({ providerId: id })
//         .sort({ _id: 1 });

//       finalArr[id] = {
//         _id: id,
//         providerName: provider[index].providerName,
//         providerResult: provider[index].providerResult,
//         modifiedAt: provider[index].modifiedAt,
//         resultStatus: provider[index].resultStatus,
//         activeStatus: provider[index].activeStatus,
//         gameDetails: settings,
//       };
//     }

//     for (index2 in finalArr) {
//       let data = finalArr[index2];
//       finalNew.push(data);
//     }

//     res.send({ data: finalNew, status: true });
//   } catch (e) {
//     res.json({ message: e });
//   }
// });

// ---------------------------------------------------------------------

// router.get("/web/games", async (req, res) => {
//     try {
//       // const userInfo = req.session.details;
//       // const permissionArray = req.view;
//       const todayDayName = moment().format("dddd");
//       const providers = await gamesProvider.find({}).sort({ _id: 1 });
//       const nowTime = moment();
  
//       const finalArr = await Promise.all(
//         providers.map(async (provider) => {
//           const id = mongoose.Types.ObjectId(provider._id);
//           const settings = await gamesSetting
//             .find({ providerId: id, gameDay: todayDayName })
//             .sort({ _id: 1 });
  
//           const updatedSettings = settings.map((gameDetail) => {
//             const obtTime = moment(gameDetail.OBT, "hh:mm A");
//             const cbtTime = moment(gameDetail.CBT, "hh:mm A");
//             let message;
//             if (nowTime.isBefore(obtTime) && gameDetail.isClosed === "1") {
//               message = "Betting is running for open";
//             } else if (
//               nowTime.isAfter(obtTime) &&
//               nowTime.isBefore(cbtTime) &&
//               gameDetail.isClosed === "1"
//             ) {
//               message = "Betting is running for close";
//             } else {
//               message = "Close for today";
//             }
//             return {
//               ...gameDetail.toObject(), // Convert to plain object if gameDetail is a mongoose document
//               message: message,
//             };
//           });
//           return {
//             _id: id,
//             providerName: provider.providerName,
//             providerResult: provider.providerResult,
//             modifiedAt: provider.modifiedAt,
//             resultStatus: provider.resultStatus,
//             activeStatus: provider.activeStatus,
//             gameDetails: updatedSettings,
//           };
//         })
//       );
//       let appVersionInfo = await AppVersion.findOne();
//       let appInfo;
//       if (!appVersionInfo.maintainence) {
//         appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
//       } else {
//         appInfo = "Maintenance";
//       }
//       res.send({ data: finalArr, status: true, appInfo });
//     } catch (e) {
//       res.json({ message: e.message });
//     }
//   });

router.get("/web/games", async (req, res) => {
  try {
    const todayDayName = moment().format("dddd");
    const providers = await gamesProvider.find({}).sort({ _id: 1 });
    const nowTime = moment();
    const finalArr = await Promise.all(
      providers.map(async (provider) => {
        const id = mongoose.Types.ObjectId(provider._id);
        const settings = await gamesSetting
          .find({ providerId: id, gameDay: todayDayName })
          .sort({ _id: 1 });
        const updatedSettings = settings.map((gameDetail) => {
          const obtTime = moment(gameDetail.OBT, "hh:mm A");
          const cbtTime = moment(gameDetail.CBT, "hh:mm A");
          let message;
          if (nowTime.isBefore(obtTime) && gameDetail.isClosed === "1") {
            message = "Betting is running for open";
          } else if (
            nowTime.isAfter(obtTime) &&
            nowTime.isBefore(cbtTime) &&
            gameDetail.isClosed === "1"
          ) {
            message = "Betting is running for close";
          } else {
            message = "Close for today";
          }
          return {
            ...gameDetail.toObject(), // Convert to plain object if gameDetail is a mongoose document
            message: message,
          };
        });
        return {
          _id: id,
          providerName: provider.providerName,
          providerResult: provider.providerResult,
          modifiedAt: provider.modifiedAt,
          resultStatus: provider.resultStatus,
          activeStatus: provider.activeStatus,
          gameDetails: updatedSettings,
        };
      })
    );
    const parseTime = (timeStr) => {
      const [time, modifier] = timeStr.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      
      if (modifier === 'PM' && hours !== 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
    
      return new Date(0, 0, 0, hours, minutes);
    };
    
    finalArr.sort((a, b) => {
      const timeA = parseTime(a.gameDetails[0].OBT);
      const timeB = parseTime(b.gameDetails[0].OBT);
      return timeA - timeB;
    });
    let appVersionInfo = await AppVersion.findOne();
    let appInfo;
    if (!appVersionInfo.maintainence) {
      appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
    } else {
      appInfo = "Maintenance";
    }
    res.send({ data: finalArr, status: true, appInfo });
  } catch (e) {
    res.json({ message: e.message });
  }
});

router.get("/web/startline", async (req, res) => {
  try {
    let finalArr = {};
    const provider1 = await starProvider.find().sort({ providerName: 1 }); // Sort by providerName field
    const todayDayName = moment().format("dddd");
    for (let index in provider1) {
      let id = provider1[index]._id;
      const settings = await starSettings
        .find({ providerId: id, gameDay: todayDayName })
        .sort({ _id: 1 });
       const currentTime = moment();
       const updatedSettings = settings.map((setting) => {
        const obt = moment(setting.OBT, "HH:mm A");
        const cbt = moment(setting.CBT, "HH:mm A");
        let message;
        if (currentTime.isBetween(obt, cbt) && setting.isClosed === "1") {
          message = "Betting is running";
        } else {
          message = "Close for today";
        }

        return {
          ...setting.toObject(), // Convert to plain object if setting is a mongoose document
          message: message,
        };
      });

      finalArr[id] = {
        _id: id,
        providerName: provider1[index].providerName,
        providerResult: provider1[index].providerResult,
        modifiedAt: provider1[index].modifiedAt,
        resultStatus: provider1[index].resultStatus,
        gameDetails: updatedSettings,
      };
    }

    let finalNew = Object.values(finalArr); // Convert object values to array
    let appVersionInfo = await AppVersion.findOne();
    let appInfo;
    if (!appVersionInfo.maintainence) {
      appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
    } else {
      appInfo = "Maintenance";
    }
    res.send({ data: finalNew, status: true, appInfo });
  } catch (e) {
    res.json({ message: e.message });
  }
});

router.get("/web/AbList", async (req, res) => {
  try {
    let finalArr = {};
    let provider1 = await AB_provider.find();
    //
    const providerData = provider1.sort((a, b) => {
      // Function to convert time in "HH:MM AM/PM" format to 24-hour format in minutes
      const toMinutes = (time) => {
        const [timePart, modifier] = time.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        // Convert to 24-hour format
        if (modifier === 'PM' && hours !== 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        return hours * 60 + minutes;
      };

      return toMinutes(a.providerName) - toMinutes(b.providerName);
    });
    //
    const todayDayName = moment().format("dddd");
    for (let AbDetails of providerData) {
      let id = AbDetails._id;
      const settings = await AbGame.find({
        providerId: AbDetails._id,
        gameDay: todayDayName,
      }).sort({ _id: 1 });
      const currentTime = moment();
      const updatedSettings = settings.map((setting) => {
        const obt = moment(setting.OBT, "HH:mm A");
        const cbt = moment(setting.CBT, "HH:mm A");
        let message;
        if (currentTime.isBetween(obt, cbt) && setting.isClosed === "1") {
          message = "Betting is running";
        } else {
          message = "Close for today";
        }

        return {
          ...setting.toObject(), // Convert to plain object if setting is a mongoose document
          message: message,
        };
      });
      finalArr[id] = {
        _id: id,
        providerName: AbDetails.providerName,
        providerResult: AbDetails.providerResult,
        modifiedAt: AbDetails.modifiedAt,
        resultStatus: AbDetails.resultStatus,
        gameDetails: updatedSettings,
      };
    }

    let finalNew = Object.values(finalArr); // Convert object values to array
    let appVersionInfo = await AppVersion.findOne();
    let appInfo;
    if (!appVersionInfo.maintainence) {
      appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
    } else {
      appInfo = "Maintenance";
    }
    res.send({ data: finalNew, status: true, appInfo });
  } catch (e) {
    res.json({ message: e.message });
  }
});

// router.post("/web/panachart", async (req, res) => {
//   try {
//     const name = req.body.name;
//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const result = await gameResult.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {})

//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );
//     const flattenedData = Object.values(filteredData).flat();

//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = moment(item.resultDate, 'MM/DD/YYYY');
//       const weekStartDate = resultDate.clone().startOf('isoWeek');
//       const weekEndDate = resultDate.clone().endOf('isoWeek');
//       const weekNumber = weekStartDate.isoWeek();
//       const year = weekStartDate.year();

//       const weekKey = `${year}-W${weekNumber}`;

//       if (!groupedByWeek[weekKey]) {
//         groupedByWeek[weekKey] = {
//           items: [],
//           startDate: weekStartDate.format('YYYY-MM-DD'),
//           endDate: weekEndDate.format('YYYY-MM-DD'),
//         };
//       }
//       groupedByWeek[weekKey].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => {
//         const weekDays = {};
//         const start = moment(startDate, 'YYYY/MM/DD');
//         for (let i = 0; i < 7; i++) {
//           const day = start.clone().add(i, 'days');
//           const formattedDate = day.format('MM/DD/YYYY');
//           weekDays[formattedDate] = [{
//             providerId: items[0].providerId,
//             providerName: name,
//             session: "Open",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           },
//           {
//             providerId: items[0].providerId,
//             providerName: name,
//             session: "Close",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           }
//           ];
//         }
//         items.forEach((item) => {
//           const formattedDate = item.resultDate
//           if (!weekDays[formattedDate]) {
//             weekDays[formattedDate] = [];
//           }
//           const existingSessionIndex = weekDays[formattedDate].findIndex((dayItem) => dayItem.session === item.session);
//           if (existingSessionIndex !== -1) {
//             weekDays[formattedDate][existingSessionIndex] = item;
//           } else {
//             weekDays[formattedDate].push(item);
//           }
//         });

//         Object.keys(weekDays).forEach(date => {
//           if (weekDays[date].length < 2) {
//             const missingSession = weekDays[date][0].session === 'Open' ? 'Close' : 'Open';
//             weekDays[date].push(
//               {
//                 providerId: "660f946b8955b92e2c479c37",
//                 providerName: name,
//                 session: missingSession,
//                 resultDate: date,
//                 winningDigit: "***",
//                 winningDigitFamily: "*",
//                 status: 0,
//               }
//             );
//           }
//           weekDays[date].sort((a, b) => a.session.localeCompare(b.session));
//         });

//         return {
//           startDate: startDate,
//           endDate: endDate,
//           data: Object.values(weekDays).flat().sort((a, b) => {
//             const dateA = new Date(a.date || a.resultDate);
//             const dateB = new Date(b.date || b.resultDate);
//             return dateA - dateB;
//           }),
//         };
//       }
//     );
//     // let sortedData = [];
//     // if (groupedDataByWeek.length > 0) {
//     //   let dataArray = groupedDataByWeek[0].data;

//     //   let groupedData = {};
//     //   dataArray.forEach(obj => {
//     //     let key = obj.resultDate;
//     //     if (!groupedData[key]) {
//     //       groupedData[key] = [];
//     //     }
//     //     groupedData[key].push(obj);
//     //   });

//     //   Object.keys(groupedData).sort().forEach(date => {
//     //     let objects = groupedData[date];
//     //     objects.filter(obj => obj.session === 'Open').forEach(openObj => {
//     //       sortedData.push(openObj);
//     //       let closeObj = objects.find(obj => obj.session === 'Close');
//     //       if (closeObj) {
//     //         sortedData.push(closeObj);
//     //       }
//     //     });
//     //   });
//     // }
//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.post("/web/panachart", async (req, res) => {
//   // try {
//   //   const name = "TIME BAZAR"; // Example name to filter by
//   //   // const name = req.body.name;

// const provider = await gamesProvider.find().sort({ _id: 1 });
// const result = await gameResult.find().sort({ _id: -1 });

//   //   const groupedData = await result.reduce((acc, item) => {
//   //     const key = item.providerName.toUpperCase();
//   //     acc[key] = [...(acc[key] || []), item];
//   //     return acc;
//   //   }, {});

//   //   const filteredData = await Object.fromEntries(
//   //     Object.entries(groupedData).filter(([key]) =>
//   //       key
//   //         .toLowerCase()
//   //         .replace(/\s+/g, "")
//   //         .includes(name.toLowerCase().replace(/\s+/g, ""))
//   //     )
//   //   );

//   //   const flattenedData = Object.values(filteredData).flat();
//   //   const groupedByWeek = {};
//   //   flattenedData.forEach((item) => {
//   //     const resultDate = new Date(item.resultDate);
//   //     const weekNumber = getWeekNumber(resultDate);
//   //     if (!groupedByWeek[weekNumber]) {
//   //       groupedByWeek[weekNumber] = [];
//   //     }
//   //     groupedByWeek[weekNumber].push(item);
//   //   });

//   //   const groupedDataByWeek = Object.entries(groupedByWeek).map(
//   //     ([weekNumber, items]) => ({
//   //       weekNumber,
//   //       data: items.sort((a, b) => {
//   //         const dateA = new Date(a.resultDate);
//   //         const dateB = new Date(b.resultDate);
//   //         return dateA - dateB;
//   //       }),
//   //     })
//   //   );

//   //   res.send({ data: groupedDataByWeek, status: true });
//   // } catch (e) {
//   //   res.json({
//   //     status: 0,
//   //     message: e.message,
//   //   });
//   // }

//   try {
//     const name = req.body.name;

//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const result = await gameResult.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toUpperCase();
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {});

//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );

//     const flattenedData = Object.values(filteredData).flat();
//     const groupedByWeek = {};
//     flattenedData.forEach((item) => {
//       const resultDate = new Date(item.resultDate);
//       const weekNumber = getMondayOfWeek(resultDate);
//       if (!groupedByWeek[weekNumber]) {
//         groupedByWeek[weekNumber] = {
//           items: [],
//           startDate: null,
//           endDate: null,
//         };
//       }
//       groupedByWeek[weekNumber].items.push(item);
//       if (
//         !groupedByWeek[weekNumber].startDate ||
//         resultDate < groupedByWeek[weekNumber].startDate
//       ) {
//         groupedByWeek[weekNumber].startDate = resultDate;
//       }
//       if (
//         !groupedByWeek[weekNumber].endDate ||
//         resultDate > groupedByWeek[weekNumber].endDate
//       ) {
//         groupedByWeek[weekNumber].endDate = resultDate;
//       }
//     });

//     Object.values(groupedByWeek).forEach((week) => {
//       week.endDate = new Date(week.startDate);
//       week.endDate.setDate(week.endDate.getDate() + 6);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => ({
//         weekNumber,
//         startDate: startDate.toISOString(),
//         endDate: endDate.toISOString(),
//         data: items.sort((a, b) => {
//           const dateA = new Date(a.resultDate);
//           const dateB = new Date(b.resultDate);
//           return dateA - dateB;
//         }),
//       })
//     );

//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.get("/web/startline", async (req, res) => {
//   try {
//     let finalArr = {};
//     const provider1 = await starProvider.find().sort({ providerName: 1 }); // Sort by providerName field

//     for (let index in provider1) {
//       let id = provider1[index]._id;
//       const settings = await starSettings
//         .find({ providerId: id })
//         .sort({ _id: 1 });
//       finalArr[id] = {
//         _id: id,
//         providerName: provider1[index].providerName,
//         providerResult: provider1[index].providerResult,
//         modifiedAt: provider1[index].modifiedAt,
//         resultStatus: provider1[index].resultStatus,
//         gameDetails: settings,
//       };
//     }

//     let finalNew = Object.values(finalArr); // Convert object values to array

//     res.send({ data: finalNew, status: true });
//   } catch (e) {
//     res.json({ message: e });
//   }
// });

router.post("/web/panachart", async (req, res) => {
  try {
    const name = req.body.name;
    const provider = await gamesProvider.find().sort({ _id: 1 });
    const result = await gameResult.find().sort({ _id: -1 });

    const groupedData = result.reduce((acc, item) => {
      const key = item.providerName.toLowerCase().replace(/\s+/g, "");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});

    const filteredData = Object.fromEntries(
      // Object.entries(groupedData).filter(([key]) =>
      //   key
      //     .toLowerCase()
      //     .replace(/\s+/g, "")
      //     .includes(name.toLowerCase().replace(/\s+/g, ""))
      // )
      Object.entries(groupedData).filter(
        ([key]) =>
          key.toLowerCase().replace(/\s+/g, "") ===
          name.toLowerCase().replace(/\s+/g, "")
      )
    );
    const flattenedData = Object.values(filteredData).flat();

    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = moment(item.resultDate, "MM/DD/YYYY");
      const weekStartDate = resultDate.clone().startOf("isoWeek");
      const weekEndDate = resultDate.clone().endOf("isoWeek");
      const weekNumber = weekStartDate.isoWeek();
      const year = weekStartDate.year();

      const weekKey = `${year}-W${weekNumber}`;

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = {
          items: [],
          startDate: weekStartDate.format("YYYY-MM-DD"),
          endDate: weekEndDate.format("YYYY-MM-DD"),
        };
      }
      groupedByWeek[weekKey].items.push(item);
    });

    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => {
        const weekDays = {};
        const start = moment(startDate, "YYYY/MM/DD");
        for (let i = 0; i < 7; i++) {
          const day = start.clone().add(i, "days");
          const formattedDate = day.format("MM/DD/YYYY");
          weekDays[formattedDate] = [
            {
              providerId: items[0].providerId,
              providerName: items[0].providerName,
              session: "Open",
              resultDate: formattedDate,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            },
            {
              providerId: items[0].providerId,
              providerName: items[0].providerName,
              session: "Close",
              resultDate: formattedDate,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            },
          ];
        }
        items.forEach((item) => {
          const formattedDate = item.resultDate;
          if (!weekDays[formattedDate]) {
            weekDays[formattedDate] = [];
          }
          const existingSessionIndex = weekDays[formattedDate].findIndex(
            (dayItem) => dayItem.session === item.session
          );
          if (existingSessionIndex !== -1) {
            weekDays[formattedDate][existingSessionIndex] = item;
          } else {
            weekDays[formattedDate].push(item);
          }
        });

        Object.keys(weekDays).forEach((date) => {
          if (weekDays[date].length < 2) {
            const missingSession =
              weekDays[date][0].session === "Open" ? "Close" : "Open";
            weekDays[date].push({
              providerId: "660f946b8955b92e2c479c37",
              providerName: name,
              session: missingSession,
              resultDate: date,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            });
          }
          weekDays[date].sort((a, b) => a.session.localeCompare(b.session));
        });

        return {
          startDate: startDate,
          endDate: endDate,
          // data: Object.values(weekDays).flat().sort((a, b) => {
          //   const dateA = new Date(a.date || a.resultDate);
          //   const dateB = new Date(b.date || b.resultDate);
          //   return dateA - dateB;
          // }),
          data: Object.values(weekDays)
            .flat()
            .sort((a, b) => {
              const dateA = new Date(a.resultDate);
              const dateB = new Date(b.resultDate);
              if (dateA - dateB !== 0) {
                return dateA - dateB;
              }
              if (a.session === "Open" && b.session === "Close") {
                return -1;
              }
              if (a.session === "Close" && b.session === "Open") {
                return 1;
              }
              return 0;
            }),
        };
      }
    );
    res.send({ data: groupedDataByWeek, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

router.post("/web/jodichart", async (req, res) => {
  try {
    const name = req.body.name;

    const provider = await gamesProvider.find().sort({ _id: 1 });
    const result = await gameResult.find().sort({ _id: -1 });
    const groupedData = result.reduce((acc, item) => {
      const key = item.providerName.toLowerCase().replace(/\s+/g, "");
      acc[key] = [...(acc[key] || []), item];
      return acc;
    }, {});
    const filteredData = Object.fromEntries(
      // Object.entries(groupedData).filter(([key]) =>
      //   key
      //     .toLowerCase()
      //     .replace(/\s+/g, "")
      //     .includes(name.toLowerCase().replace(/\s+/g, ""))
      // )
      Object.entries(groupedData).filter(
        ([key]) =>
          key.toLowerCase().replace(/\s+/g, "") ===
          name.toLowerCase().replace(/\s+/g, "")
      )
    );

    const flattenedData = Object.values(filteredData).flat();

    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = moment(item.resultDate, "MM/DD/YYYY");
      const weekStartDate = resultDate.clone().startOf("isoWeek");
      const weekEndDate = resultDate.clone().endOf("isoWeek");
      const weekNumber = weekStartDate.isoWeek();
      const year = weekStartDate.year();

      const weekKey = `${year}-W${weekNumber}`;

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = {
          items: [],
          startDate: weekStartDate.format("YYYY-MM-DD"),
          endDate: weekEndDate.format("YYYY-MM-DD"),
        };
      }
      groupedByWeek[weekKey].items.push(item);
    });

    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => {
        const weekDays = {};
        const start = moment(startDate, "YYYY-MM-DD");
        for (let i = 0; i < 7; i++) {
          const day = start.clone().add(i, "days");
          const formattedDate = day.format("MM/DD/YYYY");
          weekDays[formattedDate] = [
            {
              providerId: items[0].providerId,
              providerName: items[0].providerName,
              session: "Open",
              resultDate: formattedDate,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            },
            {
              providerId: items[0].providerId,
              providerName: items[0].providerName,
              session: "Close",
              resultDate: formattedDate,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            },
          ];
        }

        items.forEach((item) => {
          const formattedDate = item.resultDate;
          if (!weekDays[formattedDate]) {
            weekDays[formattedDate] = [];
          }
          const existingSessionIndex = weekDays[formattedDate].findIndex(
            (dayItem) => dayItem.session === item.session
          );
          if (existingSessionIndex !== -1) {
            weekDays[formattedDate][existingSessionIndex] = item;
          } else {
            weekDays[formattedDate].push(item);
          }
        });

        Object.keys(weekDays).forEach((date) => {
          if (weekDays[date].length < 2) {
            const missingSession =
              weekDays[date][0].session === "Open" ? "Close" : "Open";
            weekDays[date].push({
              providerId: "660f946b8955b92e2c479c37",
              providerName: weekDays[date][0].providerName,
              session: missingSession,
              resultDate: date,
              winningDigit: "***",
              winningDigitFamily: "*",
              status: 0,
            });
          }
          weekDays[date].sort((a, b) => a.session.localeCompare(b.session));
        });
        return {
          startDate: startDate,
          endDate: endDate,
          data: Object.values(weekDays)
            .flat()
            .sort((a, b) => {
              const dateA = new Date(a.resultDate);
              const dateB = new Date(b.resultDate);
              if (dateA - dateB !== 0) {
                return dateA - dateB;
              }
              if (a.session === "Open" && b.session === "Close") {
                return -1;
              }
              if (a.session === "Close" && b.session === "Open") {
                return 1;
              }
              return 0;
            }),
        };
      }
    );
    res.send({ data: groupedDataByWeek, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

router.get("/web/panachart/all", async (req, res) => {
  try {
    // Fetch all providers and results
    const providers = await gamesProvider.find().sort({ _id: 1 });
    const results = await gameResult.find().sort({ _id: -1 });

    // Group data by resultDate
    const groupedDataByDate = results.reduce((acc, item) => {
      const resultDate = item.resultDate;
      if (!acc[resultDate]) {
        acc[resultDate] = [];
      }
      acc[resultDate].push(item);
      return acc;
    }, {});

    // Format the data
    const formattedData = Object.entries(groupedDataByDate).map(
      ([resultDate, items]) => ({
        resultDate: resultDate,
        results: items
      })
    );

    res.send({ data: formattedData, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

router.get("/web/jodichart/all", async (req, res) => {
  try {
    // Fetch all providers and results
    const providers = await gamesProvider.find().sort({ _id: 1 });
    const results = await gameResult.find().sort({ _id: -1 });

    // Group data by resultDate
    const groupedDataByDate = results.reduce((acc, item) => {
      const resultDate = item.resultDate;
      if (!acc[resultDate]) {
        acc[resultDate] = [];
      }
      acc[resultDate].push(item);
      return acc;
    }, {});

    // Format the data
    const formattedData = Object.entries(groupedDataByDate).map(
      ([resultDate, items]) => ({
        resultDate: resultDate,
        results: items,
      })
    );

    res.send({ data: formattedData, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

router.post("/web/startline_pana_chart", async (req, res) => {
  try {
    const { name } = req.body;
    let timeMatch = name.match(/^(\d+:\d+)([ap]m)$/i);
    let time = timeMatch[1];
    let period = timeMatch[2].toUpperCase();
    let formattedTime = `${time} ${period}`;
    let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
    const results = await starline_game_Result
      .find({ providerName: formattedTime })
      .sort({ _id: -1 });
    const flattenedData = Object.values(results).flat();

    const groupedByWeek = {};
    flattenedData.forEach((item) => {
      const resultDate = moment(item.resultDate, "MM/DD/YYYY");
      const weekStartDate = resultDate.clone().startOf("isoWeek");
      const weekEndDate = resultDate.clone().endOf("isoWeek");
      const weekNumber = weekStartDate.isoWeek();
      const year = weekStartDate.year();

      const weekKey = `${year}-W${weekNumber}`;

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = {
          items: [],
          startDate: weekStartDate.format("YYYY-MM-DD"),
          endDate: weekEndDate.format("YYYY-MM-DD"),
        };
      }
      groupedByWeek[weekKey].items.push(item);
    });
    let providerId = "620b5a50ab709c4b86fe704c";
    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => {
        providerId = items[0].providerId;
        const weekDays = {};
        const start = moment(startDate, "YYYY-MM-DD");
        for (let i = 0; i < 7; i++) {
          const day = start.clone().add(i, "days");
          const formattedDate = day.format("MM/DD/YYYY");
          weekDays[formattedDate] = [];
        }

        items.forEach((item) => {
          const formattedDate = item.resultDate;
          if (!weekDays[formattedDate]) {
            weekDays[formattedDate] = [];
          }
          weekDays[formattedDate].push(item);
        });

        return {
          startDate,
          endDate,
          weekDays,
        };
      }
    );

    groupedDataByWeek.forEach((week) => {
      Object.keys(week.weekDays).forEach((date) => {
        if (week.weekDays[date].length === 0) {
          week.weekDays[date].push({
            providerId: providerId,
            providerName: UpperCaseFormate,
            resultDate: date,
            winningDigit: "***",
            winningDigitFamily: "*",
            status: "0",
          });
        } else {
          week.weekDays[date] = week.weekDays[date].map((dayItem) => {
            if (dayItem.winningDigit === "**") {
              return {
                providerId: dayItem.providerId,
                providerName: dayItem.providerName,
                resultDate: date,
                winningDigit: "***",
                winningDigitFamily: "*",
                status: dayItem.status,
              };
            }
            return dayItem;
          });
        }
      });
    });
    const finalGroupedDataByWeek = {
      data: groupedDataByWeek.map(({ startDate, endDate, weekDays }) => {
        const data = Object.values(weekDays).flat();
        return {
          startDate,
          endDate,
          data,
        };
      }),
    };

    res.send({ data: finalGroupedDataByWeek.data, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

router.post("/web/jackpot_jodi_chart", async (req, res) => {
  try {
    // const { name } = req.body;
    // const formattedName = name.toLowerCase().replace(/\s+/g, "");
    // let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
    // const results = await ABgameResult.find().sort({ _id: -1 });
    // const groupedData = results.reduce((acc, item) => {
    //   const key = item.providerName.toLowerCase().replace(/\s+/g, "");
    //   acc[key] = [...(acc[key] || []), item];
    //   return acc;
    // }, {});

    // const filteredData = Object.fromEntries(
    //   Object.entries(groupedData).filter(([key]) =>
    //     key.includes(formattedName)
    //   )
    // );

    // const flattenedData = Object.values(filteredData).flat();

    const { name } = req.body;
    let timeMatch = name.match(/^(\d+:\d+)([ap]m)$/i);
    let time = timeMatch[1];
    let period = timeMatch[2].toUpperCase();
    let formattedTime = `${time} ${period}`;
    let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
    const results = await ABgameResult.find({
      providerName: formattedTime,
    }).sort({ _id: -1 });
    const flattenedData = Object.values(results).flat();

    const groupedByWeek = {};

    flattenedData.forEach((item) => {
      const resultDate = moment(item.resultDate, "MM/DD/YYYY");
      const weekStartDate = resultDate.clone().startOf("isoWeek");
      const weekEndDate = resultDate.clone().endOf("isoWeek");
      const weekNumber = weekStartDate.isoWeek();
      const year = weekStartDate.year();

      const weekKey = `${year}-W${weekNumber}`;

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = {
          items: [],
          startDate: weekStartDate.format("YYYY-MM-DD"),
          endDate: weekEndDate.format("YYYY-MM-DD"),
        };
      }
      groupedByWeek[weekKey].items.push(item);
    });
    let providerId = "620b5a50ab709c4b86fe704c";
    const groupedDataByWeek = Object.entries(groupedByWeek).map(
      ([weekNumber, { items, startDate, endDate }]) => {
        providerId = items[0].providerId;
        const weekDays = {};
        const start = moment(startDate, "YYYY-MM-DD");
        for (let i = 0; i < 7; i++) {
          const day = start.clone().add(i, "days");
          const formattedDate = day.format("MM/DD/YYYY");
          weekDays[formattedDate] = [];
        }

        items.forEach((item) => {
          const formattedDate = item.resultDate;
          if (!weekDays[formattedDate]) {
            weekDays[formattedDate] = [];
          }
          weekDays[formattedDate].push(item);
        });

        return {
          startDate,
          endDate,
          weekDays,
        };
      }
    );

    groupedDataByWeek.forEach((week) => {
      Object.keys(week.weekDays).forEach((date) => {
        if (week.weekDays[date].length === 0) {
          week.weekDays[date].push({
            providerId: providerId,
            providerName: UpperCaseFormate,
            resultDate: date,
            winningDigit: "**",
            status: "0",
          });
        } else {
          week.weekDays[date] = week.weekDays[date].map((dayItem) => {
            if (dayItem.winningDigit === "**") {
              return {
                providerId: dayItem.providerId,
                providerName: dayItem.providerName,
                resultDate: date,
                winningDigit: "**",
                status: dayItem.status,
              };
            }
            return dayItem;
          });
        }
      });
    });
    const finalGroupedDataByWeek = {
      data: groupedDataByWeek.map(({ startDate, endDate, weekDays }) => {
        const data = Object.values(weekDays).flat();
        return {
          startDate,
          endDate,
          data,
        };
      }),
    };

    res.send({ data: finalGroupedDataByWeek.data, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

// router.post("/web/jodichart", async (req, res) => {
//   try {
//     const name = req.body.name;

//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const result = await gameResult.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {})
//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );
//     const flattenedData = Object.values(filteredData).flat();

//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = moment(item.resultDate, 'MM/DD/YYYY');
//       const weekStartDate = resultDate.clone().startOf('isoWeek');
//       const weekEndDate = resultDate.clone().endOf('isoWeek');
//       const weekNumber = weekStartDate.isoWeek();
//       const year = weekStartDate.year();

//       const weekKey = `${year}-W${weekNumber}`;

//       if (!groupedByWeek[weekKey]) {
//         groupedByWeek[weekKey] = {
//           items: [],
//           startDate: weekStartDate.format('YYYY-MM-DD'),
//           endDate: weekEndDate.format('YYYY-MM-DD'),
//         };
//       }
//       groupedByWeek[weekKey].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => {
//         const weekDays = {};
//         const start = moment(startDate, 'YYYY/MM/DD');
//         for (let i = 0; i < 7; i++) {
//           const day = start.clone().add(i, 'days');
//           const formattedDate = day.format('MM/DD/YYYY');
//           weekDays[formattedDate] = [{
//             providerId: items[0].providerId,
//             providerName: name,
//             session: "Open",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           },
//           {
//             providerId: items[0].providerId,
//             providerName: name,
//             session: "Close",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           }
//           ];
//         }
//         items.forEach((item) => {
//           const formattedDate = item.resultDate
//           if (!weekDays[formattedDate]) {
//             weekDays[formattedDate] = [];
//           }
//           const existingSessionIndex = weekDays[formattedDate].findIndex((dayItem) => dayItem.session === item.session);
//           if (existingSessionIndex !== -1) {
//             weekDays[formattedDate][existingSessionIndex] = item;
//           } else {
//             weekDays[formattedDate].push(item);
//           }
//         });

//         Object.keys(weekDays).forEach(date => {
//           if (weekDays[date].length < 2) {
//             const missingSession = weekDays[date][0].session === 'Open' ? 'Close' : 'Open';
//             weekDays[date].push(
//               {
//                 providerId: "660f946b8955b92e2c479c37",
//                 providerName: name,
//                 session: missingSession,
//                 resultDate: date,
//                 winningDigit: "***",
//                 winningDigitFamily: "*",
//                 status: 0,
//               }
//             );
//           }
//           weekDays[date].sort((a, b) => a.session.localeCompare(b.session));
//         });

//         return {
//           startDate: startDate,
//           endDate: endDate,
//           data: Object.values(weekDays).flat().sort((a, b) => {
//             const dateA = new Date(a.date || a.resultDate);
//             const dateB = new Date(b.date || b.resultDate);
//             return dateA - dateB;
//           }),
//         };
//       }
//     );

//     // let sortedData = [];
//     // if (groupedDataByWeek.length > 0) {
//     //   let dataArray = groupedDataByWeek[0].data;

//     //   let groupedData = {};
//     //   dataArray.forEach(obj => {
//     //     let key = obj.resultDate;
//     //     if (!groupedData[key]) {
//     //       groupedData[key] = [];
//     //     }
//     //     groupedData[key].push(obj);
//     //   });

//     //   Object.keys(groupedData).sort().forEach(date => {
//     //     let objects = groupedData[date];
//     //     objects.filter(obj => obj.session === 'Open').forEach(openObj => {
//     //       sortedData.push(openObj);
//     //       let closeObj = objects.find(obj => obj.session === 'Close');
//     //       if (closeObj) {
//     //         sortedData.push(closeObj);
//     //       }
//     //     });
//     //   });
//     // }

//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.post("/web/jodichart", async (req, res) => {
// try {
//   const name = req.body.name;
//   // const name = "TIME BAZAR"; // Example name to filter by

//   const provider = await gamesProvider.find().sort({ _id: 1 });
//   const result = await gameResult.find().sort({ _id: -1 });

//   const groupedData = result.reduce((acc, item) => {
//     const key = item.providerName.toUpperCase();
//     acc[key] = [...(acc[key] || []), item];
//     return acc;
//   }, {});

//   const filteredData = Object.fromEntries(
//     Object.entries(groupedData).filter(([key]) =>
//       key
//         .toLowerCase()
//         .replace(/\s+/g, "")
//         .includes(name.toLowerCase().replace(/\s+/g, ""))
//     )
//   );

//   const flattenedData = Object.values(filteredData).flat();
//   const groupedByWeek = {};
//   flattenedData.forEach((item) => {
//     const resultDate = new Date(item.resultDate);
//     const weekNumber = getWeekNumber(resultDate);
//     if (!groupedByWeek[weekNumber]) {
//       groupedByWeek[weekNumber] = {
//         items: [],
//         startDate: null,
//         endDate: null,
//       };
//     }
//     groupedByWeek[weekNumber].items.push({
//       providerId: item.providerId,
//       providerName: item.providerName,
//       session: item.session,
//       resultDate: item.resultDate,
//       winningDigitFamily: item.winningDigitFamily,
//     });
//     if (
//       !groupedByWeek[weekNumber].startDate ||
//       resultDate < groupedByWeek[weekNumber].startDate
//     ) {
//       groupedByWeek[weekNumber].startDate = resultDate;
//     }
//     if (
//       !groupedByWeek[weekNumber].endDate ||
//       resultDate > groupedByWeek[weekNumber].endDate
//     ) {
//       groupedByWeek[weekNumber].endDate = resultDate;
//     }
//   });

//   Object.values(groupedByWeek).forEach((week) => {
//     week.endDate = new Date(week.startDate);
//     week.endDate.setDate(week.endDate.getDate() + 6); // Add 6 days to get the end of the week
//   });

//   const groupedDataByWeek = Object.entries(groupedByWeek).map(
//     ([weekNumber, { items, startDate, endDate }]) => ({
//       weekNumber,
//       startDate: startDate.toISOString(),
//       endDate: endDate.toISOString(), // Convert dates to ISO string format
//       data: items.sort((a, b) => {
//         const dateA = new Date(a.resultDate);
//         const dateB = new Date(b.resultDate);
//         return dateA - dateB;
//       }),
//     })
//   );

//   res.send({ data: groupedDataByWeek, status: true });
// } catch (e) {
//   res.json({
//     status: 0,
//     message: e.message,
//   });
// }

//   try {
//     // const name = "10:00 AM";
//     // const name = "TIME BAZAR"; // Example name to filter by
//     const name = req.body.name;

//     const provider = await gamesProvider.find().sort({ _id: 1 });
//     const result = await gameResult.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {});

//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );

//     const flattenedData = Object.values(filteredData).flat();
//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = new Date(item.resultDate);
//       const weekStartDate = getMondayOfWeek(resultDate);
//       const weekEndDate = new Date(weekStartDate);
//       weekEndDate.setDate(weekStartDate.getDate() + 6);
//       const weekNumber = getWeekNumber(weekStartDate);
//       if (!groupedByWeek[weekNumber]) {
//         groupedByWeek[weekNumber] = {
//           items: [],
//           startDate: weekStartDate,
//           endDate: weekEndDate,
//         };
//       }
//       groupedByWeek[weekNumber].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => ({
//         startDate: startDate,
//         endDate: endDate,
//         data: items.sort((a, b) => {
//           const dateA = new Date(a.resultDate);
//           const dateB = new Date(b.resultDate);
//           return dateA - dateB;
//         }),
//       })
//     );
//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.get("/web/startline", async (req, res) => {
//   try {
//     let finalArr = {};
//     const provider1 = await starProvider.find().sort({ providerName: 1 }); // Sort by providerName field

//     for (let index in provider1) {
//       let id = provider1[index]._id;
//       const settings = await starSettings
//         .find({ providerId: id })
//         .sort({ _id: 1 });
//       finalArr[id] = {
//         _id: id,
//         providerName: provider1[index].providerName,
//         providerResult: provider1[index].providerResult,
//         modifiedAt: provider1[index].modifiedAt,
//         resultStatus: provider1[index].resultStatus,
//         gameDetails: settings,
//       };
//     }

//     let finalNew = Object.values(finalArr); // Convert object values to array

//     res.send({ data: finalNew, status: true });
//   } catch (e) {
//     res.json({ message: e });
//   }
// });

router.get("/web/app_url", async (req, res) => {
  try {
    let appVersionInfo = await AppVersion.findOne();
    let appInfo;
    if (!appVersionInfo.maintainence) {
      appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
      return res.send({ status: true, appInfo });
    } else {
      return res.send({ status: false });
    }
  } catch (e) {
    return res.json({
      status: 0,
      message: e.message,
    });
  }
});

// router.get("/web/app_url", async (req, res) => {
//   try {
//     let appVersionInfo = await AppVersion.findOne();
//     let appInfo;
//     if (!appVersionInfo.maintainence) {
//       appInfo = `${process.env.APK_DOMAIN}/${appVersionInfo.apkFileName}`;
//     } else {
//       appInfo = "Maintenance";
//     }
//     res.send({ status: true, appInfo });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.post("/web/startline_pana_chart", async (req, res) => {
//   try {
//     const name = req.body.name;
//     const provider = await starProvider.find().sort({ _id: 1 });
//     const result = await starline_game_Result.find().sort({ _id: -1 });

//     const groupedData = result.reduce((acc, item) => {
//       const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//       acc[key] = [...(acc[key] || []), item];
//       return acc;
//     }, {})

//     const filteredData = Object.fromEntries(
//       Object.entries(groupedData).filter(([key]) =>
//         key
//           .toLowerCase()
//           .replace(/\s+/g, "")
//           .includes(name.toLowerCase().replace(/\s+/g, ""))
//       )
//     );
//     const flattenedData = Object.values(filteredData).flat();

//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = moment(item.resultDate, 'MM/DD/YYYY');
//       const weekStartDate = resultDate.clone().startOf('isoWeek');
//       const weekEndDate = resultDate.clone().endOf('isoWeek');
//       const weekNumber = weekStartDate.isoWeek();
//       const year = weekStartDate.year();

//       const weekKey = `${year}-W${weekNumber}`;

//       if (!groupedByWeek[weekKey]) {
//         groupedByWeek[weekKey] = {
//           items: [],
//           startDate: weekStartDate.format('YYYY-MM-DD'),
//           endDate: weekEndDate.format('YYYY-MM-DD'),
//         };
//       }
//       groupedByWeek[weekKey].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => {
//         const weekDays = {};
//         const start = moment(startDate, 'YYYY/MM/DD');
//         for (let i = 0; i < 7; i++) {
//           const day = start.clone().add(i, 'days');
//           const formattedDate = day.format('MM/DD/YYYY');
//           weekDays[formattedDate] = [{
//             providerId: "620f6111b9dedf7f75f9df8e",
//             providerName: name,
//             session: "Open",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           },
//           {
//             providerId: "620f6111b9dedf7f75f9df8e",
//             providerName: name,
//             session: "Close",
//             resultDate: formattedDate,
//             winningDigit: "***",
//             winningDigitFamily: "*",
//             status: 0,
//           }
//           ];
//         }
//         items.forEach((item) => {
//           const formattedDate = item.resultDate
//           if (!weekDays[formattedDate]) {
//             weekDays[formattedDate] = [];
//           }

//           const existingSessionIndex = weekDays[formattedDate].findIndex((dayItem) => {
//             dayItem.session === item.session
//           });
//           if (existingSessionIndex !== -1) {
//             weekDays[formattedDate][existingSessionIndex] = item;
//           } else {
//             weekDays[formattedDate].push(item);
//           }
//         });
//         Object.keys(weekDays).forEach(date => {
//           if (weekDays[date].length < 2) {
//             const missingSession = weekDays[date][0].session === 'Open' ? 'Close' : 'Open';
//             weekDays[date].push(
//               {
//                 providerId: "620f6111b9dedf7f75f9df8e",
//                 providerName: name,
//                 session: missingSession,
//                 resultDate: date,
//                 winningDigit: "***",
//                 winningDigitFamily: "*",
//                 status: 0,
//               }
//             );
//           }
//           weekDays[date].sort((a, b) => a.session.localeCompare(b.session));
//         });

//         return {
//           startDate: startDate,
//           endDate: endDate,
//           data: Object.values(weekDays).flat().sort((a, b) => {
//             const dateA = new Date(a.date || a.resultDate);
//             const dateB = new Date(b.date || b.resultDate);
//             return dateA - dateB;
//           }),
//         };
//       }
//     );
//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.post("/web/startline_pana_chart", async (req, res) => {
//   try {
//     // const { name } = req.body;
//     // const formattedName = name.toLowerCase().replace(/\s+/g, "");
//     // let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
//     // const results = await starline_game_Result.find().sort({ _id: -1 });

//     // const groupedData = results.reduce((acc, item) => {
//     //   const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//     //   acc[key] = [...(acc[key] || []), item];
//     //   return acc;
//     // }, {});

//     // const filteredData = Object.fromEntries(
//     //   Object.entries(groupedData).filter(([key]) =>
//     //     key.includes(formattedName)
//     //   )
//     // );

//     const { name } = req.body;
//     let timeMatch = name.match(/^(\d+:\d+)([ap]m)$/i);
//     let time = timeMatch[1];
//     let period = timeMatch[2].toUpperCase();
//     let formattedTime = `${time} ${period}`;
//     let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
//     const results = await starline_game_Result.find({ providerName: formattedTime }).sort({ _id: -1 });
//     const flattenedData = Object.values(results).flat();

//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = moment(item.resultDate, 'MM/DD/YYYY');
//       const weekStartDate = resultDate.clone().startOf('isoWeek');
//       const weekEndDate = resultDate.clone().endOf('isoWeek');
//       const weekNumber = weekStartDate.isoWeek();
//       const year = weekStartDate.year();

//       const weekKey = `${year}-W${weekNumber}`;

//       if (!groupedByWeek[weekKey]) {
//         groupedByWeek[weekKey] = {
//           items: [],
//           startDate: weekStartDate.format('YYYY-MM-DD'),
//           endDate: weekEndDate.format('YYYY-MM-DD'),
//         };
//       }
//       groupedByWeek[weekKey].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => {
//         const weekDays = {};
//         const start = moment(startDate, 'YYYY-MM-DD');
//         for (let i = 0; i < 7; i++) {
//           const day = start.clone().add(i, 'days');
//           const formattedDate = day.format('MM/DD/YYYY');
//           weekDays[formattedDate] = [];
//         }

//         items.forEach((item) => {
//           const formattedDate = item.resultDate;
//           if (!weekDays[formattedDate]) {
//             weekDays[formattedDate] = [];
//           }
//           weekDays[formattedDate].push(item);
//         });

//         return {
//           startDate,
//           endDate,
//           weekDays,
//         };
//       }
//     );

//     groupedDataByWeek.forEach((week) => {
//       Object.keys(week.weekDays).forEach((date) => {
//         if (week.weekDays[date].length === 0) {
//           week.weekDays[date].push({
//             providerId: '620b5a50ab709c4b86fe704c',
//             providerName: UpperCaseFormate,
//             resultDate: date,
//             winningDigit: '***',
//             winningDigitFamily: "*",
//             status: '0',
//           });
//         } else {
//           week.weekDays[date] = week.weekDays[date].map((dayItem) => {
//             if (dayItem.winningDigit === '**') {
//               return {
//                 providerId: dayItem.providerId,
//                 providerName: dayItem.providerName,
//                 resultDate: date,
//                 winningDigit: '***',
//                 winningDigitFamily: "*",
//                 status: dayItem.status,
//               };
//             }
//             return dayItem;
//           });
//         }
//       });
//     });
//     const finalGroupedDataByWeek = {
//       data: groupedDataByWeek.map(({ startDate, endDate, weekDays }) => {
//         const data = Object.values(weekDays).flat();
//         return {
//           startDate,
//           endDate,
//           data,
//         };
//       }),
//     };

//     res.send({ data: finalGroupedDataByWeek.data, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

// router.post("/web/jackpot_jodi_chart", async (req, res) => {
//   try {
// const { name } = req.body;
// const formattedName = name.toLowerCase().replace(/\s+/g, "");

// // const providers = await starProvider.find().sort({ _id: 1 });
// const results = await ABgameResult.find().sort({ _id: -1 });

//     const groupedResults = results.reduce((acc, item) => {
//       const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//       if (!acc[key]) acc[key] = [];
//       acc[key].push(item);
//       return acc;
//     }, {});

//     const filteredResults = Object.entries(groupedResults)
//       .filter(([key]) => key.includes(formattedName))
//       .reduce((acc, [key, value]) => {
//         acc[key] = value;
//         return acc;
//       }, {});
//     const flattenedResults = Object.values(filteredResults).flat();
//     const resultsGroupedByWeek = {};

//     for (const item of flattenedResults) {
//       const resultDate = new Date(item.resultDate);
//       const weekStartDate = getMondayOfWeek(resultDate);
//       const weekEndDate = new Date(weekStartDate);
//       weekEndDate.setDate(weekStartDate.getDate() + 6);
//       const weekNumber = getWeekNumber(weekStartDate);

//       if (!resultsGroupedByWeek[weekNumber]) {
//         resultsGroupedByWeek[weekNumber] = {
//           items: [],
//           startDate: weekStartDate,
//           endDate: weekEndDate,
//         };
//       }

//       resultsGroupedByWeek[weekNumber].items.push(item);
//     }

//     const groupedDataByWeek = Object.entries(resultsGroupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => ({
//         startDate,
//         endDate,
//         data: items.sort((a, b) => new Date(a.resultDate) - new Date(b.resultDate)),
//       })
//     );
//     res.send({ data: groupedDataByWeek, status: true });
//   } catch (error) {
//     res.json({
//       status: false,
//       message: error.message,
//     });
//   }
// });

// router.post("/web/jackpot_jodi_chart", async (req, res) => {
//   try {
//     // const { name } = req.body;
//     // const formattedName = name.toLowerCase().replace(/\s+/g, "");
//     // let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
//     // const results = await ABgameResult.find().sort({ _id: -1 });
//     // const groupedData = results.reduce((acc, item) => {
//     //   const key = item.providerName.toLowerCase().replace(/\s+/g, "");
//     //   acc[key] = [...(acc[key] || []), item];
//     //   return acc;
//     // }, {});

//     // const filteredData = Object.fromEntries(
//     //   Object.entries(groupedData).filter(([key]) =>
//     //     key.includes(formattedName)
//     //   )
//     // );

//     // const flattenedData = Object.values(filteredData).flat();

//     const { name } = req.body;
//     let timeMatch = name.match(/^(\d+:\d+)([ap]m)$/i);
//     let time = timeMatch[1];
//     let period = timeMatch[2].toUpperCase();
//     let formattedTime = `${time} ${period}`;
//     let UpperCaseFormate = name.toUpperCase().replace(/\s+/g, "");
//     const results = await ABgameResult.find({ providerName: formattedTime }).sort({ _id: -1 });
//     const flattenedData = Object.values(results).flat();

//     const groupedByWeek = {};

//     flattenedData.forEach((item) => {
//       const resultDate = moment(item.resultDate, 'MM/DD/YYYY');
//       const weekStartDate = resultDate.clone().startOf('isoWeek');
//       const weekEndDate = resultDate.clone().endOf('isoWeek');
//       const weekNumber = weekStartDate.isoWeek();
//       const year = weekStartDate.year();

//       const weekKey = `${year}-W${weekNumber}`;

//       if (!groupedByWeek[weekKey]) {
//         groupedByWeek[weekKey] = {
//           items: [],
//           startDate: weekStartDate.format('YYYY-MM-DD'),
//           endDate: weekEndDate.format('YYYY-MM-DD'),
//         };
//       }
//       groupedByWeek[weekKey].items.push(item);
//     });

//     const groupedDataByWeek = Object.entries(groupedByWeek).map(
//       ([weekNumber, { items, startDate, endDate }]) => {
//         const weekDays = {};
//         const start = moment(startDate, 'YYYY-MM-DD');
//         for (let i = 0; i < 7; i++) {
//           const day = start.clone().add(i, 'days');
//           const formattedDate = day.format('MM/DD/YYYY');
//           weekDays[formattedDate] = [];
//         }

//         items.forEach((item) => {
//           const formattedDate = item.resultDate;
//           if (!weekDays[formattedDate]) {
//             weekDays[formattedDate] = [];
//           }
//           weekDays[formattedDate].push(item);
//         });

//         return {
//           startDate,
//           endDate,
//           weekDays,
//         };
//       }
//     );

//     groupedDataByWeek.forEach((week) => {
//       Object.keys(week.weekDays).forEach((date) => {
//         if (week.weekDays[date].length === 0) {
//           week.weekDays[date].push({
//             providerId: '620b5a50ab709c4b86fe704c',
//             providerName: UpperCaseFormate,
//             resultDate: date,
//             winningDigit: '**',
//             status: '0',
//           });
//         } else {
//           week.weekDays[date] = week.weekDays[date].map((dayItem) => {
//             if (dayItem.winningDigit === '**') {
//               return {
//                 providerId: dayItem.providerId,
//                 providerName: dayItem.providerName,
//                 resultDate: date,
//                 winningDigit: '**',
//                 status: dayItem.status,
//               };
//             }
//             return dayItem;
//           });
//         }
//       });
//     });
//     const finalGroupedDataByWeek = {
//       data: groupedDataByWeek.map(({ startDate, endDate, weekDays }) => {
//         const data = Object.values(weekDays).flat();
//         return {
//           startDate,
//           endDate,
//           data,
//         };
//       }),
//     };

//     res.send({ data: finalGroupedDataByWeek.data, status: true });
//   } catch (e) {
//     res.json({
//       status: 0,
//       message: e.message,
//     });
//   }
// });

router.get("/web/gamerates", async (req, res) => {
  try {
    const provider = await gameList.find().sort({ _id: 1 });
    res.send({ data: provider });
  } catch (e) {
    return res.json({ message: e });
  }
});

router.get("/web/allStartLine", async (req, res) => {
  try {
    const providers = await starProvider.find().sort({ _id: 1 });
    return res.status(200).send({
      statusCode: 200,
      status: "Success",
      data: providers,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      status: "Failure",
      msg: error.toString(),
    });
  }
});

router.get("/web/allAbList", async (req, res) => {
  try {
    let providers = await AB_provider.find().sort({ _id: 1 });
    return res.status(200).send({
      statusCode: 200,
      status: "Success",
      data: providers,
    });
  } catch (e) {
    return res.status(500).send({
      statusCode: 500,
      status: "Failure",
      msg: e.toString(),
    });
  }
});

router.get("/web/startline_pana_chart/all", async (req, res) => {
  try {
    const results = await starline_game_Result.find().sort({ resultDate: 1 });

    function sortByTime(a, b) {
      const timeA = new Date('1970/01/01 ' + a.providerName);
      const timeB = new Date('1970/01/01 ' + b.providerName); 
      return timeA - timeB;
    }

    const groupedDataByDate = results.reduce((acc, item) => {
      const resultDate = item.resultDate;
      if (!acc[resultDate]) {
        acc[resultDate] = [];
      }
      acc[resultDate].push(item);
      return acc;
    }, {});

    const formattedData = Object.entries(groupedDataByDate).map(
      ([resultDate, items]) => ({
        resultDate,
        results: items
          .sort(sortByTime)
          .map(item => ({
            providerId: item.providerId,
            providerName: item.providerName,
            resultDate: item.resultDate,
            winningDigit: item.winningDigit || "***",
            winningDigitFamily:item.winningDigitFamily === 0 ? 0 : item.winningDigitFamily || "*",
            status: item.status || "0",
          }))
      })
    );

    res.send({ data: formattedData, status: true });
  } catch (e) {
    res.json({  
      status: 0,
      message: e.message,
    });
  }
});

router.get("/web/jackpot_jodi_chart/all", async (req, res) => {
  try {
    const results = await ABgameResult.find().sort({ resultDate: 1 });
    const groupedDataByDate = results.reduce((acc, item) => {
      const resultDate = item.resultDate;
      if (!acc[resultDate]) {
        acc[resultDate] = [];
      }
      acc[resultDate].push(item);
      return acc;
    }, {});

    const getTimeValue = (providerName) => {
      const [time, period] = providerName.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      if (period === "PM" && hours !== 12) hours += 12;
      if (period === "AM" && hours === 12) hours = 0;
      return hours * 60 + minutes; 
    };

    const formattedData = Object.entries(groupedDataByDate).map(
      ([resultDate, items]) => ({
        resultDate,
        results: items
          .sort((a, b) => getTimeValue(a.providerName) - getTimeValue(b.providerName))
          .map(item => ({
            providerId: item.providerId,
            providerName: item.providerName,
            resultDate: item.resultDate,
            winningDigit: item.winningDigit || "**", // Default value if missing
            status: item.status || "0",              // Default value if missing
          }))
      })
    );

    // Send the response
    res.send({ data: formattedData, status: true });
  } catch (e) {
    res.json({
      status: 0,
      message: e.message,
    });
  }
});

function getWeekNumber(date) {
  const onejan = new Date(date.getFullYear(), 0, 1);
  const weekStart = 1; // 0 for Sunday, 1 for Monday
  let dayOfWeek = onejan.getDay() - weekStart;
  if (dayOfWeek < 0) dayOfWeek += 7;

  const startOfFirstWeek = onejan.getTime() - dayOfWeek * 86400000;
  const weekNumber = Math.ceil(
    ((date.getTime() - startOfFirstWeek) / 86400000 + 1) / 7
  );
  return weekNumber;
}

function getMondayOfWeek(date) {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return day === 0 ? new Date(monday.setDate(monday.getDate() + 1)) : monday;
}

module.exports = router;
