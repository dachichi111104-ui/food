const reviewService = require("../services/review.service");

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({ review });
  } catch (err) {
    next(err);
  }
};

const listReviewsByProduct = async (req, res, next) => {
  try {
    const result = await reviewService.listReviewsByProduct(req.params.productId, req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = { createReview, listReviewsByProduct };