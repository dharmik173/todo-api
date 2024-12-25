const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require('cors');

const connectDB = require('./MongoDb/connection');
const userRoute = require("./routes/user")
const todoRoute = require("./routes/todo")

const app = express();
const PORT = 3005

app.use(cors({
  origin: "*", // React app URL
  credentials: true, // Allow cookies and headers
}));



app.use(express.json());
app.use(cookieParser());

app.use('/user',userRoute)
app.use('/todo',todoRoute)



connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(PORT, () => {
      console.log(`Server is successfully listening on port ${PORT}...`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected!!");
  });