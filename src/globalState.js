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
let showSedentaryReminder = config.get('worktimer.showSedentaryReminder'); // 是否开启久坐提醒
let sedentaryReminderTime = config.get('worktimer.sedentaryReminderTime'); // 多久提示你该起来活动一下(分钟)
let showDrinkWaterReminder = config.get('worktimer.showDrinkWaterReminder'); // 是否开启喝水提醒
let drinkWaterReminderTime = config.get('worktimer.drinkWaterReminderTime'); // 多久提示你喝水(分钟)
let drinkingWaterTotal = config.get('worktimer.drinkingWaterTotal'); // 每日饮水总量(ml)
let cupCapacity = config.get('worktimer.cupCapacity'); // 饮水容器容量(ml)

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
    /**是否开启久坐提醒*/
    showSedentaryReminder,
    /**多久提示你该起来活动一下(分钟)*/
    sedentaryReminderTime,
    /**是否开启喝水提醒*/
    showDrinkWaterReminder,
    /**多久提示你喝水(分钟)*/
    drinkWaterReminderTime,
    /**每日饮水总量(ml)*/
    drinkingWaterTotal,
    /**饮水容器容量(ml)*/
    cupCapacity,
};