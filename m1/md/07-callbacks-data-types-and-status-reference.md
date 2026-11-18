# M1 回调、数据类型与状态参考

[返回文档总览](../index.md) | [SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md) | [M1 SDK 接口参考](./06-sdk-api-reference.md) | [示例程序与故障排查](./08-examples-and-troubleshooting.md)

## 回调模型

M1 SDK 使用两类回调：

| 回调接口 | 接收内容 | 注册函数 |
| --- | --- | --- |
| `IDataCallback` | 传感器、机器人状态、故障、控制权事件、任务状态和充电桩上报 | `SetDataCallback()` |
| `IControlCallback` | 机器人对控制命令的应答 | `SetControlCallback()` |

发送结果、命令应答和动作状态的关系见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#调用结果的三个层次)。

## 回调线程规则

回调函数运行在 SDK I/O 线程中。回调中只做快速的数据复制、校验、状态更新和消息入队：

- 不要执行长时间计算。
- 不要执行文件写入、数据库操作或网络请求。
- 不要在回调中调用同步 SDK 接口。
- 共享数据使用原子变量、互斥锁或线程安全队列保护。
- 不要从回调中抛出异常。
- 耗时工作交给应用程序自己的工作线程。

## IDataCallback

```cpp
class IDataCallback {
public:
    virtual void OnImuData(const ImuData& data) {}
    virtual void OnLuxData(const LuxData& data) {}
    virtual void OnMcData(const MotionData& data) {}
    virtual void OnSpeedData(const SpeedData& data) {}
    virtual void OnJointStateData(const JointStateData& data) {}
    virtual void OnRobotStateData(const RobotState& data) {}
    virtual void OnFaultData(const FaultDatas& data) {}
    virtual void OnControlLost(const ControlLostInfo& info) {}
    virtual void OnControlAvailable(const ControlAvailableInfo& info) {}
    virtual void OnTaskStateData(const TaskStateInfo& info) {}
    virtual void OnDockScanResult(const DockScanResult& result) {}
    virtual void OnDockConnectionResult(const DockConnectionResult& result) {}
    virtual ~IDataCallback() = default;
};
```

| 回调 | 触发方式 | 数据 |
| --- | --- | --- |
| `OnImuData` | 开启 IMU 上报后按配置频率触发 | `ImuData` |
| `OnLuxData` | 开启光强上报后固定 1 Hz 触发 | `LuxData` |
| `OnMcData` | 开启运动数据后固定 50 Hz 触发 | `MotionData` |
| `OnSpeedData` | 开启速度上报后按配置频率触发 | `SpeedData` |
| `OnJointStateData` | 开启关节状态上报后触发 | `JointStateData` |
| `OnRobotStateData` | 机器人主动上报，通常 1 Hz | `RobotState` |
| `OnFaultData` | 主动上报当前故障集合 | `FaultDatas` |
| `OnTaskStateData` | 任务状态变化时主动上报 | `TaskStateInfo` |
| `OnDockScanResult` | 扫描期间上报发现的充电桩 | `DockScanResult` |
| `OnDockConnectionResult` | 上报充电桩连接或断开的最终结果 | `DockConnectionResult` |

### 控制权事件

| 回调 | 含义 | 处理建议 |
| --- | --- | --- |
| `OnControlLost` | 当前 SDK 失去控制权 | 立即停止发送普通控制命令 |
| `OnControlAvailable` | 控制权重新可申请 | 由应用工作线程调用 `TakeControl()` |

`OnControlAvailable()` 只表示控制权可用，不表示 SDK 已经获得控制权。实际结果要看 `OnTakeControlAck()`。

## IControlCallback

```cpp
class IControlCallback {
public:
    virtual void OnSoftEmergencyStop(bool on) {}
    virtual void OnStandUp() {}
    virtual void OnBalanceStandUp() {}
    virtual void OnLieDown() {}
    virtual void OnStair() {}
    virtual void OnCrawl() {}
    virtual void OnCrawlWalk() {}
    virtual void OnClimb() {}
    virtual void OnSlim() {}
    virtual void OnGait() {}
    virtual void OnWalk() {}
    virtual void OnPosControl() {}
    virtual void OnSkWalk() {}
    virtual void OnSand() {}
    virtual void OnReverseHeadTail() {}
    virtual void OnSpeed(int speed_level) {}
    virtual void OnLocked() {}
    virtual void OnFrontLight(bool on) {}
    virtual void OnBackLight(bool on) {}
    virtual void OnAutoModeLight(bool on) {}
    virtual void OnObstacleAvoidance(bool on) {}
    virtual void OnLuxConfig(bool on) {}
    virtual void OnImuConfig(int freq) {}
    virtual void OnMcConfig(bool on) {}
    virtual void OnSpeedReportConfig(bool on, uint32_t frequency) {}
    virtual void OnJointStateConfig(bool on) {}
    virtual void OnDockScanConfig(bool on) {}
    virtual void OnTakeControlAck(const TakeControlAck& ack) {}
    virtual void OnReleaseControlAck(const ReleaseControlAck& ack) {}
    virtual void OnUpdateCameraBitrateAck(const CameraBitrateAck& ack) {}
    virtual void OnDockConnectionAck(const DockConnectionAck& ack) {}
    virtual void OnDockInfo(const DockInfo& info) {}
    virtual void OnSwitchRemote() {}
    virtual void OnSwitchIdle() {}
    virtual void OnStartRechargeTask() {}
    virtual void OnStopRechargeTask() {}
    virtual void OnStartUnDockTask() {}
    virtual void OnStopUnDockTask() {}
    virtual void OnSetPeriphPower(const PowerCtrlAck& ack) {}
    virtual void OnGetPeriphPower(const PowerCtrlAck& ack) {}
    virtual void OnSetLedAutoMode(const LedAutoModeAck& ack) {}
    virtual void OnGetLedAutoMode(const LedAutoModeAck& ack) {}
    virtual void OnSetLedCommand(const LedCommandAck& ack) {}
    virtual ~IControlCallback() = default;
};
```

### 应答回调分类

| 分类 | 回调 | 说明 |
| --- | --- | --- |
| 姿态命令 | `OnStandUp()`、`OnWalk()`、`OnLieDown()` 等 | 机器人已收到命令，动作完成看状态数据 |
| 速度和灯光 | `OnSpeed()`、`OnFrontLight()` 等 | 返回机器人确认的设置值 |
| 数据配置 | `OnImuConfig()`、`OnMcConfig()` 等 | 返回生效的配置 |
| 控制权 | `OnTakeControlAck()`、`OnReleaseControlAck()` | 根据 `error_code` 判断业务结果 |
| 相机 | `OnUpdateCameraBitrateAck()` | 返回相机实际码率 |
| 充电桩 | `OnDockScanConfig()`、`OnDockConnectionAck()`、`OnDockInfo()` | 分别返回扫描开关、连接或断开请求是否受理、充电桩信息 |
| 状态和任务 | `OnSwitchRemote()`、`OnStartRechargeTask()` 等 | 命令确认，任务过程看 `OnTaskStateData()` |
| 电源和 LED | `OnSetPeriphPower()`、`OnSetLedCommand()` 等 | 返回设备确认的通道或灯效 |

`Move()`、`MoveVelocity()`、`Turn()`、`ControlHead()`、`HighLowStance()` 和 `PosMove()` 没有专用控制应答回调，发送结果通过 `WriteHandler` 获取。

## 基础类型

### TransportProtocol

| 枚举值 | 整数值 | 说明 |
| --- | ---: | --- |
| `WebSocket` | 0 | WebSocket 传输，使用端口 `8081` |
| `Udp` | 1 | UDP 传输，使用端口 `8082`；`SDKClient` 默认值 |

### DeviceInfo 和 DeviceType

```cpp
struct DeviceInfo {
    DeviceType device_type = DeviceType::UNKNOWN;
    std::string sn;
};
```

| `DeviceType` | 整数值 | 产品类型 |
| --- | ---: | --- |
| `UNKNOWN` | 0 | 未识别或尚未取得设备信息 |
| `M1` | 1 | 中狗轮足 |
| `M1F` | 2 | 中狗点足 |
| `M1_PRO` | 3 | 中狗轮足 Pro |
| `M1F_PRO` | 4 | 中狗点足 Pro |
| `M1_ULTRA` | 5 | 中狗轮足 Ultra |
| `M1F_ULTRA` | 6 | 中狗点足 Ultra |

`device_type` 来自连接握手，`sn` 为机器人序列号。连接成功前或断开后，类型可能为 `UNKNOWN`，序列号可能为空。

## 传感器数据结构

### ImuData

```cpp
struct ImuData {
    float acc_x, acc_y, acc_z;
    float gyro_x, gyro_y, gyro_z;
    float quat_x, quat_y, quat_z, quat_w;
};
```

加速度单位为 m/s²，角速度单位为 rad/s。此结构体的四元数字段顺序为 `x, y, z, w`。

### LuxData

```cpp
struct LuxData {
    float lux;
};
```

`lux` 为照度，单位为 lux。

### MotionData

```cpp
struct MotionData {
    float quat[4];
    float v_world[3];
    float position[3];
    float omega_world[3];
    float v_body[3];
    float omega_body[3];
    uint64_t time_stamp;
};
```

| 字段 | 内容 | 单位 |
| --- | --- | --- |
| `quat` | 世界姿态四元数 `[w, x, y, z]` | — |
| `v_world` | 世界坐标系速度 `[x, y, z]` | m/s |
| `position` | 世界坐标系位置 `[x, y, z]` | m |
| `omega_world` | 世界坐标系角速度 | rad/s |
| `v_body` | 机体坐标系速度 | m/s |
| `omega_body` | 机体坐标系角速度 | rad/s |
| `time_stamp` | 数据时间戳 | ns |

### SpeedData 和 JointStateData

```cpp
struct SpeedData {
    float x;
    float y;
    float yaw;
};

struct JointStateData {
    std::vector<std::string> names;
    std::vector<double> positions;
    std::vector<double> velocities;
    std::vector<double> efforts;
};
```

| 字段 | 含义 | 单位 |
| --- | --- | --- |
| `SpeedData::x` | 前后速度 | m/s |
| `SpeedData::y` | 左右平移速度 | m/s |
| `SpeedData::yaw` | 旋转角速度 | rad/s |
| `JointStateData::positions` | 关节位置 | rad |
| `JointStateData::velocities` | 关节速度 | rad/s |
| `JointStateData::efforts` | 关节力矩 | N·m |

`JointStateData` 的四个数组按照 `names` 的索引一一对应。

## RobotState

```cpp
struct RobotState {
    double head_angle;
    FillLightStatus front_fill_light;
    FillLightStatus back_fill_light;
    bool auto_mode_light;
    bool obstacle_avoidance;
    bool charging_pile_connected;
    SpeedLevel speed_level;
    EmergencyStatus software_emergency_status;
    EmergencyStatus hardware_emergency_status;
    HeadDirection head_direction;
    MotionStatus motion_status;
    MachineStatus machine_status;
    BatteryData battery;
    Speed speed;
    float mile_data;
    std::unordered_map<std::string, double> joint_temps;
    CtrlSource control_source;
};
```

| 字段 | 含义 |
| --- | --- |
| `head_angle` | 头部角度 |
| `front_fill_light` / `back_fill_light` | 前后补光灯状态 |
| `auto_mode_light` | 是否启用自动补光 |
| `obstacle_avoidance` | 是否开启停障 |
| `charging_pile_connected` | 是否连接充电桩 |
| `speed_level` | 当前速度档位 |
| `software_emergency_status` | 软件急停状态 |
| `hardware_emergency_status` | 硬件急停状态 |
| `head_direction` | 当前头尾方向 |
| `motion_status` | 当前身体姿态或运动状态 |
| `machine_status` | 当前机器任务状态 |
| `battery` | 双电池数据 |
| `speed` | 当前实际速度：前后和平移单位为 m/s，旋转单位为 rad/s |
| `mile_data` | 累计里程，单位 m |
| `joint_temps` | 关节名称到温度的映射，单位 ℃ |
| `control_source` | 当前控制来源 |

`motion_status` 描述身体姿态；`machine_status` 描述机器人正在执行的业务，两者不要混用。

`RobotState::speed` 的结构如下：

```cpp
struct Speed {
    double line;         // 前后速度，m/s
    double translation;  // 左右平移速度，m/s
    double angle;        // 旋转角速度，rad/s
};
```

## 电池数据

通过 `OnRobotStateData()` 获取 `RobotState::battery`。

```cpp
struct BatteryData {
    float power1, power2;
    bool present1, present2;
    float voltage1, voltage2;
    float temperature1, temperature2;
    float current1, current2;
    PowerSupplyStatus power_supply_status1;
    PowerSupplyStatus power_supply_status2;
};
```

字段末尾的 `1` 和 `2` 分别表示电池 1 和电池 2。电量为百分比，电压单位为 V，温度单位为 ℃，电流单位为 A。

### PowerSupplyStatus

| 枚举值 | 整数值 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | 0 | 未知 |
| `CHARGING` | 1 | 充电中 |
| `DISCHARGING` | 2 | 放电中 |
| `FULL` | 4 | 已充满 |

## 故障数据

通过 `OnFaultData()` 获取当前故障列表。

```cpp
struct FaultData {
    FaultCode code;
    FaultLevel level;
    std::string message;
};

using FaultDatas = std::vector<FaultData>;
```

### FaultCode 和 FaultLevel

从 SDK v0.2.3 起，`FaultCode` 的底层类型为 `int`，直接承载机器人上报的协议故障码。记录告警时可同时保存数字码、`FaultData::level` 和 `message`。例如，执行器过流的 `message` 为 `Actuator/OverCurrent`。`OnFaultData()` 可能一次返回多条故障，收到空列表表示当前上报的故障已清除。

| `FaultCode` | 整数值 | 含义 |
| --- | ---: | --- |
| `Unknown` | 0 | 未知故障 |
| `SystemClockSanityError` | 1001 | 系统时间跳变 |
| `SystemKeyNodeLifecycleError` | 1002 | 关键节点不可达或生命周期状态异常 |
| `SystemOptNodeLifecycleError` | 1003 | 可选节点不可达或生命周期状态异常 |
| `MotionStateFallError` | 1004 | 检测到机器人跌倒 |
| `IMUConnectError` | 1101 | IMU 连接错误 |
| `IMUDataNotUpdated` | 1102 | IMU 数据更新超时 |
| `IMUCrcError` | 1103 | IMU 数据 CRC 校验失败 |
| `ActuatorOffline` | 1201 | 执行器离线 |
| `ActuatorDisabled` | 1202 | 执行器禁用 |
| `ActuatorTimeout` | 1203 | 执行器控制超时 |
| `ActuatorEncoderError` | 1204 | 执行器编码器错误 |
| `ActuatorOverVoltage` | 1205 | 执行器过压 |
| `ActuatorUndervolt` | 1206 | 执行器欠压 |
| `ActuatorOverCurrent` | 1207 | 执行器过流 |
| `ActuatorOverSpeed` | 1208 | 执行器超速 |
| `ActuatorOverheat` | 1209 | 执行器过热 |
| `ActuatorOverTempWarn` | 1210 | 驱动器检测到温度告警 |
| `ActuatorOverTempProtect` | 1211 | 驱动器触发过温保护 |
| `ActuatorDCOverVoltage` | 1212 | 高速运动引起直流母线过压 |
| `PowerControlOffline` | 1301 | 电源控制板离线 |
| `PowerControlPowerLow` | 1302 | 电池电量低于 20% 且不低于 10%，可由机器人配置关闭上报 |
| `PowerControlPowerEmpty` | 1303 | 电池电量低于 10% |
| `CANBroken` | 1401 | CAN 总线通信故障 |
| `SystemMcBoard…` | 1501–1516 | 运控板 I/O、内存、CPU 使用率、温度和频率诊断 |
| `SystemAlgBoard…` | 1517–1532 | 算力板 I/O、内存、CPU 使用率、温度和频率诊断 |

板卡诊断的逐项码值、协议名称和默认级别见[官方故障码参考](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/en/sdk_type_en.md#faultcode)。

| `FaultLevel` | 整数值 | 含义 |
| --- | ---: | --- |
| `Unknown` | 0 | 未知级别 |
| `FatalError` | 1 | 致命错误 |
| `Error` | 2 | 错误 |
| `Warn` | 3 | 警告 |

## 关键状态枚举

### MotionStatus

| 枚举值 | 整数值 | 含义 |
| --- | ---: | --- |
| `MOTION_STATUS_UNKNOWN` | 0 | 未知 |
| `MOTION_STATUS_STAND_UP` | 1 | 站立过程中 |
| `MOTION_STATUS_WALK` | 2 | 可移动的站立状态 |
| `MOTION_STATUS_BALANCE_STAND` | 3 | 平衡站立 |
| `MOTION_STATUS_LIE_DOWN` | 4 | 卧倒 |
| `MOTION_STATUS_CRAWL` | 5 | 匍匐 |
| `MOTION_STATUS_CRAWL_WALK` | 6 | 匍匐行走 |
| `MOTION_STATUS_LOCKED` | 7 | 锁定 |
| `MOTION_STATUS_CLIMB` | 8 | 爬高台 |
| `MOTION_STATUS_STAIR` | 9 | 登阶 |
| `MOTION_STATUS_SLIM` | 10 | 瘦身过窄道 |
| `MOTION_STATUS_GAIT` | 11 | 精细步态 |
| `MOTION_STATUS_POS_CONTROL` | 13 | 位控 |
| `MOTION_STATUS_SK_WALK` | 14 | 同膝行走 |
| `MOTION_STATUS_SAND` | 15 | 沙地姿态 |

### MachineStatus

| 枚举值 | 整数值 | 含义 |
| --- | ---: | --- |
| `UNKNOWN` | 0 | 未知 |
| `IDLE` | 1 | 空闲 |
| `REMOTE` | 2 | 远程控制 |
| `OTA` | 3 | OTA 升级 |
| `RECHARGE` | 4 | 回充 |
| `MAPPING` | 5 | 建图 |
| `NAVIGATION` | 6 | 导航 |
| `SAFETY` | 7 | 安全保护 |
| `SELFTEST` | 8 | 自检 |
| `SOFT_SHUTDOWN` | 9 | 软关机 |
| `SILENCE` | 10 | 静音待机 |
| `FOLLOW` | 11 | 跟随 |
| `TRACK` | 12 | 跟踪 |
| `UNDOCK` | 13 | 离桩 |
| `DOCK_CALIBRATION` | 14 | 充电桩标定 |
| `ESTOP` | 15 | 急停 |
| `FALL` | 16 | 摔倒 |
| `LOCAL_REMOTE` | 17 | 本地遥控 |
| `LOW_LEVEL` | 18 | 低层控制 |

### 其他状态枚举

| 类型 | 枚举值 | 整数值 | 含义 |
| --- | --- | ---: | --- |
| `FillLightStatus` | `FILL_LIGHT_STATUS_UNKNOWN` | 0 | 未知 |
| `FillLightStatus` | `FILL_LIGHT_STATUS_ON` | 1 | 补光灯开启 |
| `FillLightStatus` | `FILL_LIGHT_STATUS_OFF` | 2 | 补光灯关闭 |
| `SpeedLevel` | `SPEED_LEVEL_UNKNOWN` | 0 | 未知档位 |
| `SpeedLevel` | `SPEED_LEVEL_SLOW` | 1 | 低速 |
| `SpeedLevel` | `SPEED_LEVEL_MEDIUM` | 2 | 中速 |
| `SpeedLevel` | `SPEED_LEVEL_HIGH` | 3 | 高速 |
| `EmergencyStatus` | `EMERGENCY_STATUS_UNKNOWN` | 0 | 未知 |
| `EmergencyStatus` | `EMERGENCY_STATUS_RECOVER` | 1 | 急停解除 |
| `EmergencyStatus` | `EMERGENCY_STATUS_STOP` | 2 | 急停触发 |
| `HeadDirection` | `HEAD_DIRECTION_UNKNOWN` | 0 | 未知方向 |
| `HeadDirection` | `HEAD_DIRECTION_HEAD` | 1 | 头部为前方 |
| `HeadDirection` | `HEAD_DIRECTION_TAIL` | 2 | 尾部为前方 |
| `CtrlSource` | `CTRL_SOURCE_UNKNOWN` | 0 | 未知控制来源 |
| `CtrlSource` | `CTRL_SOURCE_APP` | 1 | App 控制 |
| `CtrlSource` | `CTRL_SOURCE_SDK` | 2 | SDK 控制 |
| `CtrlSource` | `CTRL_SOURCE_OTHER` | 3 | 其他来源控制 |

## 任务状态

```cpp
struct TaskStateInfo {
    TaskType task_type;
    TaskStatus task_status;
    std::string phase;
    uint32_t error_code;
};
```

| 字段 | 含义 |
| --- | --- |
| `task_type` | 任务类型 |
| `task_status` | 任务状态 |
| `phase` | 可选的任务子阶段，可能为空 |
| `error_code` | `0` 表示成功，非 `0` 表示失败 |

回充阶段依次包括 `recharge_preparing`（准备）、`recharge_docking`（对准与入桩）、`recharge_charging`（充电）和 `recharge_completed`（充满后留桩）。离桩阶段包括 `undock_preparing`（准备）、`undock_undocking`（离桩中）和 `undock_completed`（离桩完成）。应用可用 `phase` 展示进度，并以 `task_status` 判断任务结果。

| 类型 | 枚举值 | 整数值 |
| --- | --- | ---: |
| `TaskType` | `UNKNOWN` | 0 |
| `TaskType` | `SCAN_QR` | 1 |
| `TaskType` | `MAPPING` | 2 |
| `TaskType` | `NAV` | 3 |
| `TaskType` | `RECHARGING` | 4 |
| `TaskType` | `UNDOCK` | 5 |
| `TaskType` | `UWB_FOLLOW` | 6 |
| `TaskType` | `VISUAL_TRACK` | 7 |
| `TaskStatus` | `UNKNOWN` | 0 |
| `TaskStatus` | `STARTING` | 1 |
| `TaskStatus` | `RUNNING` | 2 |
| `TaskStatus` | `SUCCESS` | 3 |
| `TaskStatus` | `FAILURE` | 4 |
| `TaskStatus` | `STOPPED` | 5 |

任务状态变化时通过 `OnTaskStateData()` 上报。充电与离桩任务的状态判断流程见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#充电与离桩任务)。

### 回充与离桩业务错误码

收到 `task_status == TaskStatus::FAILURE` 时，按 `task_type` 查找 `TaskStateInfo::error_code`。回充（`RECHARGING`）的码值范围为 `0x11000`～`0x11FFF`，离桩（`UNDOCK`）为 `0x16000`～`0x16FFF`。排查时保留原始码值，并记录失败阶段 `phase`（如有）。接口调用返回的 `std::error_code` 见 [SDK 接口参考](./06-sdk-api-reference.md#通用参数和返回值)。

| 回充错误码 | 枚举 | 含义 |
| --- | --- | --- |
| `0x11000` | `ARC_UNKNOWN` | 未知回充异常 |
| `0x11001` | `ARC_CALIBRATION_FILE_INVALID` | 相机标定文件无效 |
| `0x11002` | `ARC_LOCALIZATION_CHECK_FAILED` | 感知模块未通过检查 |
| `0x11003` | `ARC_NAV_ALIGNMENT_CHECK_FAILED` | 对准模块未通过检查 |
| `0x11004` | `ARC_DOCK_START_TASK_FAILED` | 保留码，当前流程不上报 |
| `0x11005` | `ARC_STAND_UP_FAILED` | 机器人未能站起 |
| `0x11006` | `ARC_LOCALIZATION_START_FAILED` | 无法启动感知模块 |
| `0x11007` | `ARC_NAV_ALIGNMENT_START_FAILED` | 无法启动对准任务 |
| `0x11008` | `ARC_NAV_ALIGNMENT_FAILED` | 入桩过程中对准失败 |
| `0x11009` | `ARC_DOCK_CONTACT_FAILED` | 未能确认与充电桩接触 |
| `0x1100A` | `ARC_DOCK_CHARGING_START_FAILED` | 充电桩未能开始充电 |
| `0x1100B` | `ARC_CHARGING_STATE_LOST` | 未能继续接收充电状态 |
| `0x1100C` | `ARC_CHARGING_DOCK_FAULT` | 充电期间桩端报故障 |
| `0x1100D` | `ARC_CHARGING_STATE_INVALID` | 收到异常的充电状态 |
| `0x1100E` | `ARC_CHARGING_BATTERY_STATE_LOST` | 未能继续接收电池状态 |
| `0x1100F` | `ARC_DOCK_COMMAND_ACK_FAILED` | 充电桩命令应答失败 |
| `0x11010` | `ARC_LOCALIZATION_RUNTIME_IMAGE_INVALID` | 感知期间收到无效图像 |
| `0x11011` | `ARC_LOCALIZATION_RUNTIME_TARGET_TAG_TIMEOUT` | 等待目标 AprilTag 超时 |
| `0x11012` | `ARC_LOCALIZATION_RUNTIME_TAG_POSE_FAILED` | 无法计算 AprilTag 位姿 |
| `0x11013` | `ARC_LOCALIZATION_RUNTIME_DOCK_POSE_FAILED` | 无法计算充电桩位姿 |
| `0x11014` | `ARC_LOCALIZATION_RUNTIME_UNKNOWN` | 感知期间发生未知错误 |
| `0x11015` | `ARC_LOCALIZATION_RUNTIME_DUPLICATE_TARGET_TAG` | 检测到重复的目标 AprilTag |
| `0x11016` | `ARC_NAV_ALIGNMENT_STOP_FAILED` | 重试接触时未能停止对准 |

| 离桩错误码 | 枚举 | 含义 |
| --- | --- | --- |
| `0x16000` | `UNDOCK_UNKNOWN` | 未知离桩异常 |
| `0x16001` | `UNDOCK_STAND_UP_FAILED` | 离桩前未能站起 |
| `0x16002` | `UNDOCK_STOP_CHARGING_FAILED` | 无法停止充电 |
| `0x16003` | `UNDOCK_LOCALIZATION_START_FAILED` | 无法启动离桩感知 |
| `0x16004` | `UNDOCK_NAV_ALIGNMENT_START_FAILED` | 无法启动离桩对准任务 |
| `0x16005` | `UNDOCK_NAV_ALIGNMENT_FAILED` | 离桩过程中对准失败 |
| `0x16006` | `UNDOCK_CALIBRATION_FILE_INVALID` | 相机标定文件无效 |
| `0x16007` | `UNDOCK_FILL_LIGHT_FAILED` | 无法操作补光灯 |
| `0x16008` | `UNDOCK_LOCALIZATION_QR_NOT_DETECT` | 未检测到二维码 |
| `0x16009` | `UNDOCK_LOCALIZATION_CHECK_FAILED` | 感知模块未通过通信检查 |
| `0x1600A` | `UNDOCK_NAV_ALIGNMENT_CHECK_FAILED` | 对准模块未通过通信检查 |
| `0x1600B` | `UNDOCK_LOCALIZATION_RUNTIME_IMAGE_INVALID` | 离桩感知期间收到无效图像 |
| `0x1600C` | `UNDOCK_LOCALIZATION_RUNTIME_TAG_POSE_FAILED` | 无法计算 AprilTag 位姿 |
| `0x1600D` | `UNDOCK_LOCALIZATION_RUNTIME_DOCK_POSE_FAILED` | 无法计算充电桩位姿 |
| `0x1600E` | `UNDOCK_LOCALIZATION_RUNTIME_UNKNOWN` | 离桩感知期间发生未知错误 |
| `0x1600F` | `UNDOCK_LOCALIZATION_RUNTIME_DUPLICATE_TARGET_TAG` | 检测到重复的目标 AprilTag |
| `0x16010` | `UNDOCK_DETECT_OBSTACLE_FAILED` | 检测到障碍物，离桩失败 |

见 [GitHub 业务错误码表](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/zh/sdk_recharge_errorcode_zh.md)。

## 充电桩数据

| 类型 | 字段 | 用途 |
| --- | --- | --- |
| `DockScanDevice` | `name`、`address`、`rssi`、`connectable`、`service_uuids` | 扫描到的设备名称、BLE 地址、信号强度、可连接标记和服务列表 |
| `DockScanResult` | `code`、`accepted`、`scan_active`、`devices`、`updated_at_ms` | 扫描状态和设备列表，由 `OnDockScanResult()` 上报 |
| `DockConnectConfig` | `address` | 目标充电桩的 BLE MAC 地址 |
| `DockConnectionAck` | `code`、`accepted`、`error_code`、`error_message` | 连接或断开请求的受理结果，由 `OnDockConnectionAck()` 返回 |
| `DockConnectionResult` | `code`、`success`、`error_code` | 连接或断开的最终结果，由 `OnDockConnectionResult()` 上报 |
| `DockInfo` | `code`、`ble_address`、`name`、`dock_sn`、`dock_version`、`error_code`、`error_message` | 查询结果、充电桩标识和错误信息 |
| `DockInfo` | `dock_connected`、`has_contact`、`charging_active` | BLE 连接、机械接触和正在充电的状态 |
| `DockInfo` | `light_switch_status`、`fill_light_brightness`、`auto_fill_light_enabled` | 补光灯开关、亮度和自动补光状态 |

`OnDockInfo()` 可在主动查询后返回，也可能在充电桩状态变化时触发。字段类型见[官方头文件](https://github.com/zsibot/genisom_robot_sdk/blob/main/include/robot_sdk/sdk_type.hpp)，调用顺序见[充电桩配对流程](./05-sdk-control-flow-and-task-handling.md#充电桩配对)。

## 外设与 LED 枚举

| 类型 | 枚举值 | 整数值 | 含义 |
| --- | --- | ---: | --- |
| `PeripheralPower` | `UNKNOWN` | 0 | 未知电源通道 |
| `PeripheralPower` | `M1_48V` | 1 | 48 V 电源通道 |
| `PeripheralPower` | `M1_24V` | 2 | 24 V 电源通道 |
| `PeripheralPower` | `M1_12V` | 3 | 12 V 电源通道 |
| `LedId` | `UNKNOWN` | 0 | 未知灯分组 |
| `LedId` | `ALL` | 1 | 全部状态 LED |
| `LedId` | `FRONT` | 2 | 前部状态 LED |
| `LedId` | `BACK` | 3 | 后部状态 LED |
| `LedEffect` | `UNKNOWN` | 0 | 未知灯效 |
| `LedEffect` | `OFF` | 1 | 关闭 |
| `LedEffect` | `ON` | 2 | 常亮 |
| `LedEffect` | `BREATH` | 3 | 呼吸 |
| `LedEffect` | `BLINK` | 4 | 闪烁 |
| `LedEffect` | `BLINK_TRANSIENT` | 5 | 瞬态闪烁 |

`LedColor` 的 `r/g/b/a` 通道范围均为 0 至 255。`LedCommand` 和 `LedCommandAck` 包含 `id`、`effect`、`color`、`duration_ms`；其中 `duration_ms` 的单位为 ms，表示灯效周期或闪烁间隔。

## 命令与应答结构

| 类型 | 主要字段 | 说明 |
| --- | --- | --- |
| `CameraBitrateCmd` / `CameraBitrateAck` | `camera_name`、`camera_bps` | 相机名称和码率，码率单位 bit/s |
| `PowerCtrlCfg` / `PowerCtrlAck` | `power`、`enable` | 电源通道和开关状态 |
| `PosControlCmd` | `x/y/z`、`roll/pitch/yaw` | 位置单位 m，姿态角单位 rad |
| `LedAutoModeAck` | `auto_mode` | `true` 为自动模式，`false` 为手动模式 |

## 控制权应答结构

```cpp
struct ControlLostInfo {};
struct ControlAvailableInfo {};

struct TakeControlAck {
    uint32_t error_code;
    std::string reason;
};

struct ReleaseControlAck {
    uint32_t error_code;
    std::string reason;
};
```

`TakeControlAck::error_code == 0` 表示控制权申请成功。完整的控制权切换流程见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md#控制权机制)。

## 注册回调示例

```cpp
SDKClient client;

auto data_cb = std::make_shared<MyDataCallback>();
auto control_cb = std::make_shared<MyControlCallback>();

client.SetDataCallback(data_cb);
client.SetControlCallback(control_cb);
```
