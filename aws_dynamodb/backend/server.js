require("dotenv").config({ path: '.env' });
const express = require("express");
const cors = require('cors');
const CRUDRoute = require("./routes/crud_route");

// Spin up Node Server
const app = express();

app.get('/', function (req, res) {
    res.send('Server running!');
 })

app.listen(process.env.PORT, () => {
    console.log("Listening to PORT " + process.env.PORT);
});

// Adding in Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use("/", CRUDRoute);