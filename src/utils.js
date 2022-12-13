Object.defineProperty(exports, "__esModule", { value: true });

const vscode = require('vscode')
const globalState = require("./globalState");

/**
 * 刷新数据状态
 * @param {String} 配置项名称
 */
function refreshData (key) {
  const keyArr = key.split('.')
  globalState.default[keyArr[1]] = vscode.workspace.getConfiguration().get(key)
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

exports.refreshData = refreshData;
exports.timerFilter = timerFilter;
