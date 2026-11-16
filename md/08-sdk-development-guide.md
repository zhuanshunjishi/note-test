# SDK 开发与运行指南

[返回首页](../index.md) | [硬件、软件与结构架构](./03-system-architecture.md) | [SDK 软件服务接口](./06-sdk-service-interfaces.md)

## 最小使用流程

以下步骤在 Linux 终端中执行。SDK 提供 `x86_64` 和 `aarch64` 两种静态库，运行环境的处理器架构必须与所用静态库一致。

开始前，将机器人放置在平整、开阔的区域，确保随时可以停止运动。机器人开机后，将运行 SDK 的 Linux 设备连接到机器人网络。

### 1. 安装编译工具

```bash
sudo apt update
sudo apt install -y build-essential cmake
```

### 2. 进入 SDK 根目录

将路径替换为 SDK 在 Linux 设备上的实际位置：

```bash
cd /path/to/genisom_L1_sdk-main
pwd
ls CMakeLists.txt include/zsibot_sdk example lib
```

终端应能看到 `CMakeLists.txt`，以及 `include`、`example`、`lib` 目录。

### 3. 确认处理器架构

```bash
uname -m
```

| 输出 | 对应静态库 |
| --- | --- |
| `x86_64` | `lib/x86_64/libzsibot.a` |
| `aarch64` | `lib/aarch64/libzsibot.a` |

### 4. 编译 SDK Demo

```bash
mkdir -p build
cd build
cmake -DCMAKE_BUILD_TYPE=Release ..
cmake --build .
cd ..
```

检查两个 Demo 是否已经生成：

```bash
ls -l build/example/remote_control
ls -l build/example/sdk_control
```

### 5. 检查机器人网络

SDK 默认连接机器人 IP `192.168.234.1`，向机器人 `8081/UDP` 端口发送数据，并在本机 `8080/UDP` 端口接收状态。

```bash
ip addr
ping -c 4 192.168.234.1
```

`ping` 不通时，先检查 Linux 设备是否已经连接机器人网络，以及本机 IP 是否与机器人处于可通信网段。`ping` 成功后，再运行 Demo。

### 6. 运行 Remote Demo

```bash
./build/example/remote_control
```

该 Demo 使用 `ROLE_REMOTE` 身份。程序启动后可使用以下基础按键：

| 按键 | 操作 |
| --- | --- |
| `i` | 输出设备、电池、模式及运动状态 |
| `2` | 站立 |
| `w` / `s` | 前进 / 后退 |
| `a` / `d` | 左移 / 右移 |
| `q` / `e` | 左转 / 右转 |
| `c` | 停止移动 |
| `1` | 趴下 |
| `0` | 软急停并趴下 |

第一次测试建议按 `i` 查看状态，然后依次测试站立、单一方向短距离移动、停止和趴下。每次方向测试后立即按 `c`，不要在人员靠近机器人时测试运动按键。

### 7. 运行 SDK Demo

先按 `Ctrl+C` 结束 `remote_control`，再执行：

```bash
./build/example/sdk_control
```

`sdk_control` 使用 `ROLE_SDK` 身份，必须先申请 SDK 控制权：

1. 按 `k` 发送 SDK 控制权请求。
2. 按 `i` 查看功能模式反馈，确认控制权已经切换。
3. 按 `2` 站立，只测试一个移动方向，并按 `c` 停止。
4. 按 `1` 让机器人趴下。
5. 按 `r` 请求恢复 Remote 控制权，并再次查看模式反馈。
6. 按 `Ctrl+C` 退出程序。

创建 `ZsibotExecutor(Role::ROLE_SDK)` 只设置通信身份，不代表程序已经取得运动控制权。

### 8. 恢复终端

两个 Demo 会关闭终端的规范输入和字符回显。退出后如果终端不显示输入内容，执行：

```bash
stty sane
reset
```

## 开发路线

| 开发目标 | 使用接口 | 运行位置 | 建议起点 |
| --- | --- | --- | --- |
| 状态读取、姿态切换、连续运动和任务控制 | HighLevel `ZsibotExecutor` | Linux x86_64 或 aarch64 开发主机 | 先运行官方 HighLevel 示例 |

## 构建说明

### 构建要求

当前工程以根目录 `CMakeLists.txt` 为准：

| 项目 | 要求 |
| --- | --- |
| 操作系统 | Linux |
| CMake | 3.10 或更高版本 |
| C++ 标准 | C++20 |
| 线程库 | POSIX Threads，由 CMake 自动查找 |
| 支持架构 | `x86_64`、`aarch64` |

根目录 `CMakeLists.txt` 设置 `CMAKE_CXX_STANDARD 20`，开发工程应使用相同的编译标准。

根工程根据 `CMAKE_SYSTEM_PROCESSOR` 自动选择预编译静态库。需要交叉编译或手动指定目标架构时，可在配置阶段设置 `ZSIBOT_ARCH`：

```bash
cd build
cmake -DZSIBOT_ARCH=x86_64 ..
cmake --build .
cd ..
```

在 ARM64 环境中将参数改为 `aarch64`。

### 可选安装

需要让其他工程从系统目录引用 SDK 时，可执行：

```bash
sudo cmake --build build --target install
```

默认安装位置：

| 内容 | 路径 |
| --- | --- |
| 头文件 | `/usr/local/include/zsibot_sdk/` |
| 静态库 | `/usr/local/lib/libzsibot.a` |

## Demo 说明

两个示例的完整操作步骤、按键说明和控制权切换流程见[第九章：官方示例使用说明](./09-official-examples.md)。

| 示例 | 构造身份 | 主要用途 | 控制权要求 |
| --- | --- | --- | --- |
| `remote_control.cpp` | 默认 `ROLE_REMOTE` | 键盘遥控和 HighLevel 状态读取 | 遥控流程 |
| `sdk_control.cpp` | `ROLE_SDK` | 算法程序和自动控制流程验证 | 发送 SDK 控制权命令并确认模式反馈 |

两个示例都使用非阻塞终端输入，通过 `SetRemote()` 发送连续运动量，通过 `SetCmd()` 发送离散命令。控制权定义见[硬件、软件与结构架构](./03-system-architecture.md)，命令和状态确认方式见[控制指令接口](./06-01-control-commands.md)。Demo 用于接口验证，正式应用仍需实现连接检查、控制权确认、超时停止和异常退出保护。

## 创建自己的 HighLevel 工程

程序入口、连接等待和状态读取方式见 [SDK 软件服务接口](./06-sdk-service-interfaces.md)中的最小流程示例。自定义工程可以通过以下 CMake 配置引用 SDK。

### CMake 集成

如果 SDK 与应用工程分开放置，可以把 SDK 根目录作为子项目加入：

```cmake
cmake_minimum_required(VERSION 3.10)
project(robot_app LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(Threads REQUIRED)

set(ZSIBOT_SDK_ROOT "/absolute/path/to/genisom_l1_sdk-main"
    CACHE PATH "Zsibot SDK root")

add_subdirectory(
    "${ZSIBOT_SDK_ROOT}"
    "${CMAKE_BINARY_DIR}/zsibot_sdk"
)

add_executable(robot_app main.cpp)
target_link_libraries(robot_app PRIVATE zsibot_sdk Threads::Threads)
```

构建应用：

```bash
mkdir -p build
cd build
cmake ..
cmake --build .
```

## 调试与排查

### 常见问题

| 现象 | 检查内容 | 处理 |
| --- | --- | --- |
| 找不到 `CMakeLists.txt` | 当前目录 | 回到 SDK 根目录后重新配置 |
| 找不到 `libzsibot.a` | SDK 包完整性、`uname -m`、`ZSIBOT_ARCH` | 使用与目标架构一致的静态库 |
| 出现 C++ 标准相关错误 | 编译器和工程标准 | 使用支持 C++20 的编译器，并保持 `CMAKE_CXX_STANDARD 20` |
| `ping` 成功但 `IsConnected()` 为 `false` | UDP 双向通信、接收端口、防火墙、机器人状态 | 继续检查 8080/UDP 接收和 8081/UDP 发送链路 |
| `sdk_control` 可以连接但运动命令无效 | 控制权和功能模式 | 请求 SDK 控制权并确认 `GetFunctionMode()` 反馈 |
| 程序退出后终端不显示输入 | 终端回显状态 | 执行 `stty sane`，必要时执行 `reset` |
| Windows 链接静态库失败 | 平台格式 | 当前静态库仅支持 Linux x86_64 和 aarch64 |
| SSH 正常但示例无法连接 | SSH 与 SDK UDP 是不同通道 | 单独检查 SDK IP、端口、状态接收和防火墙 |

[返回首页](../index.md)
