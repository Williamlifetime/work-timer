"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require('moment');
const utils = require("../utils");
const globalState = require("../globalState");
const config = vscode.workspace.getConfiguration();

// 类型定义
const REMINDER_TYPES = {
    once: '单次',
    daily: '每天',
    weekdays: '周一至周五',
    weekly: '每周',
    monthly: '每月',
    yearly: '每年',
    custom: '自定义频率'
};

const CUSTOM_UNITS = {
    day: '天',
    week: '周',
    month: '月',
    year: '年'
};

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 保存提醒列表到配置
 */
function saveReminders() {
    config.update('worktimer.customReminders', globalState.default.customReminders, true);
}

/**
 * 刷新提醒列表
 */
function refreshReminders() {
    globalState.default.customReminders = vscode.workspace.getConfiguration().get('worktimer.customReminders') || [];
}

/**
 * 自定义提醒主菜单
 */
function customReminderMenu() {
    refreshReminders();
    const reminders = globalState.default.customReminders || [];
    const options = [
        '新增提醒',
        reminders.length > 0 ? '查看所有提醒' : null,
    ].filter(Boolean);

    vscode.window.showQuickPick(options, {
        placeHolder: '自定义提醒管理'
    }).then(res => {
        if (res === '新增提醒') {
            addReminderFlow();
        } else if (res === '查看所有提醒') {
            showReminderList();
        }
    });
}

/**
 * 显示提醒列表
 */
function showReminderList() {
    const reminders = globalState.default.customReminders || [];
    if (reminders.length === 0) {
        vscode.window.showInformationMessage('暂无自定义提醒');
        return;
    }

    const options = reminders.map(r => ({
        label: `${r.enabled ? '✅' : '⬜'} ${r.title}`,
        description: `${REMINDER_TYPES[r.type]} ${r.time}`,
        reminder: r
    }));

    vscode.window.showQuickPick(options, {
        placeHolder: '选择一个提醒进行操作'
    }).then(selected => {
        if (selected) {
            showReminderDetail(selected.reminder);
        }
    });
}

/**
 * 显示单个提醒详情和操作
 */
function showReminderDetail(reminder) {
    const typeDesc = getTypeDescription(reminder);
    const options = [
        reminder.enabled ? '关闭提醒' : '开启提醒',
        '编辑提醒',
        '删除提醒',
        '返回列表'
    ];

    vscode.window.showQuickPick(options, {
        placeHolder: `${reminder.title} - ${typeDesc}`
    }).then(res => {
        switch (res) {
            case '开启提醒':
            case '关闭提醒':
                toggleReminder(reminder);
                break;
            case '编辑提醒':
                editReminderFlow(reminder);
                break;
            case '删除提醒':
                confirmDeleteReminder(reminder);
                break;
            case '返回列表':
                showReminderList();
                break;
        }
    });
}

/**
 * 获取提醒类型描述
 */
function getTypeDescription(reminder) {
    let desc = REMINDER_TYPES[reminder.type];
    switch (reminder.type) {
        case 'once':
            desc += ` (${reminder.date})`;
            break;
        case 'weekly':
            desc += ` (${WEEKDAYS[reminder.dayOfWeek]})`;
            break;
        case 'monthly':
            desc += ` (每月${reminder.dayOfMonth}日)`;
            break;
        case 'yearly':
            desc += ` (${reminder.monthAndDay})`;
            break;
        case 'custom':
            desc += ` (每${reminder.customInterval}${CUSTOM_UNITS[reminder.customUnit]})`;
            break;
    }
    return desc + ` ${reminder.time}`;
}

/**
 * 切换提醒开关
 */
function toggleReminder(reminder) {
    const reminders = globalState.default.customReminders;
    const index = reminders.findIndex(r => r.id === reminder.id);
    if (index !== -1) {
        reminders[index].enabled = !reminders[index].enabled;
        saveReminders();
        vscode.window.showInformationMessage(`提醒 "${reminder.title}" 已${reminders[index].enabled ? '开启' : '关闭'}`);
    }
}

/**
 * 确认删除提醒
 */
function confirmDeleteReminder(reminder) {
    vscode.window.showQuickPick(['确认删除', '取消'], {
        placeHolder: `确定要删除提醒 "${reminder.title}" 吗？`
    }).then(res => {
        if (res === '确认删除') {
            deleteReminder(reminder);
        }
    });
}

/**
 * 删除提醒
 */
function deleteReminder(reminder) {
    const reminders = globalState.default.customReminders;
    const index = reminders.findIndex(r => r.id === reminder.id);
    if (index !== -1) {
        reminders.splice(index, 1);
        saveReminders();
        vscode.window.showInformationMessage(`提醒 "${reminder.title}" 已删除`);
    }
}

/**
 * 新增提醒流程
 */
function addReminderFlow() {
    const newReminder = {
        id: generateId(),
        title: '',
        content: '',
        enabled: true,
        type: 'daily',
        time: '09:00',
        lastTriggerDate: ''
    };

    // 步骤1: 输入标题
    vscode.window.showInputBox({
        placeHolder: '提醒标题',
        prompt: '请输入提醒的简短标题',
        validateInput: (val) => {
            if (!val || val.trim() === '') {
                return '请输入标题';
            }
            if (val.length > 20) {
                return '标题不能超过20个字符';
            }
        }
    }).then(title => {
        if (!title) return;
        newReminder.title = title;

        // 步骤2: 输入内容
        vscode.window.showInputBox({
            placeHolder: '提醒内容',
            prompt: '请输入提醒的详细内容（可选）',
        }).then(content => {
            newReminder.content = content || '';

            // 步骤3: 选择类型
            const typeOptions = Object.entries(REMINDER_TYPES).map(([key, label]) => ({
                label,
                type: key
            }));

            vscode.window.showQuickPick(typeOptions, {
                placeHolder: '选择提醒重复类型'
            }).then(selectedType => {
                if (!selectedType) return;
                newReminder.type = selectedType.type;

                // 根据类型获取额外信息
                collectTypeSpecificInfo(newReminder);
            });
        });
    });
}

/**
 * 收集类型特定信息
 */
function collectTypeSpecificInfo(reminder) {
    switch (reminder.type) {
        case 'once':
            collectDateInfo(reminder);
            break;
        case 'weekly':
            collectDayOfWeekInfo(reminder);
            break;
        case 'monthly':
            collectDayOfMonthInfo(reminder);
            break;
        case 'yearly':
            collectMonthAndDayInfo(reminder);
            break;
        case 'custom':
            collectCustomFrequencyInfo(reminder);
            break;
        default:
            collectTimeInfo(reminder);
    }
}

/**
 * 收集日期信息（单次提醒）
 */
function collectDateInfo(reminder) {
    const today = moment().format('YYYY-MM-DD');
    vscode.window.showInputBox({
        placeHolder: 'YYYY-MM-DD',
        prompt: '请输入提醒日期（如 2024-12-25）',
        value: today,
        validateInput: (val) => {
            if (!(/^\d{4}-\d{2}-\d{2}$/.test(val))) {
                return '请输入正确的日期格式 YYYY-MM-DD';
            }
            if (moment(val).isBefore(moment(), 'day')) {
                return '日期不能早于今天';
            }
        }
    }).then(date => {
        if (!date) return;
        reminder.date = date;
        collectTimeInfo(reminder);
    });
}

/**
 * 收集星期信息（每周提醒）
 */
function collectDayOfWeekInfo(reminder) {
    vscode.window.showQuickPick(WEEKDAYS.map((label, index) => ({
        label,
        value: index
    })), {
        placeHolder: '选择每周几提醒'
    }).then(selected => {
        if (!selected) return;
        reminder.dayOfWeek = selected.value;
        collectTimeInfo(reminder);
    });
}

/**
 * 收集月份日期信息（每月提醒）
 */
function collectDayOfMonthInfo(reminder) {
    const days = [];
    for (let i = 1; i <= 31; i++) {
        days.push({ label: `${i}日`, value: i });
    }
    vscode.window.showQuickPick(days, {
        placeHolder: '选择每月几号提醒'
    }).then(selected => {
        if (!selected) return;
        reminder.dayOfMonth = selected.value;
        collectTimeInfo(reminder);
    });
}

/**
 * 收集月日信息（每年提醒）
 */
function collectMonthAndDayInfo(reminder) {
    vscode.window.showInputBox({
        placeHolder: 'MM-DD',
        prompt: '请输入每年提醒的日期（如 01-01 表示元旦）',
        validateInput: (val) => {
            if (!(/^\d{2}-\d{2}$/.test(val))) {
                return '请输入正确的日期格式 MM-DD';
            }
            const [month, day] = val.split('-').map(Number);
            if (month < 1 || month > 12) {
                return '月份必须在1-12之间';
            }
            if (day < 1 || day > 31) {
                return '日期必须在1-31之间';
            }
        }
    }).then(monthAndDay => {
        if (!monthAndDay) return;
        reminder.monthAndDay = monthAndDay;
        collectTimeInfo(reminder);
    });
}

/**
 * 收集自定义频率信息
 */
function collectCustomFrequencyInfo(reminder) {
    // 先选择单位
    vscode.window.showQuickPick(Object.entries(CUSTOM_UNITS).map(([key, label]) => ({
        label,
        value: key
    })), {
        placeHolder: '选择频率单位'
    }).then(selectedUnit => {
        if (!selectedUnit) return;
        reminder.customUnit = selectedUnit.value;

        // 再输入间隔
        vscode.window.showInputBox({
            placeHolder: '间隔数',
            prompt: `每多少${CUSTOM_UNITS[reminder.customUnit]}提醒一次？`,
            validateInput: (val) => {
                if (!(/^\+?[1-9]\d*$/.test(val))) {
                    return '请输入正整数';
                }
                if (Number(val) > 365) {
                    return '间隔不能超过365';
                }
            }
        }).then(interval => {
            if (!interval) return;
            reminder.customInterval = Number(interval);

            // 设置起始日期
            reminder.startDate = moment().format('YYYY-MM-DD');
            collectTimeInfo(reminder);
        });
    });
}

/**
 * 收集时间信息
 */
function collectTimeInfo(reminder) {
    vscode.window.showInputBox({
        placeHolder: 'HH:mm',
        prompt: '请输入提醒时间（24小时制，如 09:30）',
        value: '09:00',
        validateInput: (val) => {
            if (!(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val))) {
                return '请输入正确的24小时制时间 HH:mm';
            }
        }
    }).then(time => {
        if (!time) return;
        reminder.time = time;
        finalizeReminder(reminder);
    });
}

/**
 * 完成提醒创建
 */
function finalizeReminder(reminder) {
    if (!globalState.default.customReminders) {
        globalState.default.customReminders = [];
    }
    globalState.default.customReminders.push(reminder);
    saveReminders();
    vscode.window.showInformationMessage(`提醒 "${reminder.title}" 创建成功！`);
}

/**
 * 编辑提醒流程
 */
function editReminderFlow(reminder) {
    const options = [
        '修改标题',
        '修改内容',
        '修改时间',
        '修改重复类型',
        '完成编辑'
    ];

    function showEditMenu() {
        vscode.window.showQuickPick(options, {
            placeHolder: `编辑提醒: ${reminder.title}`
        }).then(res => {
            switch (res) {
                case '修改标题':
                    editTitle(reminder, showEditMenu);
                    break;
                case '修改内容':
                    editContent(reminder, showEditMenu);
                    break;
                case '修改时间':
                    editTime(reminder, showEditMenu);
                    break;
                case '修改重复类型':
                    editType(reminder, showEditMenu);
                    break;
                case '完成编辑':
                    vscode.window.showInformationMessage('编辑完成');
                    break;
            }
        });
    }

    showEditMenu();
}

/**
 * 编辑标题
 */
function editTitle(reminder, callback) {
    vscode.window.showInputBox({
        placeHolder: '提醒标题',
        prompt: '请输入新的标题',
        value: reminder.title,
        validateInput: (val) => {
            if (!val || val.trim() === '') {
                return '请输入标题';
            }
            if (val.length > 20) {
                return '标题不能超过20个字符';
            }
        }
    }).then(title => {
        if (!title) {
            callback();
            return;
        }
        reminder.title = title;
        saveReminders();
        vscode.window.showInformationMessage('标题已更新');
        callback();
    });
}

/**
 * 编辑内容
 */
function editContent(reminder, callback) {
    vscode.window.showInputBox({
        placeHolder: '提醒内容',
        prompt: '请输入新的内容',
        value: reminder.content
    }).then(content => {
        reminder.content = content || '';
        saveReminders();
        vscode.window.showInformationMessage('内容已更新');
        callback();
    });
}

/**
 * 编辑时间
 */
function editTime(reminder, callback) {
    vscode.window.showInputBox({
        placeHolder: 'HH:mm',
        prompt: '请输入新的时间',
        value: reminder.time,
        validateInput: (val) => {
            if (!(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(val))) {
                return '请输入正确的24小时制时间 HH:mm';
            }
        }
    }).then(time => {
        if (!time) {
            callback();
            return;
        }
        reminder.time = time;
        reminder.lastTriggerDate = ''; // 重置触发记录
        saveReminders();
        vscode.window.showInformationMessage('时间已更新');
        callback();
    });
}

/**
 * 编辑重复类型
 */
function editType(reminder, callback) {
    const typeOptions = Object.entries(REMINDER_TYPES).map(([key, label]) => ({
        label,
        type: key
    }));

    vscode.window.showQuickPick(typeOptions, {
        placeHolder: '选择新的重复类型'
    }).then(selectedType => {
        if (!selectedType) {
            callback();
            return;
        }

        // 重置类型相关字段
        reminder.type = selectedType.type;
        delete reminder.date;
        delete reminder.dayOfWeek;
        delete reminder.dayOfMonth;
        delete reminder.monthAndDay;
        delete reminder.customInterval;
        delete reminder.customUnit;
        delete reminder.startDate;
        reminder.lastTriggerDate = '';

        // 根据新类型收集信息
        const collectAndSave = () => {
            saveReminders();
            vscode.window.showInformationMessage('重复类型已更新');
            callback();
        };

        switch (reminder.type) {
            case 'once':
                vscode.window.showInputBox({
                    placeHolder: 'YYYY-MM-DD',
                    prompt: '请输入提醒日期',
                    validateInput: (val) => {
                        if (!(/^\d{4}-\d{2}-\d{2}$/.test(val))) {
                            return '请输入正确的日期格式 YYYY-MM-DD';
                        }
                    }
                }).then(date => {
                    if (date) {
                        reminder.date = date;
                        collectAndSave();
                    } else {
                        callback();
                    }
                });
                break;
            case 'weekly':
                vscode.window.showQuickPick(WEEKDAYS.map((label, index) => ({
                    label,
                    value: index
                })), {
                    placeHolder: '选择每周几提醒'
                }).then(selected => {
                    if (selected) {
                        reminder.dayOfWeek = selected.value;
                        collectAndSave();
                    } else {
                        callback();
                    }
                });
                break;
            case 'monthly':
                const days = [];
                for (let i = 1; i <= 31; i++) {
                    days.push({ label: `${i}日`, value: i });
                }
                vscode.window.showQuickPick(days, {
                    placeHolder: '选择每月几号提醒'
                }).then(selected => {
                    if (selected) {
                        reminder.dayOfMonth = selected.value;
                        collectAndSave();
                    } else {
                        callback();
                    }
                });
                break;
            case 'yearly':
                vscode.window.showInputBox({
                    placeHolder: 'MM-DD',
                    prompt: '请输入每年提醒的日期（如 01-01）',
                    validateInput: (val) => {
                        if (!(/^\d{2}-\d{2}$/.test(val))) {
                            return '请输入正确的日期格式 MM-DD';
                        }
                    }
                }).then(monthAndDay => {
                    if (monthAndDay) {
                        reminder.monthAndDay = monthAndDay;
                        collectAndSave();
                    } else {
                        callback();
                    }
                });
                break;
            case 'custom':
                vscode.window.showQuickPick(Object.entries(CUSTOM_UNITS).map(([key, label]) => ({
                    label,
                    value: key
                })), {
                    placeHolder: '选择频率单位'
                }).then(selectedUnit => {
                    if (!selectedUnit) {
                        callback();
                        return;
                    }
                    reminder.customUnit = selectedUnit.value;
                    vscode.window.showInputBox({
                        placeHolder: '间隔数',
                        prompt: `每多少${CUSTOM_UNITS[reminder.customUnit]}提醒一次？`,
                        validateInput: (val) => {
                            if (!(/^\+?[1-9]\d*$/.test(val))) {
                                return '请输入正整数';
                            }
                        }
                    }).then(interval => {
                        if (interval) {
                            reminder.customInterval = Number(interval);
                            reminder.startDate = moment().format('YYYY-MM-DD');
                            collectAndSave();
                        } else {
                            callback();
                        }
                    });
                });
                break;
            default:
                collectAndSave();
        }
    });
}

/**
 * 检查自定义提醒（每秒调用）
 */
function checkCustomReminders(now) {
    const reminders = globalState.default.customReminders || [];
    const today = now.format('YYYY-MM-DD');
    const currentTime = now.format('HH:mm');
    const currentSecond = now.seconds();

    // 只在秒数为0时检查（避免同一分钟内多次触发）
    if (currentSecond !== 0) return;

    reminders.forEach(reminder => {
        if (!reminder.enabled) return;

        // 检查今天是否已经触发过
        if (reminder.lastTriggerDate === today) return;

        // 检查时间是否匹配
        if (reminder.time !== currentTime) return;

        // 检查日期条件
        if (shouldTriggerToday(reminder, now)) {
            triggerReminder(reminder, today);
        }
    });
}

/**
 * 判断今天是否应该触发提醒
 */
function shouldTriggerToday(reminder, now) {
    switch (reminder.type) {
        case 'once':
            return reminder.date === now.format('YYYY-MM-DD');

        case 'daily':
            return true;

        case 'weekdays':
            const dayOfWeek = now.day();
            return dayOfWeek >= 1 && dayOfWeek <= 5; // 周一到周五

        case 'weekly':
            return now.day() === reminder.dayOfWeek;

        case 'monthly':
            return now.date() === reminder.dayOfMonth;

        case 'yearly':
            return now.format('MM-DD') === reminder.monthAndDay;

        case 'custom':
            return shouldTriggerCustom(reminder, now);

        default:
            return false;
    }
}

/**
 * 判断自定义频率是否应该触发
 */
function shouldTriggerCustom(reminder, now) {
    if (!reminder.startDate) return false;

    const startDate = moment(reminder.startDate);
    const nowDate = now.clone().startOf('day');
    const diff = nowDate.diff(startDate, 'days');

    switch (reminder.customUnit) {
        case 'day':
            return diff % reminder.customInterval === 0;
        case 'week':
            return Math.floor(diff / 7) % reminder.customInterval === 0;
        case 'month':
            const monthDiff = nowDate.diff(startDate, 'months');
            return monthDiff % reminder.customInterval === 0;
        case 'year':
            const yearDiff = nowDate.diff(startDate, 'years');
            return yearDiff % reminder.customInterval === 0;
        default:
            return false;
    }
}

/**
 * 触发提醒
 */
function triggerReminder(reminder, today) {
    const message = reminder.content
        ? `🔔 ${reminder.title}: ${reminder.content}`
        : `🔔 ${reminder.title}`;

    vscode.window.showInformationMessage(message);

    // 单次提醒触发后自动删除
    if (reminder.type === 'once') {
        const reminders = globalState.default.customReminders;
        const index = reminders.findIndex(r => r.id === reminder.id);
        if (index !== -1) {
            reminders.splice(index, 1);
            saveReminders();
        }
        return;
    }

    // 其他类型更新最后触发日期
    reminder.lastTriggerDate = today;
    saveReminders();
}

exports.customReminderMenu = customReminderMenu;
exports.checkCustomReminders = checkCustomReminders;
