# WiFi 热点配置接口

[返回软件服务接口](./06-sdk-service-interfaces.md) | [控制指令接口](./06-01-control-commands.md)

## 接口说明

WiFi 热点配置接口对应红框中的“WiFi 热点配置端口”，用于请求修改机器人 WiFi 热点名称和密码，并读取异步返回的配置结果。

当前 SDK 使用 UDP 发送端口 `8081` 发送配置请求，通过接收端口 `8080` 接收配置结果。修改 WiFi 后，机器人网络可能立即变化，应用程序需要重新连接新的热点。

## 通信参数

| 参数 | 默认值 |
| --- | --- |
| 机器人 IP | `192.168.234.1` |
| SDK 发送端口 | `8081` |
| SDK 接收端口 | `8080` |
| 传输协议 | UDP |
| 消息格式 | JSON |

## 设置 WiFi 信息

| 字段 | 内容 |
| --- | --- |
| 函数名 | `SetWifi` |
| 函数原型 | `void SetWifi(const WifiInfo &wifi_info)` |
| 功能概述 | 请求修改机器人 WiFi 热点名称和密码 |
| 参数 | `wifi_info.ssid`：新的 SSID；`wifi_info.password`：新的密码 |
| 返回值 | 无。修改结果通过机器人返回消息异步通知 |
| 备注 | 修改 WiFi 后，当前连接可能断开，需要重新连接新的热点 |

### WifiInfo 结构体

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `ssid` | `string` | WiFi 名称 |
| `password` | `string` | WiFi 密码 |

## 读取 WiFi 配置结果

| 函数 | 函数原型 | 说明 |
| --- | --- | --- |
| `GetWifiResutlf` | `std::optional<bool> GetWifiResutlf() const` | 返回 WiFi 配置结果；`true` 成功，`false` 失败，`std::nullopt` 表示尚未收到结果 |
| `IsRecvWifiResult` | `bool IsRecvWifiResult() const` | 判断是否已经收到 WiFi 配置结果 |
| `GetWifiSsid` | `std::string GetWifiSsid() const` | 读取当前状态中的 WiFi SSID |

> `GetWifiResutlf` 是当前公共头文件中的既有拼写。应用代码应按头文件中的函数名调用，不要自行改成 `GetWifiResult`。

## 调用示例

```cpp
WifiInfo wifi;
wifi.ssid = "new_robot_wifi";
wifi.password = "new_password";
robot.SetWifi(wifi);

// 配置结果是异步返回的，不能在 SetWifi() 后立即假定成功
if (robot.IsRecvWifiResult()) {
    auto result = robot.GetWifiResutlf();
    if (result.has_value() && result.value()) {
        // 配置成功，重新连接新的 WiFi
    }
}
```

## 推荐操作流程

1. 创建 SDK 执行器并确认 `IsConnected()` 为 `true`。
2. 读取当前 WiFi 状态，确认当前连接对象正确。
3. 设置新的 SSID 和密码并调用 `SetWifi()`。
4. 等待 `IsRecvWifiResult()` 返回 `true`。
5. 使用 `GetWifiResutlf()` 判断配置是否成功。
6. 配置成功后，重新连接新的机器人热点。
7. 重新确认 IP 可达、SDK 连接状态和机器人故障状态。

## 注意事项

- 不要在 `SetWifi()` 调用后立即假定新配置已经生效。
- 修改 WiFi 会导致当前 UDP 通信中断，程序应允许一段时间进行重连。
- SSID 和密码应使用设备支持的字符和长度，具体限制以当前固件为准。
- 不要把 WiFi 配置密码写入公开代码、日志或提交记录。
- WiFi 配置接口和运动控制接口共用 SDK 通信对象，应用程序不应另外绑定 `8080` 或 `8081`。
