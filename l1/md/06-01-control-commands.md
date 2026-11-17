# 控制指令接口

[返回软件服务接口](./06-sdk-service-interfaces.md) | [传感器实时上报接口](./06-02-real-time-sensor-data.md)

## 接口说明

控制指令接口用于向机器人发送离散动作命令和连续运动输入，对应红框中的“控制指令端口”。当前 SDK 使用 UDP 发送端口 `8081`，应用程序通过 `ZsibotExecutor` 调用接口，不需要自行创建 UDP socket。

运动控制前，应先确认机器人已经连接、当前控制模式正确，并申请 SDK 控制权。命令是否被机器人接受，需要通过状态接口读取反馈确认。

## 通信参数

| 参数 | 默认值 |
| --- | --- |
| 机器人 IP | `192.168.234.1` |
| SDK 发送端口 | `8081` |
| 传输协议 | UDP |
| 消息格式 | JSON |

## 创建 SDK 执行器

| 字段 | 内容 |
| --- | --- |
| 函数名 | `ZsibotExecutor` |
| 函数原型 | `ZsibotExecutor(Role role = Role::ROLE_REMOTE, const std::string &send_ip = "192.168.234.1", uint32_t send_port = 8081, uint32_t recv_port = 8080)` |
| 功能概述 | 创建 SDK 执行器，并启动发送、接收和心跳通信线程 |
| 参数 | `role`：通信角色；`send_ip`：机器人 IP；`send_port`：发送端口；`recv_port`：接收端口 |
| 返回值 | 无，构造失败时可能抛出 SDK 异常 |
| 备注 | 使用 SDK 控制指令时，建议传入 `Role::ROLE_SDK`，然后发送 `CMD_SDK_CONTROL_RIGHT` 请求控制权 |

执行器析构时会停止通信线程并释放网络资源。程序退出前，应先让机器人停止运动，发送 `CMD_REMOTE_CONTROL_RIGHT`，并根据 `GetFunctionMode()` 确认遥控控制权已经恢复。

| 字段 | 内容 |
| --- | --- |
| 函数名 | `~ZsibotExecutor` |
| 函数原型 | `~ZsibotExecutor()` |
| 功能概述 | 停止通信线程并释放网络资源 |
| 参数 | 无 |
| 返回值 | 无 |
| 备注 | 程序退出前应先停止运动并确认遥控控制权已经恢复，再销毁执行器 |

## 发送离散命令

| 字段 | 内容 |
| --- | --- |
| 函数名 | `SetCmd` |
| 函数原型 | `void SetCmd(CmdCode cmd_code)` |
| 功能概述 | 发送站立、趴下、急停、模式切换和特技动作等离散命令 |
| 参数 | `cmd_code`：`CmdCode` 枚举值 |
| 返回值 | 无。命令是否被机器人接受，需要读取反馈状态确认 |
| 备注 | `CMD_SDK_CONTROL_RIGHT` 用于申请 SDK 控制权；跳跃、前跳、后空翻等动作需要先进入实验室模式，并确认当前机型支持 |

### 常用命令

| 命令 | 作用 |
| --- | --- |
| `CMD_EMERGENCY_STOP` | 进入软件急停或阻尼状态 |
| `CMD_SIT_DOWN` | 趴下 |
| `CMD_STAND_UP` | 站立 |
| `CMD_MOVE_MODE` | 进入移动模式 |
| `CMD_BALANCE_STAND_MODE` | 进入平衡站立模式 |
| `CMD_LOCK_MODE` | 进入锁定模式 |
| `CMD_SDK_CONTROL_RIGHT` | 请求 SDK 控制权 |
| `CMD_REMOTE_CONTROL_RIGHT` | 请求遥控控制权 |
| `CMD_GENERAL_SDK_CONTROL_RIGHT` | 请求通用 SDK 控制权 |

### 控制权及适用场景

| 控制权命令 | 控制权含义 | 适用场景 |
| --- | --- | --- |
| `CMD_REMOTE_CONTROL_RIGHT` | 遥控器控制权 | 遥控操作 |
| `CMD_SDK_CONTROL_RIGHT` | 二次开发导航控制权 | 响应较小的速度指令（如 0.05 m/s）、回充等场景 |
| `CMD_GENERAL_SDK_CONTROL_RIGHT` | 通用二次开发导航控制权 | 响应较大的速度指令（如 3 m/s）、爬楼梯等场景 |

> **SDK 模式选择提示：** SDK 模式（`CMD_SDK_CONTROL_RIGHT`）与通用 SDK 模式（`CMD_GENERAL_SDK_CONTROL_RIGHT`）对应不同步态。SDK 模式对应的步态可响应小速度，适合低速建图、回充；通用 SDK 模式对应的步态可响应大速度，适合高速奔跑和上楼梯。请根据任务场景选择模式，并确认模式反馈后再进行运动测试。

发送控制权命令后，应根据 `GetFunctionMode()` 的反馈确认切换结果。通信角色 `Role` 与控制权不是同一个概念。

### CmdCode 相关定义

| 枚举值 | 十六进制 | 说明 |
| --- | --- | --- |
| `CMD_NULL` | `0x00` | 空命令 |
| `CMD_EMERGENCY_STOP` | `0x5A` | 紧急停止 |
| `CMD_STAND_UP` | `0x7A` | 站立 |
| `CMD_SIT_DOWN` | `0x6A` | 趴下 |
| `CMD_MOVE_MODE` | `0x8A` | 移动模式 |
| `CMD_BALANCE_STAND_MODE` | `0x9A` | 平衡站立模式 |
| `CMD_LOCK_MODE` | `0x9B` | 锁定模式 |
| `CMD_SLOW_SPEED` | `0xAE` | 慢速 |
| `CMD_NORMAL_SPEED` | `0xAF` | 正常速度 |
| `CMD_FAST_SPEED` | `0xB0` | 快速 |
| `CMD_JUMP` | `0x01` | 跳跃 |
| `CMD_FORWARD_JUMP` | `0x02` | 前跳 |
| `CMD_BACK_FLIP` | `0x03` | 后空翻 |
| `CMD_GREET` | `0x04` | 打招呼 |
| `CMD_TWO_LEG_STAND` | `0x05` | 双腿站立 |
| `CMD_CRAWL_FORWARD` | `0x09` | 匍匐前进 |
| `CMD_CLIMBING_HIGH_PLATFORM` | `0x0A` | 爬高台 |
| `CMD_HAND_STAND` | `0x0B` | 双腿倒立 |
| `CMD_UNLOAD_SQUAT` | `0x0C` | 卸货下蹲 |
| `CMD_ENTER_LAB_MODE` | `0xC1` | 进入实验室模式 |
| `CMD_EXIT_LAB_MODE` | `0xC2` | 退出实验室模式 |
| `CMD_REMOTE_CONTROL_RIGHT` | `0xAA` | 请求遥控控制 |
| `CMD_SDK_CONTROL_RIGHT` | `0xB3` | 请求 SDK 控制 |
| `CMD_GENERAL_SDK_CONTROL_RIGHT` | `0xB5` | 请求通用 SDK 控制 |

> 注意：跳跃、前跳、后空翻、打招呼、双腿站立、卸货下蹲需要先调用 `CMD_ENTER_LAB_MODE` 进入实验室模式。
> 轮足机型（`MODEL_XGW` / `MODEL_XGWHSPD`）不能使用跳跃、前跳、打招呼、后空翻、双腿站立功能。

## 设置连续运动输入

| 字段 | 内容 |
| --- | --- |
| 函数名 | `SetRemote` |
| 函数原型 | `void SetRemote(const std::array<float32_t, 4> &joy_stick, const std::array<float32_t, 14> &button)` |
| 功能概述 | 发送连续运动输入和按键状态 |
| 参数 | `joy_stick`：4 个摇杆值，顺序为前后、旋转、左右、头部角度；`button`：14 个按钮值 |
| 返回值 | 无 |
| 备注 | 摇杆绝对值大于 1 时会自动归一化到 `[-1, 1]`。停止运动时发送全 0 摇杆值 |

配套键盘示例持续接收 `w`、`s`、`a`、`d`、`q`、`e` 方向输入；连续 200 ms 未检测到这些按键时，示例会判断需要停止并发送全 0 摇杆值。按 `c` 也会立即发送全 0 摇杆值，但不是停止运动的唯一方式。此规则属于示例程序的键盘输入处理逻辑；自行开发程序时，仍需主动实现超时归零机制。

示例：

```cpp
#include "zsibot_sdk/zsibot_api.h"
#include <array>
#include <chrono>
#include <thread>

using namespace zsibot;

int main()
{
    ZsibotExecutor robot(Role::ROLE_SDK);

    // 仅在状态反馈确认已经进入 SDK 模式后发送运动输入。
    if (!robot.IsConnected()
        || robot.GetFunctionMode() != FunctionMode::FM_SDK) {
        return 1;
    }

    // 前进
    robot.SetRemote({0.5f, 0.0f, 0.0f, 0.0f},
                    std::array<float32_t, 14>{0.0f});

    // 停止连续运动
    robot.SetRemote({0.0f, 0.0f, 0.0f, 0.0f},
                    std::array<float32_t, 14>{0.0f});

    robot.SetCmd(CmdCode::CMD_REMOTE_CONTROL_RIGHT);
    const auto deadline = std::chrono::steady_clock::now()
                        + std::chrono::seconds(5);
    while (robot.GetFunctionMode() != FunctionMode::FM_REMOTE
           && std::chrono::steady_clock::now() < deadline) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    return robot.GetFunctionMode() == FunctionMode::FM_REMOTE ? 0 : 2;
}
```

## 推荐调用顺序

1. 创建 `ZsibotExecutor`。
2. 等待 `IsConnected()` 返回 `true`。
3. 发送 `CMD_SDK_CONTROL_RIGHT` 请求控制权。
4. 确认 `GetFunctionMode() == FunctionMode::FM_SDK`；`GetControlMode()`用于确认站立、趴下、移动等状态。
5. 根据需要发送 `SetCmd()` 或 `SetRemote()`。
6. 运行期间持续检查连接状态和故障信息。
7. 停止运动，发送 `CMD_REMOTE_CONTROL_RIGHT`，确认 `GetFunctionMode() == FunctionMode::FM_REMOTE` 后再销毁执行器。

## 安全注意事项

- `SetCmd()` 没有同步返回执行结果，不能仅根据函数调用完成判断动作已经执行。
- SDK 控制权和网络连接状态是两件事，`IsConnected()` 为 `true` 不代表已经获得运动控制权。
- 发送运动指令前，应确认机器人周围没有人员、线缆和障碍物，并保留遥控器的软件急停或阻尼切换方式。
- 断网、心跳超时、故障等级升高或程序异常时，应停止发送运动指令并进入安全状态。
