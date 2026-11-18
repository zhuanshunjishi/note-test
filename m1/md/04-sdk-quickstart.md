# M1 SDK 快速开始

[返回文档总览](../index.md) | [系统组成、硬件接口与结构设计资料](./03-system-components-and-hardware-interfaces.md) | [SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md) | [M1 SDK 接口参考](./06-sdk-api-reference.md)

::: tip 开始前
请先查阅 [M1 系统与 SDK 版本兼容性](./sdk-version-compatibility.md)，根据机器人的系统版本选择对应的 SDK。
:::

## 开发环境

主要运行环境为 Ubuntu 22.04、GCC 11.4、CMake 3.8+ 和 Boost 1.74。

## SDK 目录

SDK 源码、发布说明和示例程序可从 GitHub 获取：[zsibot/genisom_robot_sdk](https://github.com/zsibot/genisom_robot_sdk)。

SDK 包的核心目录如下：

```text
genisom_robot_sdk-main/
├── include/robot_sdk/     C++ 头文件
├── lib/x86_64/            x86_64 预编译库
├── lib/aarch64/           ARM64 预编译库
├── example/               C++ 示例程序
├── docs/                  SDK 详细说明
├── README.md              英文总览
└── README_zh.md           中文总览
```

头文件和库文件的对应关系：

| 文件 | 作用 |
| --- | --- |
| `include/robot_sdk/sdk_client.hpp` | `SDKClient` 类和所有公开调用接口 |
| `include/robot_sdk/sdk_callback.hpp` | 数据上报和控制应答回调接口 |
| `include/robot_sdk/sdk_connection.hpp` | 连接状态和连接配置 |
| `include/robot_sdk/sdk_error.hpp` | SDK 错误码 |
| `include/robot_sdk/sdk_type.hpp` | 枚举、结构体和数据类型 |
| `lib/x86_64/librobot_sdk.so*` | x86_64 Linux 动态库及其版本文件 |
| `lib/aarch64/librobot_sdk.so*` | ARM64 Linux 动态库及其版本文件 |
| `example/` | 可编译运行的示例 |

## 开发机选择

SDK 需要 Linux 环境编译。可以使用：

- Ubuntu 22.04 台式机或笔记本；
- Ubuntu 22.04 虚拟机；
- 机器狗内部的 ARM64 Linux 系统，前提是有编译工具和开发依赖。

最方便的方式是使用 Ubuntu 22.04 开发机编译，再将程序和对应架构的 `.so` 文件放到运行环境中。x86_64 程序不能直接运行在 ARM64 环境，反之亦然。

## 连接机器人

### WiFi 连接

在开发电脑上连接机器人热点 `M1-xxxxxxx`，出厂密码为 `12345678`。

机器人 WiFi-AP 地址为 `192.168.234.1`，默认 UDP SDK 端口为 `8082`：

```bash
ip addr
ping -c 4 192.168.234.1
```

`ping` 成功只表示 IP 网络可达。SDK 是否连接成功，需要检查 `Connect()` 返回值或 `IsConnected()`。

### 有线连接

有线连接时，目标地址通常为运控主机的 `192.168.168.168`，SDK 仍使用 UDP `8082`。如果现场网络重新分配了地址，应使用设备实际地址。

## 编译官方示例

进入 SDK 的示例目录：

```bash
cd genisom_robot_sdk-main/example
mkdir -p build
cd build
cmake ..
make -j6
```

编译完成后先运行只读示例 `quick_start`，确认连接、握手和首帧机器人状态正常：

```bash
./quick_start 192.168.234.1 8082
```

运行有线连接：

```bash
./quick_start 192.168.168.168 8082
```

正常运行时会显示 `[OK] Connected`、`[OK] First robot state received` 和 `[OK] Disconnected cleanly`。旧版 SDK 包如未提供 `quick_start`，可运行该版本附带的 `data`。需要验证各传感器和上报配置时也可使用 `data`，见 [M1 示例程序与故障排查](./08-examples-and-troubleshooting.md)。

## 第一个连接程序

```cpp
#include <iostream>
#include "robot_sdk/sdk_client.hpp"

using namespace robot_sdk;

int main() {
    SDKClient client([](const std::error_code& ec) {
        if (ec) {
            std::cerr << "SDK error: " << ec.message() << std::endl;
        }
    });

    auto ec = client.Connect("192.168.234.1", "8082", true);
    if (ec) {
        std::cerr << "Connect failed: " << ec.message() << std::endl;
        return 1;
    }

    std::cout << "SDK version: " << client.Version() << std::endl;
    std::cout << "System version: " << client.SystemVersion() << std::endl;

    client.Disconnect(true);
    return 0;
}
```

`Connect(..., true)` 是同步连接，会等待连接和协议握手完成。只有握手成功后，`IsConnected()` 才会返回 `true`。

同步与异步调用、命令应答和动作完成状态的区别见 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md)。

## 自定义 CMake 项目

```cmake
cmake_minimum_required(VERSION 3.8)
project(m1_demo LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)

set(SDK_ROOT "/path/to/genisom_robot_sdk-main" CACHE PATH "Robot SDK root")
set(SDK_LIB_DIR "${SDK_ROOT}/lib/${CMAKE_SYSTEM_PROCESSOR}")

add_library(robot_sdk SHARED IMPORTED)
set_target_properties(robot_sdk PROPERTIES
    IMPORTED_LOCATION "${SDK_LIB_DIR}/librobot_sdk.so"
    INTERFACE_INCLUDE_DIRECTORIES "${SDK_ROOT}/include")

add_executable(m1_demo main.cpp)
target_link_libraries(m1_demo PRIVATE robot_sdk Threads::Threads)
set_target_properties(m1_demo PROPERTIES
    BUILD_RPATH "${SDK_LIB_DIR}")
```

示例按目标架构选择 `lib/x86_64` 或 `lib/aarch64`。在项目目录中配置并编译：

```bash
mkdir -p build
cd build
cmake .. -DSDK_ROOT=/path/to/genisom_robot_sdk-main
cmake --build .
```

部署时随程序提供对应架构的 SDK 动态库。运行时找不到库时，见[动态库排查](./08-examples-and-troubleshooting.md#程序启动时找不到-librobot-sdk-so)。

## 下一步

- 开始编写控制程序前，先阅读 [M1 SDK 控制流程与任务机制](./05-sdk-control-flow-and-task-handling.md)。
- 查询函数原型和参数时，使用 [M1 SDK 接口参考](./06-sdk-api-reference.md)。
- 查看回调、结构体和状态枚举时，使用 [M1 回调、数据类型与状态参考](./07-callbacks-data-types-and-status-reference.md)。
- 联调具体功能时，使用 [M1 示例程序与故障排查](./08-examples-and-troubleshooting.md)。
