var express = require('express');
var router = express.Router();
var fetch = require('node-fetch')
var pry = require('pryjs');
require('dotenv').config()


var City = require('../../../models').City;
// var CitySteady = require('../../../models').CitySteady;
// var CityCurrent = require('../../../models').CityCurrent;
// var CityDays = require('../../../models').CityDays;

const steadyUrl = `https://weather.cit.api.here.com/weather/1.0/report.json?app_id=DemoAppId01082013GAL&app_code=AJKnXv84fjrb0KIHawS0Tg&product=forecast_astronomy&name=`

const currentUrl1 = `https://api.darksky.net/forecast/${process.env.DARK_SKY_SECRET_KEY}/`
const currentUrl2 = `?exclude=daily,minutely,hourly,alerts,flags`

const forecastUrl1 = `https://api.darksky.net/forecast/${process.env.DARK_SKY_SECRET_KEY}/`
const forecastUrl2 = `?exclude=currently,minutesly,hourly,alerts,flags&time=${new Date()}`

const latUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=`
const latKey = `&key=${process.env.GOOGLE_SECRET_KEY}`

const getCityData = (input) => {
  return fetch(latUrl + input + latKey)
  .then(response => {
    if (response.ok) {
      return response.json();}
    throw new Error('Request Failed.');},
    networkError => console.log(networkError.message))
  .then(json => {
    return formatCityData(json)
  })
  .catch((error) => {
    console.log(error)
  })
};

function formatCityData(json) {
  let address = json["results"][0]["formatted_address"];
  let geodata = json["results"][0]["geometry"]["location"];
  let cityData = {
    name: address.split(", ")[0],
    state: address.split(", ")[1],
    country: address.split(", ")[2],
    latitude: geodata["lat"],
    longitude: geodata["lng"]
  }
  return cityData
};

// const x = getCityData("Salem,or")
// .then(cityData => {
//   getNewData(cityData,"steadies",steadyUrl)
// }).then(response => {
// })
//
// console.log(x)

const getSteadyData = (cityData,url) => {
  const fullCity = cityData.name + ',' + cityData.state
  return fetch(url + fullCity)
  .then(response => {
    if (response.ok) {
      return response.json();}
      throw new Error('Request Failed.');},
      networkError => console.log(networkError.message))
      .then(json => {
        let data = json["astronomy"]["astronomy"][0];
        let returnData = {
          sunrise: data["sunrise"],
          sunset: data["sunset"],
          moon_phase: data["moonPhase"],
          phase_description: data["moonPhaseDesc"],
          phase_icon: data["iconName"]
        }
        return returnData
      })
      .catch((error) => {
        console.log(error)
      })
    };


const getCurrentData = (cityData,url1,url2) => {
  const latLong = cityData.latitude + ',' + cityData.longitude
  return fetch(url1 + latLong + url2)
  .then(response => {
    if (response.ok) {
      return response.json();}
    throw new Error('Request Failed.');},
    networkError => console.log(networkError.message))
  .then(json => {
    let data = json["currently"];
    let returnData = {
      "temp": data["temperature"],
       "apparent": data["apparentTemperature"],
       "icon": data["icon"],
       "cloud_cover": data["cloudCover"],
       "humidity": data["humidity"],
       "visibility": data["visibility"],
       "uv_index": data["uvIndex"],
       "wind_speed": data["windSpeed"],
       "wind_direction": data["windBearing"],
       "summary": data["summary"]
    };
    return returnData
  })
  .catch((error) => {
    console.log(error)
  })
};


const getCityDayData = (cityData,url1,url2) => {
  const latLong = cityData.latitude + ',' + cityData.longitude
  return fetch(url1 + latLong + url2)
  .then(response => {
    if (response.ok) {
      return response.json();}
    throw new Error('Request Failed.');},
    networkError => console.log(networkError.message))
  .then(json => {
    let data = json["daily"]["data"]
    let returnData = {}
    for (var i = 0; i < data.length; i ++) {
      returnData[`${i + 1}`] = {
        // "city_id": data[i][""],
        // "day_id": data[i][""],
        "high": data[i]["temperatureHigh"],
        "low": data[i]["temperatureLow"],
        "icon": data[i]["icon"],
        "precip_probability": data[i]["precipProbability"],
        "summary": data[i]["summary"]
      }
    }
    return returnData
  })
  .catch((error) => {
    console.log(error)
  })
};

// eval(pry.it);


// console.log(steadies)
// console.log(cityDays)
// console.log(currents)

const getNewCityAll = (cityData) => {
  const test = getNewData(cityData,steadies,steadyUrl)
  getNewData(cityData,latlong,currentUrl1,currentUrl2)
  getNewData(cityData,latlong,forecastUrl1,forecastUrl2)
  // steadies: getNewData(id,steadyUrlFull), ["astronomy"]["astronomy"]
  // current: getNewData(id,currentUrlFull),
  // forecast: getNewData(id,forecastUrlFull)
};

// var pry = require('pryjs'); eval(pry.it);

router.get("/", function(req,res,next) {
  const findOrCreateCityData = getCityData(req.query.location)
    .then(result => {
      return City.findOrCreate({
        where: {
          name: result["name"],
          state: result["state"],
          country: result["country"],
          latitude: result["latitude"].toString(),
          longitude: result["longitude"].toString()
        }
      })
      .then(city => {
        return city
      })
      .catch((error) => {
        console.log(error)
      })
    })
    .then(data => {
      return data[0]["dataValues"]
    })
    .catch((error) => {
      console.log(error)
    })

  const steadies = getCityData(req.query.location)
    .then(cityData => {
      return getSteadyData(cityData,steadyUrl)
    })
    .then(response => {
      return response
    })
    .catch((error) => {
      console.log(error)
    });

  const currents = getCityData(req.query.location)
    .then(cityData => {
      return getCurrentData(cityData,currentUrl1,currentUrl2)
    })
    .then(response => {
      return response
    })
    .catch((error) => {
      console.log(error)
    });

  const cityDays = getCityData(req.query.location)
    .then(cityData => {
      return getCityDayData(cityData,forecastUrl1,forecastUrl2)
    })
    .then(response => {
      return response
    })
    .catch((error) => {
      console.log(error)
    });



  Promise.all([findOrCreateCityData,currents,steadies,cityDays])
    .then(data => {
      res.setHeader("Content-Type", "application/json");
      res.status(201).send({
            city: data[0],
            current: data[1],
            steadies: data[2],
            forecast: data[3]
          })
        });
});


module.exports = router;
