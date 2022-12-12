const vscode = require('vscode')
const moment = require('moment')

moment.locale('zh-cn')
let myStatusBarItem
const config = vscode.workspace.getConfiguration()
let offDutyTime = config.get('worktimer.offDutyTime')
let isOffDuty = false

exports.activate = function (context) {
  const setOffDutyTime = vscode.commands.registerCommand('extension.setOffDutyTime', setOffDutyTimeHandle);
  context.subscriptions.push(setOffDutyTime);
  // 监听配置项修改
  vscode.workspace.onDidChangeConfiguration(function (event) {
    const configList = ['worktimer.offDutyTime'];
    // affectsConfiguration: 判断是否变更了指定配置项
    const affected = configList.some(item => event.affectsConfiguration(item));
    if (affected) {
      // do some thing ...
      updateStatusBarItem()
    }
  });
  welcomeHandle()
  myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  setInterval(() => {
    updateStatusBarItem()
  }, 1000);
}

// 设置下班时间的命令
async function setOffDutyTimeHandle (command) {
  const text = await vscode.window.showInputBox({
    placeHolder: 'HH:mm',
    prompt: '输入你的下班时间(24小时制)例如 18:30',
    validateInput: (val) => {
      if (!(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val))) {
        return '请输入正确的24小时制时间'
      }
    }
  })
  console.log(text, '提交了');
  offDutyTime = text
  vscode.window.showInformationMessage(text)
  config.update('worktimer.offDutyTime', text, true)
  updateStatusBarItem()
}

function getConfig () {
  console.log(config.get('worktimer.offDutyTime'), 'infof')
}

function updateStatusBarItem () {
  const offDutyTimeArr = offDutyTime.split(':')
  const now = moment()
  const end = moment().hour(offDutyTimeArr[0]).minute(offDutyTimeArr[1]).second(0)
  let timediff = Math.round(end.diff(now) / 1000);
  if (timediff <= 0) {
    isOffDuty = true
    timediff = Math.abs(timediff)
  }
  console.log(timediff, '时间差');
  const hour = parseInt((timediff / 3600) % 24);
  const minute = parseInt((timediff / 60) % 60);
  const second = timediff % 60;
  const text = timerFilter(hour) + "时" + timerFilter(minute) + "分" + timerFilter(second) + "秒"
  myStatusBarItem.text = `${isOffDuty ? '🏃 已经加班 ' : '👨‍💻'}${timerFilter(hour) + "时" + timerFilter(minute) + "分"}`; // 显示文本
  myStatusBarItem.tooltip = `⏲️ ${isOffDuty ? '已经加班' : '距离下班还有'} ${text}` // 浮动提示
  //todo 完善点击后的指令…… 点击后弹出下拉选项  进入多级菜单
  myStatusBarItem.command = {
    title: 'Change stock',
    command: 'extension.setOffDutyTime',
  };
  myStatusBarItem.show();
}

function timerFilter (params) {
  if (params - 0 < 10) {
    return "0" + params;
  } else {
    return params;
  }
}

function welcomeHandle () {
  const currentTime = moment().hour()
  const nickName = config.get('worktimer.nickName')
  let prefix = ''
  if (currentTime < 12) {
    prefix = `早上好~${nickName}~开启元气满满的一天`
  } else if (currentTime >= 12 && currentTime < 14) {
    prefix = `中午好~${nickName}~吃个午饭再休息一下吧`
  } else if (currentTime >= 14 && currentTime < 18) {
    prefix = `下午好~${nickName}~祝你有个愉快的下午`
  } else {
    prefix = `晚上好~${nickName}~祝你有个轻松愉快的夜晚`
  }
  vscode.window.showInformationMessage(prefix)
}