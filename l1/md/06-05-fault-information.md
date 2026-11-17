# 故障信息查询接口

[返回软件服务接口](./06-sdk-service-interfaces.md) | [传感器实时上报接口](./06-02-real-time-sensor-data.md)

## 接口说明

故障信息查询接口对应红框中的“故障信息查询端口”，用于读取机器人状态消息中携带的故障列表。当前 SDK 没有单独的故障查询 socket，故障信息随机器人状态通过 UDP 接收端口 `8080` 上报，应用程序调用查询函数读取最近一次缓存结果。

## 通信参数

| 参数 | 默认值 |
| --- | --- |
| 机器人 IP | `192.168.234.1` |
| SDK 接收端口 | `8080` |
| 传输协议 | UDP |
| 消息格式 | JSON |
| 状态消息类型 | `fault_info` |

## 获取故障信息

| 字段 | 内容 |
| --- | --- |
| 函数名 | `GetFaultInfo` |
| 函数原型 | `std::vector<FaultInfo> GetFaultInfo() const` |
| 功能概述 | 读取最近一次 `fault_info` 状态消息中的故障列表 |
| 参数 | 无 |
| 返回值 | `FaultInfo` 列表；没有故障时通常为空列表 |
| 备注 | 当前公共 API 提供的是状态读取函数，没有单独的 `QueryFault()` 请求函数 |

### FaultInfo 结构体

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `module` | `std::string` | 故障所属模块 |
| `submodule` | `std::string` | 故障所属子模块 |
| `error_code` | `uint32_t` | 故障代码 |
| `level` | `std::string` | 故障等级 |
| `info` | `std::string` | 故障描述 |

## 调用示例

```cpp
auto faults = robot.GetFaultInfo();
if (faults.empty()) {
    std::cout << "当前没有故障信息\n";
} else {
    for (const auto &fault : faults) {
        std::cout << fault.module << " / "
                  << fault.submodule << " / "
                  << fault.error_code << " / "
                  << fault.level << " / "
                  << fault.info << '\n';
    }
}
```

## 推荐检查时机

应用程序至少应在以下时机读取故障信息：

1. SDK 连接建立后、首次发送运动指令前。
2. 站立、移动或执行特技动作前。
3. 运行过程中按固定周期检查。
4. 发现电机温度、电池电压、姿态或通信状态异常时。
5. 断网重连或 WiFi 配置完成后。

## 处理建议

- 故障列表为空只表示最近一次缓存中没有故障，不代表所有硬件风险都已排除。
- 收到故障后，应结合 `level`、`error_code`、电机温度、电池状态和当前运动模式判断处理方式。
- 故障等级升高、出现失控、异常声音、异味或过热时，应立即停止运动并使用现场安全手段接管。
- 不要在程序中简单忽略未知故障代码；应保留原始模块、子模块、代码、等级和描述，便于排查。
- 故障信息属于状态上报的一部分，读取前应确认 `IsConnected()` 为 `true`。
