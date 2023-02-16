Object.defineProperty(exports, "__esModule", { value: true });

const vscode = require('vscode')
const moment = require('moment')
const globalState = require("./globalState");

/**
 * 从配置项中获取最新设置赋值给全局仓库
 * @param {String} 配置项名称
 */
function refreshGlobalState (key) {
  const keyArr = key.split('.')
  globalState.default[keyArr[1]] = vscode.workspace.getConfiguration().get(key)
}

/**
 * 设置数据值
 * @param {String} key 配置项名称
 * @param {Boolean} text 新值
 * @param {Boolean} isEditConfig 是否修改配置文件值
 */
function setConfig (key, text, isEditConfig) {
  const keyArr = key.split('.')
  globalState.default[keyArr[1]] = text
  if (isEditConfig) {
    vscode.workspace.getConfiguration().update(key, text, true)
  }
}

/**
 * 时间格式化
 * @param {Number} params 
 * @returns String 处理好的时间
 */
function timerFilter (params) {
  if (params - 0 < 10) {
    return "0" + params;
  } else {
    return params;
  }
}

/**
 * 根据时间差计算返回时分秒字符串
 * @param {Number} timediff时间差 
 * @returns String XX时XX分XX秒
 */
function timeDiffToStr (timediff) {
  const hour = parseInt((timediff / 3600) % 24);
  const minute = parseInt((timediff / 60) % 60);
  const second = timediff % 60;
  return timerFilter(hour) + "时" + timerFilter(minute) + "分" + timerFilter(second) + "秒"
}

/**
 * 设置分钟时间
 * @param {*} 功能的key 
 */
function setMinuteHandle (key) {
  let text = ''
  switch (key) {
    case 'worktimer.sedentaryReminderTime':
      text = '多久提醒你该起来活动一下(分钟) 例如 60'
      break;
    case 'worktimer.reminderTimeBeforeOffDuty':
      text = '下班前多久告诉你(分钟) 例如 60'
      break;
    default:
      break;
  }
  vscode.window.showInputBox({
    placeHolder: 'mm',
    prompt: text,
    validateInput: (val) => {
      if (!(/^\d+$/.test(val)) && val > 0) {
        return '请输入正确的时间'
      }
    }
  }).then(text => {
    if (!text) return
    setConfig(key, Number(text), true)
  })
}

/**
 * 数组值累加
 * @param {Array} 参与计算的数组 
 * @returns 和
 */
function accArrayAdd (arrArgs) {
  try {
    var s = 0
    for (var i = arrArgs.length - 1; i >= 0; i--) {
      s = accAdd(s, arrArgs[i])
    }
  } catch (e) {
    s = 0
  }
  return s
}

/**
 * 加法
 * @param {Number} 加数1
 * @param {Number} 加数2
 * @returns 和
 */
function accAdd (arg1, arg2) {
  let r1, r2, m
  try { r1 = arg1.toString().split('.')[1].length } catch (e) { r1 = 0 }
  try { r2 = arg2.toString().split('.')[1].length } catch (e) { r2 = 0 }
  m = Math.pow(10, Math.max(r1, r2))
  return (accMul(arg1, m) + accMul(arg2, m)) / m
}

/**
 * 减法
 * @param {Number} 被减数 
 * @param {Number} 减数
 * @returns 差
 */
function accSub (arg1, arg2) {
  let r1, r2, m, n
  try {
    r1 = arg1.toString().split('.')[1].length
  } catch (e) {
    r1 = 0
  }
  try {
    r2 = arg2.toString().split('.')[1].length
  } catch (e) {
    r2 = 0
  }
  m = Math.pow(10, Math.max(r1, r2))
  // 动态控制精度长度
  n = r1 >= r2 ? r1 : r2
  return ((arg1 * m - arg2 * m) / m).toFixed(n)
}

/**
 * 乘法
 * @param {Number} 被乘数 
 * @param {Number} 乘数
 * @returns 积
 */
function accMul (arg1, arg2) {
  let m = 0; let s1 = arg1.toString(); let s2 = arg2.toString()
  try { m += s1.split('.')[1].length } catch (e) { }
  try { m += s2.split('.')[1].length } catch (e) { }
  return ((Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / Math.pow(10, m))
}

/**
 * 除法
 * @param {Number} 被除数 
 * @param {Number} 除数
 * @returns 商
 */
function accDiv (arg1, arg2) {
  let t1 = 0; let t2 = 0; let r1; let r2
  try { t1 = arg1.toString().split('.')[1].length } catch (e) { }
  try { t2 = arg2.toString().split('.')[1].length } catch (e) { }
  r1 = Number(arg1.toString().replace('.', ''))
  r2 = Number(arg2.toString().replace('.', ''))
  return (r1 / r2) * Math.pow(10, t2 - t1)
}

/**
 * 判断是否和缓存日期是同一天(传入moment对象)
 * @param {moment} 比较日期
 * @returns {boolean} 是否是同一天
 */
function isSameDay (date) {
  if (date.isSame(moment(globalState.default.cacheDate), 'day')) {
    return true
  }
  return false
}

exports.refreshGlobalState = refreshGlobalState;
exports.setConfig = setConfig;
exports.timerFilter = timerFilter;
exports.timeDiffToStr = timeDiffToStr;
exports.setMinuteHandle = setMinuteHandle;
exports.accArrayAdd = accArrayAdd;
exports.accAdd = accAdd;
exports.accSub = accSub;
exports.accMul = accMul;
exports.accDiv = accDiv;
exports.isSameDay = isSameDay;
