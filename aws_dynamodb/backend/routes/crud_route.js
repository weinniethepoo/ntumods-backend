const express = require("express");
const CRUDController = require("../controller/crud_controller");
const router = express.Router();

// Adding in routes for basic CRUD operations
// Reviews routes
router.post('/reviews', CRUDController.addReview);
router.get('/reviews/:moduleId', CRUDController.getReviewsByModuleId);


// Replies routes
router.post('/replies', CRUDController.addReply);
router.get('/replies/review/:reviewId', CRUDController.getRepliesByReviewId);

module.exports = router;