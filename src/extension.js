const vscode = require('vscode')
const moment = require('moment')
const globalState = require("./globalState");
const utils = require("./utils");
const statusBar = require("./statusbar/statusBar");
const menu = require("./menu/menu");
moment.locale('zh-cn')

exports.activate = function (context) {
  const menuCommand = vscode.commands.registerCommand('workTimer.menu', menu.menuHandle);
  context.subscriptions.push(menuCommand);
  // 监听配置项修改
  vscode.workspace.onDidChangeConfiguration(function (event) {
    const configList = ['worktimer.offDutyTime', 'worktimer.reminderTimeBeforeOffDuty', 'worktimer.nickName', 'worktimer.showWelcome', 'worktimer.showReminderTimeBeforeOffDuty', 'worktimer.showSedentaryReminder', 'worktimer.sedentaryReminderTime', 'worktimer.drinkWaterReminderTime', 'worktimer.showDrinkWaterReminder', 'worktimer.drinkingWaterTotal', 'worktimer.drunkWaterTotal', 'worktimer.cupCapacity', 'worktimer.cacheDate'];
    const affected = configList.find(item => event.affectsConfiguration(item));
    if (affected) {
      utils.refreshData(affected)
      statusBar.updateStatusBarItem()
    }
  });
  welcomeHandle()
  setInterval(() => {
    statusBar.updateStatusBarItem()
  }, 1000);
}

/**
 * 加载插件时右下角弹窗欢迎语
 */
function welcomeHandle () {
  if (!globalState.default.showWelcome) return
  const currentTime = moment().hour()
  const nickName = globalState.default.nickName
  let text = ''
  if (currentTime < 12) {
    text = `早上好~${nickName}~开启元气满满的一天`
  } else if (currentTime >= 12 && currentTime < 14) {
    text = `中午好~${nickName}~吃个午饭再休息一下吧`
  } else if (currentTime >= 14 && currentTime < 18) {
    text = `下午好~${nickName}~再坚持半天就可以下班啦`
  } else {
    text = `晚上好~${nickName}~祝你有个轻松愉快的夜晚`
  }
  vscode.window.showInformationMessage(text)
}