# M1 SDK 接口参考

[返回文档总览](../index.md) | [SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md) | [回调、数据类型与状态参考](./07-callbacks-data-types-and-status-reference.md) | [示例程序与故障排查](./08-examples-and-troubleshooting.md)

## 接口概览

M1 SDK 的核心类是 `robot_sdk::SDKClient`，头文件为 `robot_sdk/sdk_client.hpp`。控制命令通常返回 `std::error_code`，命令发送结果和机器人业务结果需要分别判断。连接、控制权和任务状态之间的关系见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md)。

| 接口章节 | 主要内容 | 常用接口 |
| --- | --- | --- |
| [连接与设备信息](./06-01-connection-and-device-info.md) | 客户端构造、连接与重连、版本查询及机型能力 | `SDKClient`、`Connect()`、`GetConnectionState()`、`GetDeviceInfo()` |
| [机器人控制](./06-02-robot-control.md) | 控制权、软件急停、姿态和运动命令 | `TakeControl()`、`SoftEmergencyStop()`、`StandUp()`、`Move()` |
| [数据上报](./06-03-data-reporting.md) | 注册回调，配置传感器及高频状态上报 | `SetControlCallback()`、`SetDataCallback()`、`SetImuConfig()` |
| [充电桩与任务](./06-04-dock-and-tasks.md) | 充电桩扫描、配对、回充与离桩任务、机器状态切换 | `SetDockScanConfig()`、`ConnectDock()`、`StartRechargeTask()`、`StartUnDockTask()` |
| [外设与相机](./06-05-peripherals-and-camera.md) | 补光灯、停障开关、相机码率、外设电源和状态 LED | `FrontLight()`、`UpdateCameraBitrate()`、`SetPeriphPower()`、`SetLedCommand()` |

## 通用参数和返回值

除 `Connect()`、`Disconnect()`、状态查询和版本查询接口外，命令接口通常包含以下公共参数：

| 参数 | 类型 | 说明 |
| --- | --- | --- |
| `timeout_ms` | `int` | `0` 表示异步发送；大于 `0` 表示同步等待，单位为毫秒 |
| `handler` | `WriteHandler` | 异步模式下接收发送结果的回调 |

```cpp
using WriteHandler =
    std::function<void(const std::error_code&, std::size_t)>;
```

返回值的含义：

- 异步模式下，函数立即返回，后续结果由 `handler` 返回。
- 同步模式下，函数阻塞等待本次调用结果或超时，结果由返回的 `std::error_code` 表示。
- 机器人是否实际执行命令，还要看对应的控制应答回调、状态回调或 `RobotState`。

常见错误：

| 错误 | 整数值 | 含义 |
| --- | ---: | --- |
| `robot_sdk::Errc::Success` | 0 | 成功 |
| `robot_sdk::Errc::ShakeHandFailed` | 10000 | 握手失败 |
| `robot_sdk::Errc::ProtocolMismatch` | 10001 | 协议版本不匹配 |
| `robot_sdk::Errc::ControlledDenial` | 10002 | 控制被拒绝 |
| `robot_sdk::Errc::ConnectFailed` | 10003 | 连接失败 |
| `robot_sdk::Errc::UnsupportedDeviceOperation` | 10004 | 当前机型不支持该操作 |
| `robot_sdk::Errc::UnknownError` | 19999 | 未分类的 SDK 错误 |
| `std::errc::invalid_argument` | — | 参数越界或参数组合无效 |
| `std::errc::not_connected` | — | 尚未建立连接 |
| `std::errc::timed_out` | — | 等待超时 |
| `std::errc::operation_canceled` | — | 操作已取消 |
| `std::errc::operation_in_progress` | — | 相同操作正在进行 |

### 判断与记录 SDK 错误

应用可直接与 `robot_sdk::Errc` 枚举比较。`Errc::UnsupportedDeviceOperation` 也可用标准错误条件 `std::errc::operation_not_supported` 判断。

```cpp
// ec 为 SDK 接口返回的 std::error_code。
if (ec) {
    std::cerr << ec.category().name() << " [" << ec.value()
              << "] " << ec.message() << '\n';
    if (ec == robot_sdk::Errc::UnsupportedDeviceOperation) {
        // 按当前机型禁用相应功能。
    }
}
```

SDK 专用错误的类别名为 `Robot`。回充与离桩失败时，查询[任务业务错误码](./07-callbacks-data-types-and-status-reference.md#回充与离桩业务错误码)。扩展说明见[官方 SDK 错误码文档](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/zh/sdk_error_zh.md)。
