# 传感器实时上报接口

[返回软件服务接口](./06-sdk-service-interfaces.md) | [控制指令接口](./06-01-control-commands.md)

## 接口说明

传感器实时上报接口用于接收机器人本体状态，对应红框中的“传感器实时上报端口”。机器人通过 UDP 接收端口 `8080` 向 SDK 上报状态，SDK 在接收线程中解析并缓存最近一次数据，应用程序通过查询函数读取缓存。

读取状态前应先检查 `IsConnected()`。状态读取函数通常不会主动触发新的网络请求，数据是否最新取决于机器人上报周期和应用读取时间。

## 通信参数

| 参数 | 默认值 |
| --- | --- |
| 机器人 IP | `192.168.234.1` |
| SDK 接收端口 | `8080` |
| 传输协议 | UDP |
| 消息格式 | JSON |

## 上报消息类型

| 消息类型 | 对应内容 | 常用 SDK 函数 |
| --- | --- | --- |
| `dog_state` | 电量、温度、设备名、WiFi SSID、序列号、型号等基础信息 | `GetPower()`、`GetTemperature()`、`GetSn()`、`GetDevName()`、`GetWifiSsid()`、`GetModel()` |
| `version` | 运控版本和任务版本 | `GetVersion()` |
| `speed_set` | 当前速度等级 | `GetSpeedLevel()` |
| `feedback` | 功能模式、控制模式、运动模式、运动类型和电机温度 | `GetFunctionMode()`、`GetControlMode()`、`GetMotionMode()`、`GetMotionType()`、`GetMotorTemp()` |
| `imu_info` | 四元数、RPY、机体加速度和机体角速度 | `GetQuaternion()`、`GetRPY()`、`GetBodyAcc()`、`GetBodyGyro()` |
| `odom_info` | 位置、世界速度和机体速度 | `GetPosition()`、`GetWorldVelocity()`、`GetBodyVelocity()` |
| `leg_joint_info` | 4 条腿的角度、角速度和力矩 | `GetLeg*Joint()`、`GetLeg*JointVel()`、`GetLeg*JointTorque()` |
| `dev_info` | 电池电压、电流、温度、电量和错误码 | `GetBatteryInfo()` |

## 获取基础信息

| 函数 | 函数原型 | 返回内容 |
| --- | --- | --- |
| `GetPower` | `uint32_t GetPower() const` | 电量百分比 |
| `GetTemperature` | `float32_t GetTemperature() const` | 设备温度，单位 °C |
| `GetSn` | `std::string GetSn() const` | 设备序列号 |
| `GetDevName` | `std::string GetDevName() const` | 设备名称 |
| `GetWifiSsid` | `std::string GetWifiSsid() const` | 当前 WiFi SSID |
| `GetVersion` | `VersionInfo GetVersion() const` | 运控版本和任务版本 |
| `GetModel` | `Model GetModel() const` | 当前机型枚举 |

### 相关数据类型

#### VersionInfo

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `mc_version` | `string` | 运控版本 |
| `dog_task_version` | `string` | 任务版本 |

#### Model

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `MODEL_XG` | `0` | 小狗点足 |
| `MODEL_XGW` | `1` | 小狗轮足 |
| `MODEL_XGWHSPD` | `2` | 小狗高速轮足 |

## 获取速度和模式

| 函数 | 函数原型 | 返回内容 |
| --- | --- | --- |
| `GetSpeed` | `SpeedInfo GetSpeed() const` | 前后速度、角速度、左右速度、头部角度 |
| `GetSpeedLevel` | `SpeedLevel GetSpeedLevel() const` | 慢速、正常或快速 |
| `GetFunctionMode` | `FunctionMode GetFunctionMode() const` | 遥控、追踪、SDK 或通用 SDK 模式 |
| `GetControlMode` | `ControlMode GetControlMode() const` | 站立、趴下、锁定、移动、平衡站立等状态 |
| `GetMotionMode` | `MotionMode GetMotionMode() const` | 特技动作是否执行、休息或禁止 |
| `GetMotionType` | `MotionType GetMotionType() const` | 当前特技动作类型 |

### 相关数据类型

#### SpeedInfo

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `speed` | `float32_t` | 前后速度 |
| `angle_speed` | `float32_t` | 角速度 |
| `shift_speed` | `float32_t` | 左右速度 |
| `angle` | `float32_t` | 头部角度 |

#### SpeedLevel

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `SL_NULL` | `0` | 无效值 |
| `SL_SLOW` | `1` | 慢速 |
| `SL_NORMAL` | `2` | 正常速度 |
| `SL_FAST` | `3` | 快速 |

#### FunctionMode

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `FM_NULL` | `0` | 无效值 |
| `FM_REMOTE` | `1` | 遥控模式 |
| `FM_TRACE` | `2` | 追踪模式 |
| `FM_SDK` | `3` | SDK 模式 |
| `FM_GENERAL_SDK` | `4` | 通用 SDK 模式 |

#### ControlMode

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `CM_NULL` | `0` | 无效值 |
| `CM_STAND_UP` | `1` | 站立 |
| `CM_SIT_DOWN` | `2` | 趴下 |
| `CM_LOCK_MODE` | `3` | 锁定模式 |
| `CM_EMERGENCY_STOP` | `4` | 紧急停止 |
| `CM_MOVE_MODE` | `5` | 移动模式 |
| `CM_BALANCE_STAND_MODE` | `6` | 平衡站立模式 |
| `CM_INIT` | `7` | 初始化 |

#### MotionMode

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `MM_NULL` | `0` | 无效值 |
| `MM_RUNNING` | `1` | 执行中（在进行特技动作） |
| `MM_REST` | `2` | 休息（未进行特技动作） |
| `MM_FORBID` | `3` | 禁止（不在实验室模式） |

#### MotionType

| 枚举值 | 值 | 说明 |
| --- | --- | --- |
| `MT_NULL` | `0` | 无效值 |
| `MT_JUMP` | `1` | 跳跃 |
| `MT_FORWARD_JUMP` | `2` | 前跳 |
| `MT_BACK_FLIP` | `3` | 后空翻 |
| `MT_GREET` | `4` | 招手 |
| `MT_TWO_LEG_STAND` | `5` | 双腿站立 |
| `MT_FORBID` | `6` | 禁止（未开启狂暴模式） |
| `MT_UNKNOWN` | `7` | 未知（未进行特技动作） |
| `MT_UNLOADING_SQUAT` | `8` | 卸货下蹲 |

## 获取 IMU 和姿态数据

| 函数 | 返回类型及内容 |
| --- | --- |
| `GetQuaternion()` | `std::array<float32_t, 4>`，四元数 `[w, x, y, z]` |
| `GetRPY()` | `std::array<float32_t, 3>`，滚转、俯仰、偏航，单位为弧度 |
| `GetBodyAcc()` | `std::array<float32_t, 3>`，机体坐标系加速度，单位 m/s² |
| `GetBodyGyro()` | `std::array<float32_t, 3>`，机体坐标系角速度，单位 rad/s |

## 获取里程计数据

| 函数 | 返回类型及内容 |
| --- | --- |
| `GetPosition()` | `std::array<float32_t, 3>`，世界坐标系位置，单位 m |
| `GetWorldVelocity()` | `std::array<float32_t, 3>`，世界坐标系速度，单位 m/s |
| `GetBodyVelocity()` | `std::array<float32_t, 3>`，机体坐标系速度，单位 m/s |

## 获取电机和关节数据

| 数据 | 函数 |
| --- | --- |
| 电机温度 | `GetMotorTemp()`，返回 16 个电机温度 |
| 髋外展关节角度 / 角速度 / 力矩 | `GetLegAbadJoint()` / `GetLegAbadJointVel()` / `GetLegAbadJointTorque()` |
| 髋关节角度 / 角速度 / 力矩 | `GetLegHipJoint()` / `GetLegHipJointVel()` / `GetLegHipJointTorque()` |
| 膝关节角度 / 角速度 / 力矩 | `GetLegKneeJoint()` / `GetLegKneeJointVel()` / `GetLegKneeJointTorque()` |
| 足端关节角度 / 角速度 / 力矩 | `GetLegFootJoint()` / `GetLegFootJointVel()` / `GetLegFootJointTorque()` |

每个关节函数返回 `std::array<float32_t, 4>`，数组顺序为：

```text
[左前腿, 右前腿, 左后腿, 右后腿]
```

每条腿的关节名称为 `abad`、`hip`、`knee`、`foot`。角度单位为 rad，角速度单位为 rad/s，力矩单位为 N·m。

## 获取电池信息

| 字段 | 内容 |
| --- | --- |
| 函数名 | `GetBatteryInfo` |
| 函数原型 | `BatteryInfo GetBatteryInfo() const` |
| 功能概述 | 读取电池详细状态 |
| 参数 | 无 |
| 返回值 | `current`：电流；`error`：电池错误码；`power`：电量百分比；`temp`：温度；`volt`：电压 |
| 备注 | 单位和具体安全阈值以 `BatteryInfo` 定义及实际硬件规格为准 |

### BatteryInfo 结构体

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `current` | `float32_t` | 电流 (A) |
| `error` | `int32_t` | 错误码 |
| `power` | `int32_t` | 电量百分比 |
| `temp` | `float32_t` | 温度 (°C) |
| `volt` | `float32_t` | 电压 (V) |

## 使用注意事项

- 状态数据是最近一次上报的缓存，不保证每次调用都触发新的网络接收。
- 使用姿态、速度和关节数据参与控制时，应检查连接状态、数据时间和数据是否处于合理范围。
- 机型不同，传感器、轮毂电机和上装状态可能不同，应用应先读取 `GetModel()` 再启用对应功能。
- 电机温度、电池状态和故障信息应在运动前和运行过程中持续检查。
