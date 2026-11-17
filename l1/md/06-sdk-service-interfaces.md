# SDK 软件服务接口

[返回首页](../index.md) | [硬件、软件与结构架构](./03-system-architecture.md) | [SDK 开发与运行指南](./08-sdk-development-guide.md)

## 接口说明

Zsibot SDK 通过 UDP 与机器人通信，提供控制指令、传感器状态、连接检测、WiFi 配置和故障信息查询等软件服务。

SDK 源码、版本说明和示例程序见 GitHub：[zsibot/genisom_l1_sdk](https://github.com/zsibot/genisom_l1_sdk)。

按照接口功能，本部分拆分为五个独立文档。五个文档对应红框中的“控制指令端口、传感器实时上报端口、心跳检测端口、WiFi 热点配置端口和故障信息查询端口”。

需要注意：当前 SDK 的五类服务不是五个互相独立的网络端口，而是共用同一组 UDP 通信通道。应用程序统一通过 `ZsibotExecutor` 使用这些接口，不需要自行创建多个 socket，也不应重复绑定 SDK 正在使用的端口。

## 五个接口文档

| 接口文档 | 主要内容 | 主要 SDK 入口 |
| --- | --- | --- |
| [控制指令接口](./06-01-control-commands.md) | 发送离散动作命令和连续运动输入，申请 SDK 控制权 | `SetCmd()`、`SetRemote()`、`ZsibotExecutor` |
| [传感器实时上报接口](./06-02-real-time-sensor-data.md) | 读取电量、姿态、速度、里程计、电机和关节状态 | `GetPower()`、`GetQuaternion()`、`GetLeg*Joint()` |
| [心跳检测接口](./06-03-heartbeat.md) | 维护通信心跳并判断 SDK 与机器人是否连接 | `IsConnected()` |
| [WiFi 热点配置接口](./06-04-wifi-hotspot-configuration.md) | 修改机器人 WiFi 名称和密码，读取异步配置结果 | `SetWifi()`、`GetWifiResutlf()`、`IsRecvWifiResult()` |
| [故障信息查询接口](./06-05-fault-information.md) | 读取机器人最近一次上报的故障列表 | `GetFaultInfo()` |

## 默认网络配置

| 参数 | 默认值 |
| --- | --- |
| 机器人 IP | `192.168.234.1` |
| SDK 发送端口 | `8081` |
| SDK 接收端口 | `8080` |
| 传输协议 | UDP |
| 消息格式 | JSON |
| 心跳周期 | 50 ms |
| 连接超时判断 | SDK 内部心跳计时超过 5 s，或尚未收到机器人数据时视为未连接 |

如果需要修改 IP 或端口，应在构造 `ZsibotExecutor` 时传入参数。应用层一般不需要自己创建 UDP socket，也不需要重复发送心跳。

## 推荐调用顺序

1. 创建 `ZsibotExecutor`。
2. 等待 [心跳检测接口](./06-03-heartbeat.md)中的 `IsConnected()` 返回 `true`。
3. 调用 [控制指令接口](./06-01-control-commands.md)中的 `CMD_SDK_CONTROL_RIGHT` 请求控制权。
4. 读取 [传感器实时上报接口](./06-02-real-time-sensor-data.md)中的功能模式，确认 `GetFunctionMode() == FunctionMode::FM_SDK`；控制模式只用于判断站立、趴下、移动等状态。
5. 读取 [故障信息查询接口](./06-05-fault-information.md)确认当前没有需要处理的故障。
6. 根据需要发送 `SetCmd()` 或 `SetRemote()`。
7. 运行期间持续读取传感器、连接状态和故障信息。
8. 断网、心跳超时、故障等级升高或程序异常时，停止发送运动指令并进入安全状态。

## 最小流程示例

```cpp
#include "zsibot_sdk/zsibot_api.h"
#include <chrono>
#include <thread>

using namespace zsibot;

int main()
{
    ZsibotExecutor robot(Role::ROLE_SDK);

    const auto connect_deadline = std::chrono::steady_clock::now()
                                + std::chrono::seconds(5);
    while (!robot.IsConnected()
           && std::chrono::steady_clock::now() < connect_deadline) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    if (!robot.IsConnected()) {
        return 1;
    }

    robot.SetCmd(CmdCode::CMD_SDK_CONTROL_RIGHT);

    const auto control_deadline = std::chrono::steady_clock::now()
                                + std::chrono::seconds(5);
    while (robot.GetFunctionMode() != FunctionMode::FM_SDK
           && std::chrono::steady_clock::now() < control_deadline) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    if (robot.GetFunctionMode() != FunctionMode::FM_SDK) {
        return 2;
    }

    robot.SetCmd(CmdCode::CMD_REMOTE_CONTROL_RIGHT);
    const auto remote_deadline = std::chrono::steady_clock::now()
                               + std::chrono::seconds(5);
    while (robot.GetFunctionMode() != FunctionMode::FM_REMOTE
           && std::chrono::steady_clock::now() < remote_deadline) {
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }

    return robot.GetFunctionMode() == FunctionMode::FM_REMOTE ? 0 : 3;
}
```

## 使用注意事项

- 五个文档按服务功能拆分，不代表当前 SDK 存在五个独立 UDP socket。
- 发送端口 `8081` 和接收端口 `8080` 由 SDK 执行器统一管理。
- `IsConnected()` 只能说明通信链路有效，不能代替控制权确认。现场测试时应保留遥控器接管方式。
- 状态读取函数获取的是最近一次缓存数据，使用前应检查连接状态和数据是否合理。
- WiFi 配置会导致网络连接变化，程序应做好重连处理。
- 故障信息应在启动、运动前和运行过程中持续检查。
