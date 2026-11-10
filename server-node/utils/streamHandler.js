export default function createStream(res) {
  res.setHeader("Content-Type", "text/event-stream");
  //   禁用缓存
  res.setHeader("cache-control", "no-cache");
  //   保持连接打开
  res.setHeader("connection", "keep-alive");
  //   禁用缓冲区
  res.setHeader("X-Accel-Buffering", "no");
  return {
    send: (data) => {
      console.log("发送数据到流:", data);
      try {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      } catch (error) {
        console.error("发送数据到流错误:", error);
      }
    },
    end: () => {
      try {
        res.write(`event: done\ndata: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      } catch (error) {
        console.error("发送结束信号到流错误:", error);
      }
    },
    error: (error) => {
      console.error("处理流时出错:", error);
      res.write(
        `data: ${JSON.stringify({ error: error.message || "未知错误" })}\n\n`,
      );
      res.end();
    },
  };
}
