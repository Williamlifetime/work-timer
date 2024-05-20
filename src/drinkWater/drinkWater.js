"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const utils = require('../utils')
const globalState = require("../globalState");

/**提醒中 */
let processing = false
/**今日饮水目标是否完成 */
let isComplete = false
/**持续工作系数 */
let delayNum = 1
/**今日目标饮水总量 */
const drinkingWaterTotal = function () {
    return globalState.default.drinkingWaterTotal
}
/**今日已饮水总量 */
const drunkWaterTotal = function () {
    return globalState.default.drunkWaterTotal
}
/**饮水容器容量 */
let cupCapacity = function () {
    return globalState.default.cupCapacity
}
/**今日剩余饮水总量 */
let surplusDrinkingWater = utils.accSub(drinkingWaterTotal(), drunkWaterTotal()) || 0


/**
 * 喝水提醒
 * @param {Date} 当前时间 
 */
function drinkWaterReminderTimeHandle (now) {
    // 如果跨日的话，重置剩余饮水总量
    if (!utils.isSameDay(now)) {
        isComplete = false
        utils.setConfig('worktimer.drunkWaterTotal', 0, true)
        utils.setConfig('worktimer.cacheDate', moment().format(), true)
    }
    if (drunkWaterTotal() > drinkingWaterTotal()) {
        isComplete = true
    }
    if (!globalState.default.showDrinkWaterReminder || isComplete) return
    const timediff = now.diff(moment(globalState.default.cacheDate), 'minutes')
    surplusDrinkingWater = utils.accSub(drinkingWaterTotal(), drunkWaterTotal())
    if (timediff >= utils.accMul(delayNum, globalState.default.drinkWaterReminderTime) && !processing) {
        processing = true
        vscode.window.showInformationMessage(`🥤 喝水时间到！速速拿起你的水杯饮水！`, ...['喝完了', '等会儿再喝']).then(Selection => {
            processing = false
            if (Selection === '喝完了') {
                delayNum = 1
                utils.setConfig('worktimer.cacheDate', moment().format(), true)
                if (surplusDrinkingWater > 0) {
                    utils.setConfig('worktimer.drunkWaterTotal', utils.accAdd(drunkWaterTotal(), cupCapacity()), true)
                    surplusDrinkingWater = utils.accSub(drinkingWaterTotal(), drunkWaterTotal())
                    if (surplusDrinkingWater <= 0) {
                        vscode.window.showInformationMessage(`🏅 好耶ヽ(✿ﾟ▽ﾟ)ノ今天的喝水目标达成！`)
                        isComplete = true
                    }
                }
            } else {
                delayNum = Math.ceil(timediff / globalState.default.drinkWaterReminderTime);
            }
        })
    }
}


function drinkWaterText () {
    const textArr = [
        ,
        isComplete ? '今日饮水目标已达成！' : `今日剩余饮水目标：${surplusDrinkingWater} ml`,
        `今日已饮水： ${drunkWaterTotal()} ml`,
    ]
    return textArr
}

exports.drinkWaterReminderTimeHandle = drinkWaterReminderTimeHandle;
exports.drinkWaterText = drinkWaterText;
exports.delayNum = delayNum;
exports.isComplete = isComplete;
exports.surplusDrinkingWater = surplusDrinkingWater;