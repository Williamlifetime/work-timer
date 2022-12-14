"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const utils = require("../utils");
const globalState = require("../globalState");

let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

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

exports.StatusBar = statusBar;
exports.updateStatusBarItem = updateStatusBarItem;