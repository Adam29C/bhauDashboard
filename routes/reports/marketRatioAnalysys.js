const router = require("express").Router();
const gameBids = require("../../model/games/gameBids");
const starBIds = require("../../model/starline/StarlineBids");
const users = require("../../model/API/Users");
const session = require("../helpersModule/session");
const permission = require("../helpersModule/permission");

router.get("/usersBidsRatio", session, permission, async (req, res) => {
  try {
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["userBidsRatio"].showStatus;
    if (check === 1) {
      res.render("./reports/usersBidsRatio", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Market Ratio Analysys"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json(e);
  }
});

router.post("/gameAnalysys", session, async (req, res) => {
  try {
    gameBids.aggregate(
      [
        {
          $group: {
            _id: "$userId",
            countBids: { $sum: 1 },
            sumbiddingPoints: { $sum: "$biddingPoints" },
            sumWinPoint: { $sum: "$gameWinPoints" },
            username: { $first: "$userName" },
            winCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", 1] },
                  then: 1,
                  else: 0
                }
              }
            },
            loseCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", 2] },
                  then: 1,
                  else: 0
                }
              }
            },
            pendingCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", 0] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        }
      ],
      function(error, group) {
        if (error) throw error;
        else res.json(group);
      }
    );
  } catch (error) {
    res.json(error);
  }
});

router.get("/userStarlineRatio", session, permission, async (req, res) => {
  try {
    const userInfo = req.session.details;
    const permissionArray = req.view;
    const check = permissionArray["starlineBidsRatio"].showStatus;
    if (check === 1) {
      res.render("./reports/userStarlineRatio", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Market Ratio Analysys"
      });
    } else {
      res.render("./dashboard/starterPage", {
        userInfo: userInfo,
        permission: permissionArray,
        title: "Dashboard"
      });
    }
  } catch (e) {
    res.json(e);
  }
});

router.post("/gameAnalysysStar", session, async (req, res) => {
  try {
    starBIds.aggregate(
      [
        {
          $group: {
            _id: "$userId",
            countBids: { $sum: 1 },
            sumbiddingPoints: { $sum: "$biddingPoints" },
            sumWinPoint: { $sum: "$gameWinPoints" },
            username: { $first: "$userName" },
            pf: {
              $first: {
                $cond: {
                  if: {
                    $gt: [
                      { $sum: "$biddingPoints" },
                      { $sum: "$gameWinPoints" }
                    ]
                  },
                  then: "In Loss",
                  else: "In Profit"
                }
              }
            },
            winCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", "Win"] },
                  then: 1,
                  else: 0
                }
              }
            },
            loseCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", "Loss"] },
                  then: 1,
                  else: 0
                }
              }
            },
            pendingCount: {
              $sum: {
                $cond: {
                  if: { $eq: ["$winStatus", "Pending"] },
                  then: 1,
                  else: 0
                }
              }
            }
          }
        }
      ],
      function(error, group) {
        if (error) throw error;
        else res.json(group);
      }
    );
  } catch (error) {
    res.json(error);
  }
});

module.exports = router;
