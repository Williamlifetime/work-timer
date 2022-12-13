"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

const vscode = require('vscode')
const config = vscode.workspace.getConfiguration()
let offDutyTime = config.get('worktimer.offDutyTime'); // 下班时间
let nickName = config.get('worktimer.nickName'); // 昵称
let showWelcome = config.get('worktimer.showWelcome'); // 是否展示欢迎语
let isOffDuty = false // 是否下班
let reminderTimeBeforeOffDuty = config.get('worktimer.reminderTimeBeforeOffDuty'); // 下班前多久提示
let showReminderTimeBeforeOffDuty = config.get('worktimer.showReminderTimeBeforeOffDuty'); // 是否在下班前提示

exports.default = {
    /**下班时间*/
    offDutyTime,
    /**昵称*/
    nickName,
    /**是否下班*/
    isOffDuty,
    /**是否展示欢迎语*/
    showWelcome,
    /**下班前多久提示*/
    reminderTimeBeforeOffDuty,
    /**是否在下班前提示*/
    showReminderTimeBeforeOffDuty,
};