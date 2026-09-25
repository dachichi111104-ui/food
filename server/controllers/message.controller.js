const messageService = require("../services/message.service");

const sendMessage = async (req, res, next) => {
  try {
    const message = await messageService.sendMessage(req.user.id, req.body);
    res.status(201).json({ message });
  } catch (err) {
    next(err);
  }
};

const listMessages = async (req, res, next) => {
  try {
    const messages = await messageService.listMessages(req.user.id, req.user.role, req.query);
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendMessage, listMessages };

