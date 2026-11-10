import express from "express";
import HttpStatus from "http-status-codes";
import TravelService from "../services/travelServiceLLM.js";
import createStream from "../utils/streamHandler.js";

const router = express.Router();

router.post("/recommend", async (req, res) => {
  try {
    const { city, days, budget } = req.body;

    if (!city || !days || !budget) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        error: "缺少必要参数：city, days, budget",
      });
    }

    const result = await TravelService.recommend(city, days, budget);

    res.json(result);
  } catch (error) {
    console.error("推荐接口错误:", error);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: error.message || "服务器内部错误",
    });
  }
});

router.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(HttpStatus.BAD_REQUEST).json({
      success: false,
      error: "缺少必要参数：message",
    });
  }

  const stream = createStream(res);

  const result = await TravelService.chat(message, (data) => {
    console.log("AI-chat:", data);
    stream.send({
      type: "chunk",
      content: data,
    });
  });

  stream.send({
    type: "complete",
    data: result,
  });
  stream.end();
});

export default router;
