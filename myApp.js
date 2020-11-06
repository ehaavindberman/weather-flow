
const bodyParser = require('body-parser');
var express = require('express');
var app = express();
// --> 7)  Mount the Logger middleware here
app.use(function(req, res, next) {
  console.log(req.method + ' ' + req.path + ' - ' + req.ip);
  next();
});

// --> 11)  Mount the body-parser middleware  here
app.use(bodyParser.urlencoded({ extended: false }));

/** 1) Meet the node console. */
// console.log('Hello World')

/** 2) A first working Express Server */
// app.get("/", function(req,res) {
  // console.log("Hello World");
// });

/** 3) Serve an HTML file */
app.get("/", function(req,res) {
  let absolutePath = __dirname + '/views/index.html';
  // console.log(absolutePath);
  res.sendFile(absolutePath);
});

/** 4) Serve static assets  */
app.use(express.static(__dirname + '/public'));

/** 5) serve JSON on a specific route */
app.get("/json", function(req, res) {
  let data =  {
    "message": "Hello json"
  };
  if (process.env.MESSAGE_STYLE == "uppercase") {
    data = {
    "message": "HELLO JSON"
    }
  }
  res.json(data);
});

/** 6) Use the .env file to configure the app */
 
 
/** 7) Root-level Middleware - A logger */
//  place it before all the routes !


/** 8) Chaining middleware. A Time server */
app.get("/now", function(req, res, next) {
  req.time = new Date().toString();
  next();
},
function(req, res) {
  res.send({time: req.time});
});

/** 9)  Get input from client - Route parameters */
app.get("/:word/echo", function(req, res) {
  let data = {echo: req.params.word};
  res.send(data);
});

/** 10) Get input from client - Query parameters */
// /name?first=<firstname>&last=<lastname>
app.get("/name", function(req, res) {
  let name = req.query.first + ' ' + req.query.last;
  res.send({name: name});
});
  
/** 11) Get ready for POST Requests - the `body-parser` */
// place it before all the routes !

/** 12) Get data form POST  */
app.post("/name", function(req, res) {
  let name = req.body.first + ' ' + req.body.last;
  res.json({name: name});
});




const fetch = require('node-fetch');
// const request = require('request');

const options = {
  method: 'GET',
  url: 'https://api.climacell.co/v3/weather/forecast/',
  qs: {
    lat: '47.6',
    lon: '-122.33',
    unit_system: 'us',
    start_time: 'now',
    fields: [],
    // fields: ['sunrise','sunset','moon_phase','weather_code','feels_like','precipitation','wind_speed','precipitation_accumulation','cloud_cover','humidity']
    apikey: process.env.CLIMACELL_API_KEY
  }
};


function queryBuilder(request, options) {
  request += "?";
  Object.keys(options).forEach((key) => {
    if (typeof options[key] === "number" || typeof options[key] === "string") {
      if (request[request.length - 1] !== "?") {
        request += "&";
      }
      request += `${key}=${options[key]}`;
    } else if (Array.isArray(options[key])) {
      options[key].forEach((e) => {
        if (typeof e === "number" || typeof e === "string") {
          if (request[request.length - 1] !== "?") {
            request += "&";
          }
          request += `${key}=${e}`;
        }
      });
    }
  });
  return request;
}


app.get("/weather/:latlon/:type", async function(req,res) {

  options.qs.lat = req.params.latlon.split(',')[0];
  options.qs.lon = req.params.latlon.split(',')[1];

  if (req.params.type == 'hourly') {
    options.qs.fields = ['temp','precipitation_probability','weather_code']
  } else if (req.params.type == 'daily') {
    options.qs.fields = ['temp','weather_code','sunrise','sunset','moon_phase']
  }

  const url = queryBuilder(options.url + req.params.type, options.qs);
  console.log(url);
  const fetch_res = await fetch(url);
  const data = await fetch_res.json();
  res.json(data);
});



// request(options, function (error, response, body) {
//   if (error) throw new Error(error);

//   res.json(body);
// });

// This would be part of the basic setup of an Express app
// but to allow FCC to run tests, the server is already active
/** app.listen(process.env.PORT || 3000 ); */

//---------- DO NOT EDIT BELOW THIS LINE --------------------

 module.exports = app;
