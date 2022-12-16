"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const globalState = require("../globalState");
const utils = require('../utils')

/**上次久坐提醒的时间 */
let lastCheckTime = moment()
/**久坐提醒中 */
let processing = false
/**持续工作系数 */
let delayNum = 1

/**
 * 久坐提醒
 * @param {Date} 当前时间 
 */
function sedentaryReminderTimeHandle (now) {
    if (!globalState.default.showSedentaryReminder) return
    const timediff = now.diff(lastCheckTime, 'minutes')
    const currentReminderTime = utils.accMul(delayNum, globalState.default.sedentaryReminderTime)
    if (timediff >= currentReminderTime && !processing) {
        processing = true
        vscode.window.showInformationMessage(`🧋 你已经连续辛苦工作 ${currentReminderTime} 分钟了~起来活动一下吧`, ...['我已经起来活动了', '等一下再休息']).then(Selection => {
            processing = false
            if (Selection === '我已经起来活动了') {
                lastCheckTime = moment()
                delayNum = 1
            } else {
                delayNum += 1
            }
        })
    }
}

exports.sedentaryReminderTimeHandle = sedentaryReminderTimeHandle;