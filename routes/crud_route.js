const express = require("express");
const CRUDController = require("../controller/crud_controller");
const router = express.Router();

// Adding in routes for basic CRUD operations

// Routes for posting reviews and replies
router.post('/review', CRUDController.addReview);
router.post('/reply', CRUDController.addReply);

// Routes for getting reviews and replies
router.get('/review/:moduleId', CRUDController.getReviewsAndRepliesByModuleId);

module.exports = router;