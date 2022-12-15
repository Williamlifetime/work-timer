"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const utils = require("../utils");
const globalState = require("../globalState");

let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
/**上次久坐提醒的时间 */
let lastCheckTime = moment()
/**久坐提醒中 */
let processing = false
/**持续工作系数 */
let delayNum = 1

/**
 * 更新状态栏对象
 */
function updateStatusBarItem () {
    const offDutyTimeArr = globalState.default.offDutyTime.split(':')
    const now = moment()
    const end = moment().hour(offDutyTimeArr[0]).minute(offDutyTimeArr[1]).second(0)
    let timediff = Math.round(end.diff(now) / 1000);
    if (timediff <= 0) {
        globalState.default.isOffDuty = true
        timediff = Math.abs(timediff)
    } else {
        globalState.default.isOffDuty = false
    }
    const hour = parseInt((timediff / 3600) % 24);
    const minute = parseInt((timediff / 60) % 60);
    const second = timediff % 60;
    const text = utils.timerFilter(hour) + "时" + utils.timerFilter(minute) + "分" + utils.timerFilter(second) + "秒"
    sedentaryReminderTimeHandle(now)
    reminderTimeBeforeOffDutyHandle(hour, minute, second)
    statusBar.text = `${globalState.default.isOffDuty ? '🏃 已经加班 ' : '👨‍💻'}${utils.timerFilter(hour) + "时" + utils.timerFilter(minute) + "分"}`; // 显示文本
    statusBar.tooltip = `⏲️ ${globalState.default.isOffDuty ? '已经加班' : '距离下班还有'} ${text}` // 浮动提示
    statusBar.command = {
        command: 'workTimer.menu',
    };
    statusBar.show();
}

/**
 * 下班前提示
 * @param {Number} hour 
 * @param {Number} minute 
 * @param {Number} second 
 */
function reminderTimeBeforeOffDutyHandle (hour, minute, second) {
    if (!globalState.default.showReminderTimeBeforeOffDuty || globalState.default.isOffDuty) return
    const reminderTimeBeforeOffDuty = globalState.default.reminderTimeBeforeOffDuty
    if (!globalState.default.isOffDuty && hour === 0 && reminderTimeBeforeOffDuty == minute && second === 59) {
        vscode.window.showInformationMessage(`${globalState.default.nickName}~距离下班只有${minute}分钟了~收拾东西准备回家！！🥳`)
    }
}

/**
 * 久坐提醒
 * @param {Date} now 
 */
function sedentaryReminderTimeHandle (now) {
    if (!globalState.default.showSedentaryReminder) return
    const timediff = now.diff(lastCheckTime, 'minutes')
    if (timediff >= (delayNum * globalState.default.sedentaryReminderTime) && !processing) {
        processing = true
        vscode.window.showInformationMessage(`🧋 你已经连续辛苦工作 ${delayNum * globalState.default.sedentaryReminderTime} 分钟了~起来活动一下吧`, ...['我已经起来活动了', '等一下再休息']).then(Selection => {
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

exports.StatusBar = statusBar;
exports.updateStatusBarItem = updateStatusBarItem;