"use strict";

const express = require("express");
const app = express();
const router = require("express").Router();

const Amp = require('../index');

const amp = new Amp({
  domain: "http://localhost:8080",
  key: "YOUR_AMP_KEY",
  sessionTTL: 30 * 1000
});

const session =  new amp.Session();
let s;


session.observe("name", {country: "USA"}, (err, res) => {
  s = session.serialize();
  console.log(err, res);
});

session.decide("bgStyle", {
  bgColor: ["red", "blue", "green"],
  lang: ["en", "es", "ja"]
}, (err, res) => console.log(err, res));


let c = JSON.stringify(amp.config);

app.get("/", (err, res) => {
  res.send(`<!DOCTYPE html>
<html>
<head>
  <title>Test Name</title>
  <meta http-equiv="content-type" content="text/html; charset=UTF8">
  <script src="http://localhost:8080/libs/YOUR_AMP_KEY.js"></script>
</head>
<body>
  <h1>Server Session</h1>
  <pre id='s'>${s}</pre>
  <h1>Server Config</h1>
  <div id='c'>${c}</div>
  <h1>Resumed Session in Client</h1>
  <pre id='res'></pre>
  <script>
    var oldSession = JSON.parse(document.getElementById('s').innerHTML);
    var options = JSON.parse(document.getElementById('c').innerHTML);
    console.log(options);
    amp.config(options);
    var resumeSession = new amp.Session({resumeFrom: JSON.stringify(oldSession)});
    document.getElementById('res').innerHTML = JSON.stringify(resumeSession, null, 2);
  </script>
</body>
</html>`);
});


const server =  app.listen(3000, (err) => {
  console.log("server running on 3000");
});
