"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment')
const utils = require("../utils");
const globalState = require("../globalState");
const sedentary = require("../sedentary/sedentary");
const drinkWater = require("../drinkWater/drinkWater");
const customReminder = require("../customReminder/customReminder");

let statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

// 提醒标记，防止重复触发
let lunchStartNotified = false
let lunchEndNotified = false
let beforeOffDutyNotified = false

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
    sedentary.sedentaryReminderTimeHandle(now)
    drinkWater.drinkWaterReminderTimeHandle(now)
    customReminder.checkCustomReminders(now)
    reminderTimeBeforeOffDutyHandle(hour, minute, second)
    statusBar.text = `${globalState.default.isOffDuty ? '🏃 已经加班 ' : '👨‍💻'}${utils.timerFilter(hour) + "时" + utils.timerFilter(minute) + "分"}`; // 显示文本
    // 浮动提示
    statusBar.tooltip =
        reminderTimeWhenLunchBreakHandle() + `⏲️ ${globalState.default.isOffDuty ? '已经加班' : '距离下班还有'} ${text}` +
        drinkWater.drinkWaterText()
            .join('\r\n-----------------------------\r\n')
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
    // 使用范围匹配（0-2秒内）防止精确匹配丢失
    const shouldNotify = hour === 0 && reminderTimeBeforeOffDuty == minute && second <= 2
    if (shouldNotify && !beforeOffDutyNotified) {
        beforeOffDutyNotified = true
        vscode.window.showInformationMessage(`${globalState.default.nickName}~距离下班只有${minute}分钟了~收拾东西准备回家！！🥳`)
    }
    // 重置标记（不在提醒时间段时）
    if (!shouldNotify) {
        beforeOffDutyNotified = false
    }
}

/**
 * 午休提示
 * @param {Number} hour
 * @param {Number} minute
 * @param {Number} second
 */
function reminderTimeWhenLunchBreakHandle () {
    if (!globalState.default.showLunchBreakReminder || globalState.default.isOffDuty) return ''
    const lunchBreakArr = globalState.default.lunchBreak.split('-')
    const startArr = lunchBreakArr[0].split(':')
    const endArr = lunchBreakArr[1].split(':')
    const now = moment()
    const start = moment().hour(startArr[0]).minute(startArr[1]).second(0)
    const end = moment().hour(endArr[0]).minute(endArr[1]).second(0)
    let lunchBreakDuration = Math.round(end.diff(start) / 1000);
    let timediff = Math.round(end.diff(now) / 1000);
    if (timediff >= lunchBreakDuration) {
        const startTimeDiff = Math.round(start.diff(now) / 1000)
        // 时间差大于午休时间  还没有到午休
        // 使用范围匹配（0-2秒内）防止精确匹配丢失
        if (startTimeDiff <= 2 && startTimeDiff >= 0 && !lunchStartNotified) {
            lunchStartNotified = true
            vscode.window.showInformationMessage(`🍱 午休时间到！！！速速停下手中工作！！吃饭啦~~~`)
        }
        // 重置午休结束标记
        if (startTimeDiff > 2) {
            lunchEndNotified = false
        }
        const text = utils.timeDiffToStr(Math.max(0, startTimeDiff))
        return `⏰ 距离午休还有 ${text} \r\n-----------------------------\r\n`
    } else if (timediff > 0) {
        // 正在午休
        lunchStartNotified = false // 重置午休开始标记
        const text = utils.timeDiffToStr(timediff)
        return `🕹️ 午休快乐时光还有 ${text} \r\n-----------------------------\r\n`
    } else if (timediff <= 0 && timediff >= -2 && !lunchEndNotified) {
        // 刚刚结束午休（使用范围匹配）
        lunchEndNotified = true
        vscode.window.showInformationMessage(`⛽ 午休结束啦~~打起精神！！加油`)
        return ''
    } else {
        // 午休已经结束
        return ''
    }
}

exports.StatusBar = statusBar;
exports.updateStatusBarItem = updateStatusBarItem;