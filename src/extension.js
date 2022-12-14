const vscode = require('vscode')
const moment = require('moment')
const globalState = require("./globalState");
const utils = require("./utils");
const statusBar = require("./statusbar/statusBar");
const config = vscode.workspace.getConfiguration()
moment.locale('zh-cn')

exports.activate = function (context) {
  const menu = vscode.commands.registerCommand('workTimer.menu', menuHandle);
  context.subscriptions.push(menu);
  // 监听配置项修改
  vscode.workspace.onDidChangeConfiguration(function (event) {
    const configList = ['worktimer.offDutyTime', 'worktimer.reminderTimeBeforeOffDuty', 'worktimer.nickName', 'worktimer.showWelcome', 'worktimer.showReminderTimeBeforeOffDuty'];
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
 * 设置下班时间
 * @param {*} command 
 */
function setOffDutyTimeHandle (command) {
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
    updateStatusBarItem()
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
 * 菜单
 * @param {*} command 
 */
function menuHandle (command) {
  const options = [
    '设置下班时间',
    '设置自定义昵称',
  ]
  vscode.window.showQuickPick(options, {
    placeHolder: '选择你的操作'
  }).then(res => {
    switch (res) {
      case '设置下班时间':
        setOffDutyTimeHandle()
        break;
      case '设置自定义昵称':
        setNickNameHandle()
        break
      default:
        break;
    }
  })
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