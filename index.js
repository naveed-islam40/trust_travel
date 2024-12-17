import express from "express";
import ConnectDB from "./config/dataBase.js";
import "./config/dotenvConfig.js"
import routes from "./routes/routes.js"
import cookieParser from "cookie-parser";
const app = express();


const port = process.env.PORT || 3000;

//connect database
ConnectDB()

// middleware
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/", routes)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});