require('dotenv').config({ path: '../.env' });
const dynamoDB = require('../aws/dynamodb_instance');

// Function for posting reviews
exports.addReview = async (req, res) => {
    const { uuid, username, moduleId, review } = req.body;
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const reviewId = `review-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;

    // Add review information to reviews-table
    const params = {
        TableName: "reviews-table",
        Item: {
            uuid: { S: uuid },
            reviewId: { S: reviewId },
            username: { S: username },
            moduleId: { S: moduleId },
            timestamp: { N: timestamp.toString() }, // Converted to string
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

    // Check if uuid exists in users-table
    try {
        const userParams = {
            TableName: "users-table",
            Key: {
                uuid: { S: uuid }
            }
        };

        const userData = await dynamoDB.getItem(userParams).promise();
        if (userData.Item) {
            // If uuid exists, update username and timestamp
            const updateUserParams = {
                TableName: "users-table",
                Key: {
                    uuid: { S: uuid }
                },
                UpdateExpression: "SET #username = :username, #timestamp = :timestamp",
                ExpressionAttributeNames: {
                    "#username": "username",
                    "#timestamp": "timestamp"
                },
                ExpressionAttributeValues: {
                    ":username": { S: username },
                    ":timestamp": { N: timestamp.toString() }
                }
            };
            await dynamoDB.updateItem(updateUserParams).promise();
        } else {
            // If uuid doesn't exist, add as a new item
            const newUserParams = {
                TableName: "users-table",
                Item: {
                    uuid: { S: uuid },
                    timestamp: { N: timestamp.toString() },
                    username: { S: username }
                }
            };
            await dynamoDB.putItem(newUserParams).promise();
        }
    } catch (error) {
        console.error("Unable to update user information: ", error);
    }
    
};

// Function for posting replies
exports.addReply = async (req, res) => {
    const { uuid, username, moduleId, reviewId, reply } = req.body;
    const timestamp = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    const replyId = `reply-${timestamp}-${Math.random().toString(36).substring(2, 15)}`;
    
    // Add reply information to replies-table
    const params = {
        TableName: "replies-table",
        Item: {
            uuid: { S: uuid},
            replyId: { S: replyId },
            username: { S: username },
            moduleId: { S: moduleId },
            reviewId: { S: reviewId },
            timestamp: { N: timestamp.toString() }, // Converted to string
            reply: { S: reply }
        }
    };

    try {
        await dynamoDB.putItem(params).promise();
        res.status(201).send({ message: "Reply added successfully", replyId });
    } catch (error) {
        console.error("Unable to add reply: ", error);
        res.status(500).send({ errorMessage: "Failed to add reply" });
    }

    // Check if uuid exists in users-table
    try {
        const userParams = {
            TableName: "users-table",
            Key: {
                uuid: { S: uuid }
            }
        };

        const userData = await dynamoDB.getItem(userParams).promise();
        if (userData.Item) {
            // If uuid exists, update username and timestamp
            const updateUserParams = {
                TableName: "users-table",
                Key: {
                    uuid: { S: uuid }
                },
                UpdateExpression: "SET #username = :username, #timestamp = :timestamp",
                ExpressionAttributeNames: {
                    "#username": "username",
                    "#timestamp": "timestamp"
                },
                ExpressionAttributeValues: {
                    ":username": { S: username },
                    ":timestamp": { N: timestamp.toString() }
                }
            };
            await dynamoDB.updateItem(updateUserParams).promise();
        } else {
            // If uuid doesn't exist, add as a new item
            const newUserParams = {
                TableName: "users-table",
                Item: {
                    uuid: { S: uuid },
                    timestamp: { N: timestamp.toString() },
                    username: { S: username }
                }
            };
            await dynamoDB.putItem(newUserParams).promise();
        }
    } catch (error) {
        console.error("Unable to update user information: ", error);
    }
};


// Function for getting reviews and replies
exports.getReviewsAndRepliesByModuleId = async (req, res) => {
    const { moduleId } = req.params;

    const reviewsParams = {
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
        const reviewsData = await dynamoDB.query(reviewsParams).promise();

        const reviews_replies = await Promise.all(reviewsData.Items.map(async (reviewItem) => {
            const repliesParams = {
                TableName: "replies-table",
                KeyConditionExpression: "#reviewId = :reviewId",
                ExpressionAttributeNames: {
                    "#reviewId": "reviewId",
                },
                ExpressionAttributeValues: {
                    ":reviewId": { S: reviewItem.reviewId.S }
                },
                ScanIndexForward: false // Orders by timestamp descending
            };

            const repliesData = await dynamoDB.query(repliesParams).promise();

            const replies = repliesData.Items.map(replyItem => ({
                username: replyItem.username.S,
                timestamp: parseInt(replyItem.timestamp.N), // Convert back to number
                review: replyItem.reply.S
            }));

            return {
                username: reviewItem.username.S,
                timestamp: parseInt(reviewItem.timestamp.N), // Convert back to number
                review: reviewItem.review.S,
                reviewId: reviewItem.reviewId.S,
                replies: replies
            };
        }));

        res.json(reviews_replies);
    } catch (error) {
        console.error("Unable to query reviews and replies: ", error);
        res.status(500).send({ errorMessage: "Failed to query reviews and replies" });
    }
};