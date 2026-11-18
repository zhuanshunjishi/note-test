# 数据上报

[接口概览](./06-sdk-api-reference.md) | [通用参数和返回值](./06-sdk-api-reference.md#通用参数和返回值)

## 回调设置

`SetControlCallback()` 注册控制应答回调，`SetDataCallback()` 注册数据回调。回调对象、线程规则和注册示例见 [M1 回调、数据类型与状态参考](./07-callbacks-data-types-and-status-reference.md#注册回调示例)。

## 数据上报配置

机器人默认主动上报 `RobotState` 和故障信息。下面的接口用于开启或调整传感器和高频状态数据：

| 函数 | 原型 | 回调 | 说明 |
| --- | --- | --- | --- |
| `SetImuConfig` | `std::error_code SetImuConfig(int freq, int timeout_ms = 0, WriteHandler handler = ...)` | `OnImuData` | `freq` 为上报频率，`0` 表示关闭 |
| `SetLuxConfig` | `std::error_code SetLuxConfig(bool on, int timeout_ms = 0, WriteHandler handler = ...)` | `OnLuxData` | 光照强度，开启后固定 1 Hz |
| `SetMcConfig` | `std::error_code SetMcConfig(bool on, int timeout_ms = 0, WriteHandler handler = ...)` | `OnMcData` | 运动数据，开启后固定 50 Hz |
| `SetSpeedReportConfig` | `std::error_code SetSpeedReportConfig(bool on, uint32_t frequency, int timeout_ms = 0, WriteHandler handler = ...)` | `OnSpeedData` | 速度上报频率 1 至 50 Hz |
| `SetJointStateConfig` | `std::error_code SetJointStateConfig(bool on, int timeout_ms = 0, WriteHandler handler = ...)` | `OnJointStateData` | 开关关节状态上报 |

配置命令的生效结果通过 `IControlCallback` 中对应的配置应答回调获取。
