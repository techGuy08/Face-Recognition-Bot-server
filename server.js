require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const { json } = require("body-parser");
const uniqid = require("uniqid");
const cors = require("cors");
const e = require("express");
const mongoose = require("mongoose");
const User = require("./modules/User.js");
var bcrypt = require("bcryptjs");

const app = express();
const { DATABASE_URL } = process.env;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

function getUserRankObject({ id, email }, users) {
  users = users.sort((a, b) => b.entries - a.entries);
  let index = users.findIndex((item) => item.id === id || item.email === email);
  let userFound = null;
  if (index !== -1) {
    const {
      id,
      email,
      entries,
      joined,
      name = email.replace(/\@.+$/, ""),
    } = users[index];
    userFound = {
      id,
      email,
      entries,
      joined,
      rank: index + 1,
      name,
    };
  }
  return userFound;
}
app.get("/", (req, res) => {
  res.send("it's working");
});
app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  User.find().then(function (users) {
    let userFound = getUserRankObject({ id }, users);
    if (users.length && userFound) {
      res.json(userFound);
    } else {
      res.json("invalid");
    }
  });
});

app.post("/signin", function (req, res) {
  const { email, password } = req.body;
  User.find().then((users) => {
    let userFound = getUserRankObject({ email }, users);
    let userHash = users.filter((el) => el.email === email)[0].password || null;
    if (users.length && userFound) {
      bcrypt.compare(password, userHash, function (err, boolean) {
        if (boolean) {
          res.json(userFound);
        } else {
          res.json("invalid");
        }
      });
    } else {
      res.json("invalid");
    }
  });
});

app.post("/signup", (req, res) => {
  const { email, password, name } = req.body;
  User.find().then((users) => {
    const userFound = getUserRankObject({ email }, users);
    if (!userFound) {
      let hash = bcrypt.hashSync(password, 8);
      let newUser = {
        id: uniqid(),
        name: name,
        email: email,
        password: hash,
        entries: 0,
        joined: new Date(),
        rank: users.length + 1,
      };
      User.create(newUser);
      res.json(newUser);
    } else {
      res.json("invalid");
    }
  });
});

app.put("/image", (req, res) => {
  const { email, id } = req.body;
  User.find().then((users) => {
    let userFound = getUserRankObject({ id }, users);
    if (users.length && userFound) {
      userFound.entries++;
      User.updateOne({ id, email }, { entries: userFound.entries }).then(() => {
        res.json({ entries: userFound.entries });
      });
    } else {
      res.json("invalid");
    }
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log("server started on " + PORT);
});
