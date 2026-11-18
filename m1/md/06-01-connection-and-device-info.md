# 连接与设备信息

[接口概览](./06-sdk-api-reference.md) | [通用参数和返回值](./06-sdk-api-reference.md#通用参数和返回值)

## 构造与连接

### SDKClient

```cpp
SDKClient(
    ErrorHandler error_callback = [](const std::error_code&) {},
    ConnectionConfig connection_config = ConnectionConfig(),
    TransportProtocol type = TransportProtocol::Udp);
```

创建 SDK 客户端。`type` 支持 `TransportProtocol::Udp` 和 `TransportProtocol::WebSocket`，默认使用 UDP。

`ConnectionConfig` 的连接与重连参数：

| 字段 | 说明 |
| --- | --- |
| `connect_timeout_ms` | 连接和握手超时时间，默认 5000 ms，最小 500 ms |
| `auto_reconnect` | 是否开启自动重连，默认 `false` |
| `reconnect_interval_ms` | 自动重连间隔，默认 1000 ms，最小 500 ms |

### Connect

```cpp
std::error_code Connect(
    std::string ip, std::string port, bool block = false,
    ConnectHandler handler = [](const std::error_code&) {});
```

建立传输连接并完成协议握手。只有握手成功后才算连接成功。

从 SDK v0.2.3 起，首次连接因传输、握手、协议不匹配或控制被拒绝而失败后，可在同一个 `SDKClient` 实例上再次调用 `Connect()`。异步连接应等待本次失败结果再由应用线程发起重试。

| 参数 | 说明 |
| --- | --- |
| `ip` | 机器人地址，例如 `192.168.234.1` 或 `192.168.168.168` |
| `port` | UDP 通常使用 `8082`，WebSocket 使用 `8081` |
| `block` | `false`：异步连接；`true`：阻塞等待连接完成 |
| `handler` | 异步连接结果回调 |

```cpp
SDKClient client;
auto ec = client.Connect("192.168.234.1", "8082", true);
if (ec) {
    std::cerr << "connect failed: " << ec.message() << std::endl;
}
```

### Disconnect

```cpp
std::error_code Disconnect(
    bool block = false,
    DisConnectHandler handler = [](const std::error_code&) {});
```

主动断开连接。UDP 模式下 SDK 会先发送断开通知，再释放连接资源。

### IsConnected

```cpp
bool IsConnected() const;
```

返回 `true` 表示已经完成握手并处于 `ConnectionState::CONNECTED` 状态。

### GetConnectionState

```cpp
ConnectionState GetConnectionState() const;
```

返回当前连接状态：

| 枚举值 | 整数值 | 含义 |
| --- | ---: | --- |
| `DISCONNECTING` | 0 | 断开中 |
| `DISCONNECTED` | 1 | 已断开 |
| `CONNECTING` | 2 | 连接中 |
| `HANDSHAKING` | 3 | 握手中 |
| `CONNECTED` | 4 | 已连接 |
| `RECONNECTING` | 5 | 自动重连中 |

## 版本和设备信息

| 函数 | 原型 | 说明 |
| --- | --- | --- |
| `Version` | `const std::string& Version() const` | SDK 版本 |
| `ProtocolVersion` | `const std::string& ProtocolVersion() const` | 通信协议版本 |
| `SystemVersion` | `const std::string& SystemVersion() const` | 握手得到的机器人系统版本 |
| `GetDeviceInfo` | `DeviceInfo GetDeviceInfo() const` | 获取握手缓存的机型和序列号 |

```cpp
struct DeviceInfo {
    DeviceType device_type = DeviceType::UNKNOWN;
    std::string sn;
};
```

示例：

```cpp
auto ec = client.Connect("192.168.234.1", "8082", true);
if (!ec) {
    const auto info = client.GetDeviceInfo();
    std::cout << DeviceTypeName(info.device_type)
              << " / " << info.sn << std::endl;
}
```

连接成功前或断开后，`device_type` 可能为 `DeviceType::UNKNOWN`，`sn` 可能为空。

## M1 机型判断

SDK 会在握手时返回 `DeviceType`。启动后应先调用 `GetDeviceInfo()`，再根据返回型号启用功能。M1 相关枚举值见 [M1 回调、数据类型与状态参考](./07-callbacks-data-types-and-status-reference.md#deviceinfo-和-devicetype)。

调用当前型号不支持的操作时，SDK 返回 `Errc::UnsupportedDeviceOperation`，不会发送协议命令。

回充、离桩、外设电源和状态 LED 取决于设备硬件与系统配置。完整的接口支持范围见[官方机型能力矩阵](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/en/sdk_api_capability_en.md)。

完整的接口组合方式见 [M1 示例程序与故障排查](./08-examples-and-troubleshooting.md)。
