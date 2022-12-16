"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const utils = require("../utils");
const globalState = require("../globalState");
const config = vscode.workspace.getConfiguration()

/**
 * 总菜单
 * @param {*} command 
 */
function menuHandle (command) {
    const options = [
        '下班提醒',
        '久坐提醒',
        '喝水提醒',
        '设置自定义昵称',
    ]
    vscode.window.showQuickPick(options, {
        placeHolder: '选择你想要操作的模块'
    }).then(res => {
        switch (res) {
            case '下班提醒':
                offDutyMenu()
                break;
            case '设置自定义昵称':
                setNickNameHandle()
                break
            case '久坐提醒':
                SedentaryMenu()
                break
            case '喝水提醒':
                drinkWaterMenu()
                break
            default:
                break;
        }
    })
}

/**
 * 下班提醒
 */
function offDutyMenu () {
    const options = [
        '设置下班时间',
        '设置下班前提醒时间',
    ]
    vscode.window.showQuickPick(options, {
        placeHolder: '选择你的操作'
    }).then(res => {
        switch (res) {
            case '设置下班时间':
                setOffDutyTimeHandle()
                break;
            case '设置下班前提醒时间':
                utils.setMinuteHandle('worktimer.reminderTimeBeforeOffDuty')
                break;
            default:
                break;
        }
    })
}

/**
 * 久坐提醒
 */
function SedentaryMenu () {
    const options = [
        '是否开启久坐提醒',
        '设置久坐提醒时间',
    ]
    vscode.window.showQuickPick(options, {
        placeHolder: '选择你的操作'
    }).then(res => {
        switch (res) {
            case '是否开启久坐提醒':
                switchHandle('worktimer.showSedentaryReminder')
                break
            case '设置久坐提醒时间':
                utils.setMinuteHandle('worktimer.sedentaryReminderTime')
                break
            default:
                break;
        }
    })
}

/**
 * 喝水提醒
 */
function drinkWaterMenu () {
    const options = [
        '是否开启喝水提醒',
        '设置喝水提醒时间',
    ]
    vscode.window.showQuickPick(options, {
        placeHolder: '选择你的操作'
    }).then(res => {
        switch (res) {
            case '是否开启喝水提醒':
                switchHandle('worktimer.showDrinkWaterReminder')
                break
            case '设置喝水提醒时间':
                utils.setMinuteHandle('worktimer.drinkWaterReminderTime')
                break
            default:
                break;
        }
    })
}

/**
 * 设置下班时间
 */
function setOffDutyTimeHandle () {
    vscode.window.showInputBox({
        placeHolder: 'HH:mm',
        prompt: '输入你的下班时间(24小时制)例如 18:30',
        validateInput: (val) => {
            if (!(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val))) {
                return '请输入正确的24小时制时间'
            }
        }
    }).then(text => {
        if (!text) return
        globalState.default.offDutyTime = text
        config.update('worktimer.offDutyTime', text, true)
    })
}

/**
 * 设置昵称
 * @param {*} command 
 */
function setNickNameHandle (command) {
    vscode.window.showInputBox({
        placeHolder: '你的昵称',
        prompt: '怎么称呼你',
        validateInput: (val) => {
            if (!val) {
                return '请输入昵称'
            }
        }
    }).then(text => {
        if (!text) return
        globalState.default.nickName = text
        config.update('worktimer.nickName', text, true)
        vscode.window.showInformationMessage(`尊敬的${text}~昵称设置成功~`)
    })
}

/**
 * 是与否选项菜单
 * @param {string} key 
 */
function switchHandle (key) {
    vscode.window.showQuickPick(['开启', '关闭'], {
        placeHolder: '选择你的操作'
    }).then(res => {
        const keyArr = key.split('.')
        switch (res) {
            case '开启':
                globalState.default[keyArr[1]] = true
                config.update(key, true, true)
                vscode.window.showInformationMessage('设置成功~')
                break;
            case '关闭':
                globalState.default[keyArr[1]] = false
                config.update(key, false, true)
                vscode.window.showInformationMessage('设置成功~')
                break;
            default:
                break;
        }
    })
}

exports.menuHandle = menuHandle;