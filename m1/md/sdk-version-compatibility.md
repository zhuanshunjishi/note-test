# M1 系统与 SDK 版本兼容性

[返回文档总览](../index.md) | [M1 SDK 快速开始](./04-sdk-quickstart.md)

先确认机器人系统版本，再按下表选择 SDK。完整说明以[官方兼容表](https://github.com/zsibot/genisom_robot_sdk/blob/main/README_zh.md#sdk-与机器人系统版本兼容性)为准。

| M1 系统版本 | 推荐 SDK |
| --- | --- |
| `v0.0.5` ～ `v0.1.0-B` | `v0.0.3` |
| `v0.1.0-C` ～ `v0.2.4` | `v0.1.1` |
| `v0.3.0` | `v0.2.0` |
| `v0.3.1` ～ `v0.3.3` | `v0.2.2` |
| `v0.3.4` | `v0.2.3` |

M1 系统 `v0.3.0` 搭配 SDK `v0.2.1` 时，基础控制和状态读取可用，`UpdateCameraBitrate()` 的协议定义不兼容。使用相机码率接口时，可按上表改用 SDK `v0.2.0`，或将 M1 系统升级至 `v0.3.1` 后选择兼容 SDK。
