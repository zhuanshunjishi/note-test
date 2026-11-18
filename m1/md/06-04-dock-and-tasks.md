# 充电桩与任务

[接口概览](./06-sdk-api-reference.md) | [通用参数和返回值](./06-sdk-api-reference.md#通用参数和返回值)

## 充电桩配对

以下接口自 SDK v0.2.3 提供，`timeout_ms` 和 `handler` 遵循[通用参数规则](./06-sdk-api-reference.md#通用参数和返回值)。

| 函数原型 | 协议类型 | 应答与结果 |
| --- | --- | --- |
| `std::error_code SetDockScanConfig(bool on, int timeout_ms = 0, WriteHandler handler = ...)` | 1008（`target=302`） | `OnDockScanConfig()` 确认开启或停止扫描，`OnDockScanResult()` 上报发现的设备（1018） |
| `std::error_code ConnectDock(const DockConnectConfig& config, int timeout_ms = 0, WriteHandler handler = ...)` | 1022 | 通过 `config.address` 指定充电桩。检查 `OnDockConnectionAck()` 的受理结果和 `OnDockConnectionResult()` 的最终结果（1024） |
| `std::error_code GetDockInfo(int timeout_ms = 0, WriteHandler handler = ...)` | 1023 | `OnDockInfo()` 返回充电桩信息以及连接、接触和充电状态 |
| `std::error_code DisconnectDock(int timeout_ms = 0, WriteHandler handler = ...)` | 1022 | 断开当前充电桩，使用与连接操作相同的应答和结果回调 |

调用顺序见[充电桩配对流程](./05-sdk-control-flow-and-task-handling.md#充电桩配对)，字段说明见[充电桩数据](./07-callbacks-data-types-and-status-reference.md#充电桩数据)。

## 任务和机器状态

```cpp
std::error_code StartRechargeTask(int timeout_ms = 0, WriteHandler handler = ...);
std::error_code StopRechargeTask(int timeout_ms = 0, WriteHandler handler = ...);
std::error_code StartUnDockTask(int timeout_ms = 0, WriteHandler handler = ...);
std::error_code StopUnDockTask(int timeout_ms = 0, WriteHandler handler = ...);
std::error_code SwitchRemoteState(int timeout_ms = 0, WriteHandler handler = ...);
std::error_code SwitchIdleState(int timeout_ms = 0, WriteHandler handler = ...);
```

| 函数 | 功能 |
| --- | --- |
| `StartRechargeTask` | 启动自主回充任务 |
| `StopRechargeTask` | 停止自主回充任务 |
| `StartUnDockTask` | 启动自主离桩任务 |
| `StopUnDockTask` | 停止自主离桩任务 |
| `SwitchRemoteState` | 切换到远程控制状态 |
| `SwitchIdleState` | 切换到空闲状态 |

命令发送结果由返回值或 `WriteHandler` 获取；命令应答由 `IControlCallback` 获取；任务执行过程和最终状态由 `OnTaskStateData()` 获取。不要把“命令已发送”当作“任务已完成”。

充电、离桩和状态切换的完整处理流程见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#充电与离桩任务)。
