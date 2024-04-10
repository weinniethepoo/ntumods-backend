require('dotenv').config({ path: '../.env' });
const dynamoDB = require('../aws/dynamodb_instance');

// Functions for reviews
exports.addReview = async (req, res) => {
    const { userId, moduleId, review } = req.body;
    const timestamp = Math.floor(Date.now() / 1000).toString(); // Unix timestamp in seconds
    const reviewId = `review-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;

    const params = {
        TableName: "reviews-table",
        Item: {
            reviewId: { S: reviewId },
            userId: { S: userId },
            moduleId: { S: moduleId },
            timestamp: { S: timestamp },
            review: { S: review }
        }
    };

    try {
        await dynamoDB.putItem(params).promise();
        res.status(201).send({ message: "Review added successfully", reviewId });
    } catch (error) {
        console.error("Unable to add review: ", error);
        res.status(500).send({ errorMessage: "Failed to add review" });
    }
};

exports.getReviewsByModuleId = async (req, res) => {
    const { moduleId } = req.params;

    const params = {
        TableName: "reviews-table",
        KeyConditionExpression: "#moduleId = :moduleId",
        ExpressionAttributeNames: {
            "#moduleId": "moduleId",
        },
        ExpressionAttributeValues: {
            ":moduleId": { S: moduleId }
        },
        ScanIndexForward: false // Orders by timestamp descending
    };

    try {
        const data = await dynamoDB.query(params).promise();
        // Map over the Items array to transform each item to the desired format
        const formattedItems = data.Items.map(item => ({
            moduleId: item.moduleId.S,
            review: item.review.S,
            reviewId: item.reviewId.S,
            userId: item.userId.S,
            timestamp: item.timestamp.S
        }));
        res.json(formattedItems);
    } catch (error) {
        console.error("Unable to query reviews: ", error);
        res.status(500).send({ errorMessage: "Failed to query reviews" });
    }
};

// Functions for replies
exports.addReply = async (req, res) => {
    const { userId, moduleId, reviewId, reply } = req.body;
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const replyId = `reply-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;

    const params = {
        TableName: "replies-table",
        Item: {
            replyId,
            userId,
            moduleId,
            reviewId,
            timestamp,
            reply
        }
    };

    try {
        await dynamoDB.docClient.put(params).promise();
        res.status(201).send({ message: "Reply added successfully", replyId });
    } catch (error) {
        console.error("Unable to add reply: ", error);
        res.status(500).send({ errorMessage: "Failed to add reply" });
    }
};

exports.getRepliesByReviewId = async (req, res) => {
    const { reviewId } = req.params;

    const params = {
        TableName: "replies-table",
        KeyConditionExpression: "reviewId = :reviewId",
        ExpressionAttributeValues: {
            ":reviewId": reviewId
        },
        ScanIndexForward: false // Orders by timestamp descending
    };

    try {
        const data = await dynamoDB.docClient.query(params).promise();
        res.json(data.Items);
    } catch (error) {
        console.error("Unable to query replies: ", error);
        res.status(500).send({ errorMessage: "Failed to query replies" });
    }
};