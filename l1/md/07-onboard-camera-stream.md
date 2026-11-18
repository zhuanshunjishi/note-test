# 本体相机视频流

[返回首页](../index.md) | [设备操作、遥控器与 App 使用说明](./05-device-controller-and-app-guide.md) | [SDK 开发与运行指南](./08-sdk-development-guide.md)

## 视频流信息

L1 本体相机通过 RTSP 提供 H.264 视频流。开发设备连接机器人网络后，可使用以下带认证信息的默认地址拉取画面。

```text
rtsp://user:Abcd%232027%21@192.168.234.1:8554/test
```

| 项目 | 默认值 |
| --- | --- |
| 协议 | RTSP |
| 机器人 IP | `192.168.234.1` |
| 端口 | `8554` |
| 流路径 | `/test` |
| 视频编码 | H.264 |

如果机器人 IP 已修改，应将地址中的 `192.168.234.1` 替换为当前实际 IP。

### 账号认证

播放器提示输入账号和密码时，填写以下默认凭据。

| 项目 | 值 |
| --- | --- |
| 用户名 | `user` |
| 密码 | `Abcd#2027!` |

默认地址中的密码已进行 URL 编码，其中 `#` 编码为 `%23`，`!` 编码为 `%21`。在播放器的独立密码输入框中填写上表中的原始密码。

## 使用前准备

1. 将机器人开机，等待启动完成。
2. 在带屏遥控器应用的设置页面中打开“视频流开关”并保存设置。
3. 将拉流设备连接到机器人网络。
4. 确认机器人 IP 可以访问：

```bash
ping -c 4 192.168.234.1
```

5. 确认本机防火墙或网络策略没有阻止 RTSP 连接。

视频流与 HighLevel 控制使用不同端口。能够运行 SDK Demo 不代表 RTSP 一定可以播放；同样，能够看到画面也不代表 SDK 控制连接已经建立。

## 使用 FFplay 播放

### 安装 FFmpeg

```bash
sudo apt update
sudo apt install -y ffmpeg
```

### 播放视频流

```bash
ffplay -rtsp_transport tcp \
  -fflags nobuffer \
  -flags low_delay \
  -framedrop \
  -strict experimental \
  -probesize 32 \
  -analyzeduration 0 \
  -sync ext \
  'rtsp://user:Abcd%232027%21@192.168.234.1:8554/test'
```

该命令使用 TCP 传输，并通过减小探测和缓冲降低显示延迟。按 `q` 退出播放。

## 使用 GStreamer 播放

### 安装 GStreamer

```bash
sudo apt update
sudo apt install -y \
  gstreamer1.0-tools \
  gstreamer1.0-plugins-base \
  gstreamer1.0-plugins-good \
  gstreamer1.0-plugins-bad \
  gstreamer1.0-plugins-ugly \
  gstreamer1.0-libav
```

### 播放视频流

```bash
gst-launch-1.0 \
  rtspsrc location='rtsp://user:Abcd%232027%21@192.168.234.1:8554/test' latency=0 \
  ! rtph264depay \
  ! h264parse \
  ! avdec_h264 \
  ! videoconvert \
  ! videoscale \
  ! video/x-raw,width=1280,height=720 \
  ! autovideosink
```

管道依次完成 RTSP 接收、H.264 RTP 解包、解析、解码、颜色转换和画面显示。需要结束时，在终端按 `Ctrl+C`。

## 使用 VLC 播放

1. 打开 VLC。
2. 选择“媒体” > “打开网络串流”。
3. 输入本文开头的默认 RTSP 地址。
4. 点击“播放”。

VLC 的实际延迟和兼容性受版本及缓存设置影响。无法打开或延迟较大时，优先使用 FFplay 或 GStreamer 验证视频流。

## 使用 OpenCV 读取

### 安装依赖

```bash
sudo apt update
sudo apt install -y python3-opencv
```

### Python 示例

```python
import os
import time

import cv2


RTSP_URL = "rtsp://user:Abcd%232027%21@192.168.234.1:8554/test"


def open_stream(url):
    os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp"
    capture = cv2.VideoCapture(url, cv2.CAP_FFMPEG)
    capture.set(cv2.CAP_PROP_BUFFERSIZE, 1)
    return capture


def main():
    capture = open_stream(RTSP_URL)

    try:
        while True:
            if not capture.isOpened():
                print("无法打开视频流，1 秒后重试")
                capture.release()
                time.sleep(1)
                capture = open_stream(RTSP_URL)
                continue

            ok, frame = capture.read()
            if not ok:
                print("视频流中断，1 秒后重连")
                capture.release()
                time.sleep(1)
                capture = open_stream(RTSP_URL)
                continue

            cv2.imshow("L1 RTSP Stream", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        capture.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
```

运行脚本后按 `q` 退出。`CAP_PROP_BUFFERSIZE` 是否生效取决于当前 OpenCV 和 FFmpeg 后端；出现画面累积延迟时，可改用下一节的 GStreamer 管道。

## OpenCV 使用 GStreamer

该方式通过 GStreamer 接收并解码视频，再把最新一帧交给 OpenCV。

### 检查 OpenCV 是否支持 GStreamer

```bash
python3 -c "import cv2; print(cv2.getBuildInformation())" | grep GStreamer
```

输出中应显示 `GStreamer: YES`。如果显示 `NO`，当前 OpenCV 无法使用 `cv2.CAP_GSTREAMER`，应改用 FFmpeg 后端或安装带 GStreamer 支持的 OpenCV。

### Python 示例

```python
import cv2


RTSP_URL = "rtsp://user:Abcd%232027%21@192.168.234.1:8554/test"


def main():
    pipeline = (
        f"rtspsrc location={RTSP_URL} latency=0 ! "
        "rtph264depay ! h264parse ! avdec_h264 ! "
        "videoconvert ! video/x-raw,format=BGR ! "
        "appsink sync=false drop=true max-buffers=1"
    )

    capture = cv2.VideoCapture(pipeline, cv2.CAP_GSTREAMER)
    if not capture.isOpened():
        raise RuntimeError("无法打开 GStreamer 视频流")

    try:
        while True:
            ok, frame = capture.read()
            if not ok:
                print("读取视频帧失败")
                break

            cv2.imshow("L1 GStreamer Stream", frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                break
    finally:
        capture.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    main()
```

`drop=true max-buffers=1` 会丢弃积压帧，适合优先保证实时性的显示和视觉处理场景。

## 延迟优化

- 优先使用有线网络或信号稳定的 Wi-Fi，避免开发设备同时进行大流量下载。
- FFplay 使用 `-rtsp_transport tcp`、`-fflags nobuffer` 和 `-flags low_delay`。
- GStreamer 将 `latency` 设为较小值，并在 `appsink` 中设置 `drop=true max-buffers=1`。
- OpenCV 处理循环不要执行耗时阻塞操作；推理、存盘和显示可拆分到不同线程。
- 只需要算法输入时，不要额外执行 `resize` 或重复颜色转换。
- TCP 在丢包环境下通常更稳定，但可能因重传增加延迟；应结合现场网络情况测试。

## 常见问题

| 现象 | 检查与处理 |
| --- | --- |
| `ping` 不通 | 检查是否连接机器人网络、机器人 IP 是否正确，以及本机网卡配置 |
| `Connection refused` | 确认机器人启动完成，并在遥控器应用中打开视频流开关 |
| `401 Unauthorized` 或提示账号认证 | 通过 URL 连接时，检查是否使用了本文开头带认证信息的默认地址。播放器单独提示认证时，填写“账号认证”一节中的用户名和原始密码 |
| FFplay 可以播放，OpenCV 无法打开 | 检查 OpenCV 的 FFmpeg/GStreamer 后端支持情况 |
| GStreamer 提示缺少元素 | 安装本章列出的 GStreamer 插件包，使用 `gst-inspect-1.0` 检查缺失插件 |
| 可以连接但没有画面 | 检查 RTSP 路径是否为 `/test`，然后重启播放器并重新切换视频流开关 |
| 画面延迟持续增加 | 减少缓冲、丢弃积压帧，避免在取帧线程中执行耗时处理 |
| 画面卡顿或花屏 | 检查无线信号、带宽和丢包情况，分别测试 FFplay TCP 与 GStreamer |

[返回首页](../index.md)
