const express = require("express");
const nodefetch = require("node-fetch");
const redis = require("redis");

const PORT = process.env.PORT || 5000;
const REDIS_PORT = 6379;

const client = redis.createClient(REDIS_PORT);

const app = express();

//to set response
function setResponse(key_sols, sols) {

    return `<h2>${key_sols} has ${sols}</h2>`;
}

//to get data from nasa api
async function getMarsWeather(req, res, next) {
  try {
    console.log("Fetching data now....");

    const response = await nodefetch(
      "https://api.nasa.gov/insight_weather/?api_key=drRkUQz546fM0NVWAf8rkUx9duCRcCydpMBDbdNc&feedtype=json&ver=1.0"
    );

    const data = await response.json();
    //console.log(data);

    const sols = data.sol_keys;

    client.setex("key_sols", 3600, sols);

    res.send(setResponse("key_sols", sols));
  } catch (err) {
    console.error(err);
    res.status(500);
  }
}


//cache middleware 
function cacheR(req, res, next) {
    req.params;

    client.get("key_sols", (err, data)=> {
        if (err) {
            throw err;
        }
        if (data !=null ){
            console.log('returning from cache itself');
            res.send(setResponse("key_sols", data));
        } else {
            next();
        }


    });
}


//routes and server
app.get("/mars/weather",cacheR,  getMarsWeather);

app.listen(5000, () => {
  console.log("App listening on port ", PORT, " active");
});
