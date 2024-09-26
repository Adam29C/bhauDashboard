module.exports = async function(req,res,next) {
    try
    {
        const permissionArray = req.session.colView;

        let mainViewArray = {'main':{showStatus:'0',displayClass:'hide'},'users':{showStatus:'0',displayClass:'hide'},'games':{showStatus:'0',displayClass:'hide'},'gamesProvider':{showStatus:'0',displayClass:'hide'},'gamesSetting':{showStatus:'0',displayClass:'hide'},'gamesRates':{showStatus:'0',displayClass:'hide'},'gamesResult':{showStatus:'0',displayClass:'hide'},'starline':{showStatus:'0',displayClass:'hide'},'starlineProvider':{showStatus:'0',displayClass:'hide'},'starlineSetting':{showStatus:'0',displayClass:'hide'},'starlineRates':{showStatus:'0',displayClass:'hide'},'starlineProfit':{showStatus:'0',displayClass:'hide'},'starlineResult':{showStatus:'0',displayClass:'hide'},'ab':{showStatus:'0',displayClass:'hide'},'abProvider':{showStatus:'0',displayClass:'hide'},'abSetting':{showStatus:'0',displayClass:'hide'},'abRates':{showStatus:'0',displayClass:'hide'},'abProftLoss':{showStatus:'0',displayClass:'hide'},'abResult':{showStatus:'0',displayClass:'hide'},'cg':{showStatus:'0',displayClass:'hide'},'fcg':{showStatus:'0',displayClass:'hide'},'wallet':{showStatus:'0',displayClass:'hide'},'fundRequest':{showStatus:'0',displayClass:'hide'},'exportDebit':{showStatus:'0',displayClass:'hide'},'invoices':{showStatus:'0',displayClass:'hide'},'viewWallet':{showStatus:'0',displayClass:'hide'},'reqONOFF':{showStatus:'0',displayClass:'hide'},'appDebit':{showStatus:'0',displayClass:'hide'},'paytmReq':{showStatus:'0',displayClass:'hide'},'bankReq':{showStatus:'0',displayClass:'hide'},'decDebit':{showStatus:'0',displayClass:'hide'},'notification':{showStatus:'0',displayClass:'hide'},'news':{showStatus:'0',displayClass:'hide'},'app_settings':{showStatus:'0',displayClass:'hide'},'howToPlay':{showStatus:'0',displayClass:'hide'},'noticeBoard':{showStatus:'0',displayClass:'hide'},'profileNote':{showStatus:'0',displayClass:'hide'},'walletContact':{showStatus:'0',displayClass:'hide'},'masters':{showStatus:'0',displayClass:'hide'},'reports':{showStatus:'0',displayClass:'hide'},'jodiAll':{showStatus:'0',displayClass:'hide'},'salesReport':{showStatus:'0',displayClass:'hide'},'starLineSaleReport':{showStatus:'0',displayClass:'hide'},'abSalesReport':{showStatus:'0',displayClass:'hide'},'abTotalBids':{showStatus:'0',displayClass:'hide'},'totalBids':{showStatus:'0',displayClass:'hide'},'ajaySir':{showStatus:'0',displayClass:'hide'},'credDebReport':{showStatus:'0',displayClass:'hide'},'dailyReport':{showStatus:'0',displayClass:'hide'},'biddingReport':{showStatus:'0',displayClass:'hide'},'customerBal':{showStatus:'0',displayClass:'hide'},'allUserBIds':{showStatus:'0',displayClass:'hide'},'userBidsRatio':{showStatus:'0',displayClass:'hide'},'starlineBidsRatio':{showStatus:'0',displayClass:'hide'},'bank':{showStatus:'0',displayClass:'hide'},'manageEmp':{showStatus:'0',displayClass:'hide'},'createEmployee':{showStatus:'0',displayClass:'hide'},'fundReport':{showStatus:'0',displayClass:'hide'},'upiReport':{showStatus:'0',displayClass:'hide'},'delete':{showStatus:'0',displayClass:'hide'},'ocCutting':{showStatus:'0',displayClass:'hide'},'bookie':{showStatus:'0',displayClass:'hide'},'gamesRevert':{showStatus:'0',displayClass:'hide'},'gamesRefund':{showStatus:'0',displayClass:'hide'},'starlineRevert':{showStatus:'0',displayClass:'hide'},'abRevert':{showStatus:'0',displayClass:'hide'}
    }
    
        for(index in permissionArray){
            let keyName = permissionArray[index];
            let display = 'Show';
            let status = 1;
            if(mainViewArray[keyName]){
                mainViewArray[keyName] = {
                    displayClass : display,
                    showStatus : status
                }
            }
        }

        req.view = mainViewArray 
        next()
    }
    catch (e) {
        return Promise.resolve(e);
    }
};