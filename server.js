require("dotenv").config({ path: '.env' });
const express = require("express");
const cors = require('cors');
const CRUDRoute = require("./routes/crud_route");

// Spin up Node Server
const app = express();

// Adding in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
// app.use("/", (req, res, next) => {
//     console.log('Incoming request:', req.method, req.url);
//     console.log('Request body:', req.body); // Assuming you are using body-parser or similar middleware to parse request bodies
//     next(); // Call next to pass the request to the next middleware in the stack
// })
app.use("/", CRUDRoute);

app.get('/', function (req, res) {
    res.send('Server running!');
 })

app.listen(process.env.PORT, () => {
    console.log("Listening to PORT " + process.env.PORT);
});