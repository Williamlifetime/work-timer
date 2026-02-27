# work-timer （打工计时器）

**打工计时器**——充分利用工作时间，工作摸鱼两不误。

[![Marketplace](https://img.shields.io/visual-studio-marketplace/v/WilliamMa.work-timer.svg?label=Marketplace&style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/items?itemName=WilliamMa.work-timer)
[![Installs](https://img.shields.io/visual-studio-marketplace/i/WilliamMa.work-timer.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=WilliamMa.work-timer)
[![Rating](https://img.shields.io/visual-studio-marketplace/stars/WilliamMa.work-timer.svg?style=for-the-badge)](https://marketplace.visualstudio.com/items?itemName=WilliamMa.work-timer)

## Table of contents

- [work-timer（打工计时器）](#work-timer-（打工计时器）)
  - [Table of contents](#table-of-contents)
  - [功能特性](#功能特性)
  - [开发中功能](#开发中功能)

## 功能特性

本插件具有以下特点：

- 下班倒计时实时展示，下班前提示
- 自定义的称呼
- 加班自动计时
- 久坐提示(设置提醒的提醒频次，累计次数)
- 底部状态栏信息
- 定时喝水 & 喝水计量
- 自定义提醒（支持单次、每天、工作日、每周、每月、每年、自定义频率）

## 安装使用

安装插件：[VisualStudio - Marketplace](https://marketplace.visualstudio.com/items?itemName=WilliamMa.work-timer)，VSCode 最低版本要求：`^1.47.3`

## 插件设置

1. Ctrl + Shift + P 打开命令行输入 打工计时器 进入设置菜单
2. 点击右下角状态栏中的计时器，打开设置菜单

## 自定义提醒

支持创建个性化的提醒，满足各种场景需求。

### 重复类型

| 类型 | 说明 | 示例 |
|------|------|------|
| 单次 | 指定日期时间提醒，触发后自动删除 | 2024-12-25 09:00 |
| 每天 | 每天固定时间提醒 | 每天 09:00 |
| 周一至周五 | 工作日提醒 | 周一至周五 09:00 |
| 每周 | 指定星期几提醒 | 每周一 09:00 |
| 每月 | 指定日期提醒 | 每月 1 日 09:00 |
| 每年 | 指定月日提醒 | 每年 01-01 09:00 |
| 自定义频率 | 每 N 天/周/月/年提醒 | 每 3 天 09:00 |

### 操作说明

- **新增提醒**：设置菜单 > 自定义提醒 > 新增提醒
- **查看/编辑**：设置菜单 > 自定义提醒 > 查看所有提醒
- **开关控制**：在提醒详情中切换开启/关闭
- **删除提醒**：在提醒详情中选择删除

## 开发中功能

- 欢迎提出好的想法~
- [Issues](https://github.com/Williamlifetime/work-timer/issues)

## License

[LICENSE](https://github.com/Williamlifetime/work-timer/blob/main/LICENSE)
