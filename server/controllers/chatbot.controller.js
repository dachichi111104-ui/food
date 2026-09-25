const chatbotService = require("../services/chatbot.service");

const chat = async (req, res, next) => {
  try {
    const userId = req.user?.id || null;
    const { message } = req.body;
    const result = await chatbotService.processChatMessage(userId, message);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { chat };
