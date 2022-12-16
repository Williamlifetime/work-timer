"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const utils = require('../utils')
const globalState = require("../globalState");

/**上次喝水提醒的时间 */
let lastCheckTime = moment()
/**提醒中 */
let processing = false
/**持续工作系数 */
let delayNum = 1
/**今日剩余饮水总量 */
let drinkingWaterTotal = globalState.default.drinkingWaterTotal
/**饮水容器容量 */
let cupCapacity = globalState.default.cupCapacity


/**
 * 喝水提醒
 * @param {Date} 当前时间 
 */
function drinkWaterReminderTimeHandle (now) {
    // 如果不同日的话 重置饮水总量
    if (!now.isSame(lastCheckTime, 'day')) {
        drinkingWaterTotal = globalState.default.drinkingWaterTotal
    }
    if (!globalState.default.showDrinkWaterReminder) return
    const timediff = now.diff(lastCheckTime, 'minutes')
    if (timediff >= utils.accMul(delayNum, globalState.default.drinkWaterReminderTime) && !processing) {
        processing = true
        vscode.window.showInformationMessage(`🥤 喝水时间到！速速拿起你的水杯饮水！`, ...['喝完了', '等会儿再喝']).then(Selection => {
            processing = false
            if (Selection === '喝完了') {
                lastCheckTime = moment()
                drinkingWaterTotal = utils.accSub(drinkingWaterTotal, cupCapacity)
            } else {
                //todo 现在还没有处理饮水总量的逻辑  要处理喝了多少 剩了多少 多喝了多少 并且在 tooltip 中进行展示   单独计量喝水的操作？额外喝水的量
            }
        })
    }
}

exports.drinkWaterReminderTimeHandle = drinkWaterReminderTimeHandle;