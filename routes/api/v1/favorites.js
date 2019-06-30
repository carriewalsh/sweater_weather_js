var express = require('express');
var router = express.Router();
var fetch = require('node-fetch')
var pry = require('pryjs');
require('dotenv').config()

var User = require('../../../models').User;
var City = require('../../../models').City;
var UserCity = require('../../../models').UserCity;
var CityCurrent = require('../../../models').CityCurrent;


const latUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=`
const latKey = `&key=${process.env.GOOGLE_SECRET_KEY}`
const currentUrl1 = `https://api.darksky.net/forecast/${process.env.DARK_SKY_SECRET_KEY}/`
const currentUrl2 = `?exclude=daily,minutely,hourly,alerts,flags`

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


const createCurrentData = (cityData,cityId,url1,url2) => {
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
      temp: data["temperature"],
       apparent: data["apparentTemperature"],
       icon: data["icon"],
       cloudCover: data["cloudCover"],
       humidity: data["humidity"],
       visibility: data["visibility"],
       uvIndex: data["uvIndex"],
       windSpeed: data["windSpeed"],
       windDirection: data["windBearing"],
       summary: data["summary"],
       CityId: cityId
    };
    return returnData
  })
  .catch((error) => {
    console.log(error)
  })
};



router.get("/", function(req,res,next) {
  let inputKey = req.body.api_key
  User.findOne({
    where: {
      api_key: inputKey
    }
  }).then(user => {
    if (user) {
      const userCities = UserCity.findAll({
        where: {
          UserId: user["dataValues"]["id"]
        },
        include: [{model: CityCurrent}]
      })
      .then(data => {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(data))
      }
      )
      .catch((error) => {
        console.log(error)
      });
    }
    else {
      res.setHeader("Content-Type", "application/json");
      res.status(404).json({
        error: `Unauthorized.`
      });
    }
  })
  .catch((error) => {
    console.log(error)
  });
})


router.post('/', function(req,res,next) {
  let inputKey = req.body.api_key
  User.findOne({
    where: {
      api_key: inputKey
    }
  }).then(user => {
    if (user) {
      const findOrCreateCityData = getCityData(req.body.location)
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
          UserCity.findAll({
            where: {
              CityId: city[0]["dataValues"]["id"],
              UserId: user["dataValues"]["id"]
            }
          }).then(result => {
            if (result[0]) {
              res.setHeader("Content-Type", "application/json");
              res.status(200).send({
                "message": `${req.body.location} is already in your favorites`
              })
            }
            else {
              const cityName = city[0]["dataValues"]["name"] + ', ' + city[0]["dataValues"]["state"]

              const cityCurrent = createCurrentData(city[0]["dataValues"],city[0]["dataValues"]["id"],currentUrl1,currentUrl2)
              .then(results => {
                return CityCurrent.create(results)
              }).then(cityCurrent => {
                eval(pry.it)
                UserCity.create({
                  cityName: cityName,
                  CityId: city[0]["dataValues"]["id"],
                  UserId: user["dataValues"]["id"],
                  CityCurrentId: cityCurrent["dataValues"]["id"]
                })
                .then(data => {
                  //create cityCurrent
                  //create cityDay
                  //create citySteady


                  res.setHeader("Content-Type", "application/json");
                  res.status(200).send({
                    "message": `${req.body.location} has been added to your favorites`
                  })
                })
                .catch((error) => {
                  console.log(error)
                });

              })
              .catch((error) => {
                console.log(error)
              });
            }
          }).catch((error) => {
            console.log(error)
          });
        })
        .catch((error) => {
          console.log(error)
        });
      })
      .catch((error) => {
        console.log(error)
      });
    }
    else {
      res.setHeader("Content-Type", "application/json");
      res.status(404).json({
        error: `Unauthorized.`
      });
    }
  })
  .catch((error) => {
    console.log(error)
  });
})

router.delete('/', function(req,res,next) {
  let inputKey = req.body.api_key
  User.findOne({
    where: {
      api_key: inputKey
    }
  }).then(user => {
    if (user) {
      const findOrCreateCityData = getCityData(req.body.location)
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
          UserCity.findAll({
            where: {
              CityId: city[0]["dataValues"]["id"],
              UserId: user["dataValues"]["id"]
            }
          }).then(result => {
            if (result[0]) {
              UserCity.destroy({
                where: {
                  CityId: city[0]["dataValues"]["id"],
                  UserId: user["dataValues"]["id"]
                }
              })
              .then(result => {
                res.setHeader("Content-Type", "application/json");
                res.status(200).send({
                  "message": `${req.body.location} has been removed from your favorites`
                })
              })
              .catch((error) => {
                console.log(error)
              });
            }
            else {
              res.setHeader("Content-Type", "application/json");
              res.status(200).send({
                "message": `${req.body.location} is not in your favorites`
              })
            }
          }).catch((error) => {
            console.log(error)
          });
        })
        .catch((error) => {
          console.log(error)
        });
      })
      .catch((error) => {
        console.log(error)
      });
    }
    else {
      res.setHeader("Content-Type", "application/json");
      res.status(404).json({
        error: `Unauthorized.`
      });
    }
  })
  .catch((error) => {
    console.log(error)
  });
})


module.exports = router;
