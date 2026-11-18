# 外设与相机

[接口概览](./06-sdk-api-reference.md) | [通用参数和返回值](./06-sdk-api-reference.md#通用参数和返回值)

## 灯光与感知开关

```cpp
std::error_code FrontLight(bool on, int timeout_ms = 0, WriteHandler handler = ...);
std::error_code BackLight(bool on, int timeout_ms = 0, WriteHandler handler = ...);
std::error_code AutoModeLight(bool on, int timeout_ms = 0, WriteHandler handler = ...);
std::error_code ObstacleAvoidance(bool on, int timeout_ms = 0, WriteHandler handler = ...);
```

| 函数 | 功能 |
| --- | --- |
| `FrontLight` | 开关前补光灯 |
| `BackLight` | 开关后补光灯 |
| `AutoModeLight` | 开关自动补光模式 |
| `ObstacleAvoidance` | 开关停障功能 |

四个函数的 `on` 参数为 `true` 开启、`false` 关闭。当前状态通过 `RobotState` 的 `front_fill_light`、`back_fill_light`、`auto_mode_light` 和 `obstacle_avoidance` 获取。

## 相机码率

### UpdateCameraBitrate

```cpp
std::error_code UpdateCameraBitrate(
    CameraBitrateCmd cmd, int timeout_ms = 0,
    WriteHandler handler = [](const std::error_code&, std::size_t) {});
```

```cpp
struct CameraBitrateCmd {
    std::string camera_name;
    uint32_t camera_bps;
};
```

| 字段 | 要求 |
| --- | --- |
| `camera_name` | `camera_front` 或 `camera_back` |
| `camera_bps` | 50000 至 100000000 bit/s |

设备实际生效值通过 `OnUpdateCameraBitrateAck()` 返回。修改码率后应同时观察 RTSP 视频流和网络负载。

## 外设电源

### SetPeriphPower

```cpp
std::error_code SetPeriphPower(
    const PowerCtrlCfg& cfg, int timeout_ms = 0,
    WriteHandler handler = [](const std::error_code&, std::size_t) {});
```

```cpp
struct PowerCtrlCfg {
    PeripheralPower power;
    bool enable;
};
```

`power` 可设置为 `M1_12V`、`M1_24V` 或 `M1_48V`，`enable` 为 `true` 上电、`false` 断电。应答通过 `OnSetPeriphPower()` 返回。

### GetPeriphPower

```cpp
std::error_code GetPeriphPower(
    const PowerCtrlCfg& cfg, int timeout_ms = 0,
    WriteHandler handler = [](const std::error_code&, std::size_t) {});
```

查询指定电源通道状态。查询时主要填写 `cfg.power`，结果通过 `OnGetPeriphPower()` 返回，`ack.enable` 表示当前实际状态。

## LED 灯效

```cpp
std::error_code SetLedAutoMode(
    bool auto_mode, int timeout_ms = 0, WriteHandler handler = ...);
std::error_code GetLedAutoMode(
    int timeout_ms = 0, WriteHandler handler = ...);
std::error_code SetLedCommand(
    const LedCommand& cmd, int timeout_ms = 0, WriteHandler handler = ...);
```

| 接口 | 功能 |
| --- | --- |
| `SetLedAutoMode` | 设置 LED 自动或手动模式 |
| `GetLedAutoMode` | 查询 LED 当前模式 |
| `SetLedCommand` | 设置灯分组、灯效、颜色和灯效周期 |

```cpp
struct LedCommand {
    LedId id;
    LedEffect effect;
    LedColor color;
    uint32_t duration_ms;
};
```

`duration_ms` 表示灯效周期或闪烁间隔，单位为毫秒。`OFF`、`ON` 通常传 `0`；呼吸和闪烁灯效传所需周期值。

示例：

```cpp
LedCommand cmd{LedId::ALL, LedEffect::BLINK, {255, 128, 0, 255}, 300};
client.SetLedCommand(cmd);
```

`LedId::UNKNOWN` 或 `LedEffect::UNKNOWN` 会返回 `std::errc::invalid_argument`。设置和查询结果通过对应的 `IControlCallback` 回调获取。

状态 LED 与前后补光灯不是同一组接口。前后补光灯使用 `FrontLight()`、`BackLight()` 和 `AutoModeLight()`。

### 自动与手动模式

| 模式 | 行为与调用顺序 |
| --- | --- |
| 手动 | 调用 `SetLedAutoMode(false)`，等 `OnSetLedAutoMode()` 确认 `auto_mode == false` 后，再用 `SetLedCommand()` 设置自定义灯效。 |
| 自动 | 调用 `SetLedAutoMode(true)`，等应答确认 `auto_mode == true`。此时 `SetLedCommand()` 提交的是用户灯效事件，设备会按自身策略决定展示效果。故障、急停、告警或低电量提示可能覆盖用户灯效。 |

当前模式可通过 `GetLedAutoMode()` 查询，并在 `OnGetLedAutoMode()` 中读取。现场联调时请观察设备实际显示的灯效。[官方 LED 指南](https://github.com/zsibot/genisom_robot_sdk/blob/main/docs/en/sdk_led_control_en.md)
