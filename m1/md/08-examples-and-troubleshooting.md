# M1 示例程序与故障排查

[返回文档总览](../index.md) | [M1 SDK 快速开始](./04-sdk-quickstart.md) | [控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md) | [M1 SDK 接口参考](./06-sdk-api-reference.md)

## 示例程序目录

示例位于 SDK 包的 `example/` 目录，全部使用 C++ 编写：

| 文件 | 主要内容 |
| --- | --- |
| `quick_start.cpp` | 只读检查连接、版本和首帧机器人状态 |
| `data.cpp` | 连接机器人并读取数据 |
| `control.cpp` | 综合控制、状态读取、补光灯、停障和急停 |
| `async.cpp` | 异步连接、异步命令和回调 |
| `sync.cpp` | 同步连接、同步命令和返回值检查 |
| `manual_reconnect.cpp` | 手动断开和重新连接 |
| `auto_reconnect.cpp` | 自动重连和连接状态变化 |
| `take_control.cpp` | 控制权事件、申请和释放 |
| `camera_bitrate.cpp` | 设置前后相机码率 |
| `recharge.cpp` | 回充和离桩任务 |
| `led.cpp` | LED 自动模式、手动模式和灯效 |
| `dock_pairing.cpp` | 扫描、选择、连接、查询和断开充电桩 |

## 运行约定

示例的编译和首次运行步骤见 [M1 SDK 快速开始](./04-sdk-quickstart.md#编译官方示例)。

多数示例都使用相同的参数格式：

```text
<程序名> <机器人 IP> <端口>
```

交互示例可按 `h` 查看按键，按 `q` 退出。程序退出前应先停止运动，再断开 SDK 连接。

## 首次连接示例

`quick_start.cpp` 连接机器人后输出版本与设备信息，等待首帧机器人状态，然后断开并退出。运行方法见[快速开始](./04-sdk-quickstart.md#编译官方示例)。

## data.cpp：读取状态

`data.cpp` 用于验证连接和各类数据上报。程序先注册数据与控制回调，再异步连接机器人，并输出 SDK 版本和协议版本。

检查内容：

1. 异步 `Connect()` 是否完成，`GetConnectionState()` 是否进入 `CONNECTED`。
2. `OnRobotStateData()` 是否收到状态。收到 `OnFaultData()` 后检查故障码、级别和消息，空列表表示当前上报的故障已清除。
3. IMU、光强、运动数据、速度和关节状态能否依次开启、接收并关闭。
4. 对应的配置应答回调是否返回设备实际采用的配置。

适合用来判断“网络可达但 SDK 是否真正建立连接”。

## control.cpp：综合控制

`control.cpp` 集中展示机器人控制功能，包含：

- 站立、行走姿态、卧倒、锁定和其他姿态切换，`z` 对应 `StandUp()`，`Z` 对应 `Walk()`；
- `Move()`、`MoveVelocity()`、`Turn()`、`ControlHead()` 和 `HighLowStance()`；
- 速度档位切换；
- 前后补光灯和自动补光模式；
- 停障开关；
- 软急停和状态显示；
- `PosMove()` 位姿目标；
- 外设电源设置和查询；
- 控制权申请、释放以及远程/空闲状态切换；
- 状态 LED 自动/手动模式和灯效；
- 系统版本、设备类型和序列号读取。

该示例用于查看多个控制接口的组合方式，键盘输入会直接触发对应命令。

## async.cpp：异步调用

异步模式下命令接口立即返回，后续调用结果由 `WriteHandler` 返回，机器人应答由 `IControlCallback` 返回。示例包含异步连接回调、数据回调和命令队列。

同步与异步的参数规则及调用结构见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#同步与异步调用)。

异步程序需要自己管理：

- 主线程退出条件；
- 回调对象生命周期；
- 工作线程停止和回收；
- 连接断开后的停止动作；
- 多线程共享状态的同步。

## sync.cpp：同步调用

同步模式适合启动阶段、连接测试和需要立即判断调用结果的流程。运行示例时重点观察超时和返回错误；不要在数据回调或控制回调中调用同步接口。

## reconnect 示例

### manual_reconnect.cpp

手动重连示例使用独立线程处理重连，避免阻塞主循环：

1. 主循环在连接正常时异步发送零速度 `Move()` 命令。
2. 写入回调返回错误时唤醒重连线程。
3. 重连线程同步调用 `Disconnect(true)`，再调用 `Connect(..., true)`。
4. 连接失败时再次断开，等待 2 s 后重试，直至连接成功或程序退出。

该示例不会读取设备信息，也不会重新申请控制权。业务程序如依赖控制权，应在重连后依据控制权事件和应答单独处理。

### auto_reconnect.cpp

自动重连通过 `ConnectionConfig` 配置，字段和默认值见 [M1 SDK 接口参考](./06-01-connection-and-device-info.md#sdkclient)。

自动重连只负责恢复连接，不代表应用自动重新获得控制权。重连后仍需读取控制来源、状态和故障，并按流程重新申请控制权。

## take_control.cpp：控制权

`take_control.cpp` 通过 `OnControlLost()`、`OnControlAvailable()` 和 `OnTakeControlAck()` 处理控制权变化。

运行该示例可以观察控制权丢失、重新可申请、申请应答和主动释放过程。各事件的处理顺序见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#控制权机制)。

## camera_bitrate.cpp：相机码率

该示例设置前后相机码率，并通过 `OnUpdateCameraBitrateAck()` 读取设备实际生效值。参数范围见 [M1 SDK 接口参考](./06-05-peripherals-and-camera.md#相机码率)。

## recharge.cpp：回充和离桩

该示例演示启动和停止回充、启动和停止离桩，以及通过任务状态回调跟踪执行结果。任务流程见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#充电与离桩任务)。

## led.cpp：LED 控制

该示例演示切换 LED 自动/手动模式、设置灯效和查询当前模式。接口和参数见 [M1 SDK 接口参考](./06-05-peripherals-and-camera.md#led-灯效)。

## 充电桩配对示例

在 `example/build/` 下运行，按现场网络替换机器人地址。可选的第三个参数用于指定充电桩地址。

```bash
./dock_pairing 192.168.234.1 8082
```

按 `1` 开始扫描，扫描结果到达后按 `3` 查看、按 `4` 选择设备，再按 `2` 停止扫描。确认已停止扫描后按 `5` 连接，等待最终结果后按 `6` 查询状态。需要断开时按 `7`，按 `q` 退出。参见[充电桩配对流程](./05-sdk-control-flow-and-task-handling.md#充电桩配对)。

## 常见问题

### Connect 返回失败

按以下顺序检查：

1. 检查开发主机 IP 和网卡状态：`ip addr`。
2. 检查机器人地址：WiFi 通常为 `192.168.234.1`，有线通常为 `192.168.168.168`。
3. 检查 UDP 端口是否使用 `8082`。
4. 检查机器人是否已经开机完成。
5. 检查 SDK 使用的架构库是否正确。
6. 查看 `std::error_code::message()` 和构造时的 `ErrorHandler` 输出。

SDK v0.2.3 修复了首次连接失败后卡在 `CONNECTING` 或 `HANDSHAKING` 的问题。收到失败结果并排除原因后，可在同一个 `SDKClient` 实例上重试。该版本也修复了 UDP 握手期间因暂时性套接字错误，或先收到非握手报文而停止接收的问题。

### ping 成功但 SDK 未连接

`ping` 只能证明 IP 层可达，不代表 UDP 端口、协议握手和设备状态正常。检查：

- `Connect()` 返回值；
- `GetConnectionState()`；
- `ProtocolVersion()`；
- 机器人实际使用的端口；
- 当前 SDK 与机器人系统版本是否匹配。

### 连接成功但控制命令无效

连接成功不等于拥有控制权。检查：

1. 是否调用 `TakeControl()`。
2. 是否收到 `OnTakeControlAck()`。
3. `ack.error_code` 是否为 0。
4. `RobotState::control_source` 是否为 `CTRL_SOURCE_SDK`。
5. 是否处于急停、保护、任务或其他禁止运动状态。

### 没有收到传感器数据

`RobotState` 和故障信息会主动上报，IMU、运动数据、速度和关节状态需要先调用对应的配置接口。检查：

- 是否已经注册 `IDataCallback`；
- 是否开启了对应数据上报；
- 回调对象是否仍然存活；
- 回调函数是否因为异常退出；
- 是否在回调中做了阻塞操作。

### 程序启动时找不到 librobot_sdk.so

检查库架构和动态库搜索路径：

```bash
uname -m
find ../lib -name 'librobot_sdk.so*'
export LD_LIBRARY_PATH=/path/to/genisom_robot_sdk-main/lib/x86_64:$LD_LIBRARY_PATH
```

ARM64 设备应使用 `lib/aarch64`。也可以在 CMake 中设置 `BUILD_RPATH`。

### 动作发送成功但动作没有完成

函数返回值或 `WriteHandler` 用于判断本次调用结果，控制应答回调用于判断机器人是否确认命令；两者都不代表动作或任务已经完成。姿态完成情况查看 `RobotState::motion_status`，任务状态查看 `OnTaskStateData()` 和 `TaskStateInfo`。

### 回充或离桩任务失败

在 `OnTaskStateData()` 中记录 `task_type`、`task_status`、`phase` 和 `error_code`。收到 `FAILURE` 后，按任务类型查询[回充与离桩业务错误码](./07-callbacks-data-types-and-status-reference.md#回充与离桩业务错误码)。现场排查可参考[回充、离桩与充电桩标定的使用条件和故障排查](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/zh/sdk_recharge_undock_calibration_conditions_zh.md)。

### 视频没有画面

检查相机镜头和保护膜、RTSP 端口 `8554` / `8555`、网络带宽和相机码率。相机码率设置结果以 `OnUpdateCameraBitrateAck()` 返回值为准。

## 程序退出处理

推荐的退出顺序：

1. 停止运动并发送零速度。
2. 结束回充、离桩或其他运行任务。
3. 释放控制权。
4. 调用 `Disconnect(true)`。
5. 等待应用工作线程退出。
6. 销毁回调对象和 `SDKClient`。

收到 `SIGINT` 或 `SIGTERM` 后，不要直接结束进程，应先执行安全停止和连接清理。

## 问题反馈模板

提交问题时，可复制以下模板并填写。版本和设备信息可用 `Version()`、`ProtocolVersion()`、`SystemVersion()` 和 `GetDeviceInfo()` 获取。

```text
M1 机型与序列号：
机器人系统版本：
SDK 版本与协议版本：
开发主机系统与架构：
连接方式（WiFi / 有线、UDP / WebSocket、目标 IP 和端口）：
最小复现步骤或调用顺序：
预期结果：
实际结果与完整错误日志（错误类别、码值、消息）：
相关回调和状态（适用时填写）：
```
