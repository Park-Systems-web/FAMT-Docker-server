require("dotenv").config();
const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");

var whitelist = [
  "http://localhost:8080",
  "http://ec2-18-144-161-137.us-west-1.compute.amazonaws.com:81",
  "http://famt.parksystems.com",
  "https://famt.parksystems.com",
  "famt.parksystems.com",
];
var corsOptions = {
  origin: function (origin, callback) {
    console.log(origin);
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(cookies());
app.use(cors(corsOptions));

app.use("/api/page/common", require("./routes/commonRouter"));
app.use("/api/users", require("./routes/usersRouter"));
app.use("/api/admin", require("./routes/adminRouter"));
app.use("/api/menu", require("./routes/menuRouter"));
app.use("/api/mail", require("./routes/mailRouter"));
app.use("/api/zoom", require("./routes/zoomRouter"));

app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(require("./config/swaggerDoc"))
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Sever is running on port ", PORT);
});
