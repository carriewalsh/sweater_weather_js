var express = require('express');
var router = express.Router();
var fetch = require('node-fetch')
var pry = require('pryjs');
require('dotenv').config()

var User = require('../../../models').User;
var City = require('../../../models').City;
var UserCity = require('../../../models').UserCity;
var CityCurrent = require('../../../models').CityCurrent;
var CitySteady = require('../../../models').CitySteady;
var Day = require('../../../models').Day;



const steadyUrl = `https://weather.cit.api.here.com/weather/1.0/report.json?app_id=DemoAppId01082013GAL&app_code=AJKnXv84fjrb0KIHawS0Tg&product=forecast_astronomy&name=`

const forecastUrl1 = `https://api.darksky.net/forecast/${process.env.DARK_SKY_SECRET_KEY}/`
const forecastUrl2 = `?exclude=currently,minutesly,hourly,alerts,flags&time=${new Date()}`



// const createCurrentData = (cityData,cityId,url1,url2) => {
//   const latLong = cityData.latitude + ',' + cityData.longitude
//   return fetch(url1 + latLong + url2)
//   .then(response => {
//     if (response.ok) {
//       return response.json();}
//     throw new Error('Request Failed.');},
//     networkError => console.log(networkError.message))
//   .then(json => {
//     let data = json["currently"];
//     let returnData = {
//       temp: data["temperature"],
//        apparent: data["apparentTemperature"],
//        icon: data["icon"],
//        cloudCover: data["cloudCover"],
//        humidity: data["humidity"],
//        visibility: data["visibility"],
//        uvIndex: data["uvIndex"],
//        windSpeed: data["windSpeed"],
//        windDirection: data["windBearing"],
//        summary: data["summary"],
//        CityId: cityId
//     };
//     return returnData
//   })
//   .catch((error) => {
//     console.log(error)
//   })
// };

router.get("/", function(req,res,next) {
  if (req.body.api_key) {
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
          return CitySteady.findAll({
            where: {
              CityId: data[0]["dataValues"]["id"]
            }
          })
        })
        .then(allData => {
          eval(pry.it)
          res.setHeader("Content-Type", "application/json");
          res.status(200).send(JSON.stringify(data))
        })
        .catch((error) => {
          console.log(error)
        });
    }
    else {
      res.setHeader("Content-Type", "application/json");
      res.status(401).json({
        error: `Unauthorized.`
      });
    }
  })
  .catch((error) => {
    console.log(error)
  });
  }
  else {
    res.setHeader("Content-Type", "application/json");
    res.status(401).json({
      error: `Unauthorized.`
    });
  }
})


router.post('/', function(req,res,next) {
  if (req.body.api_key) {
    let inputKey = req.body.api_key
    User.findOne({
      where: {
        api_key: inputKey
      }
    }).then(user => {
      if (user) {
        const findOrCreateCityData = City.getCityData(req.body.location)
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
                CitySteady.createSteadyData(city[0]["dataValues"],city[0]["dataValues"]["id"])
                  .then(stuff => {
                    // eval(pry.it)
                  })
                  .catch((error) => {
                    console.log(error)
                  });

                const cityName = city[0]["dataValues"]["name"] + ', ' + city[0]["dataValues"]["state"]
                CityCurrent.createCurrentData(city[0]["dataValues"],city[0]["dataValues"]["id"])
                  .then(cityCurrent => {
                    UserCity.create({
                      cityName: cityName,
                      CityId: city[0]["dataValues"]["id"],
                      UserId: user["dataValues"]["id"],
                      CityCurrentId: cityCurrent["dataValues"]["id"]
                    })
                    .then(data => {
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
          res.status(401).json({
            error: `Unauthorized.`
          });
        }
      })
      .catch((error) => {
        console.log(error)
      });
  }
  else {
    res.setHeader("Content-Type", "application/json");
    res.status(401).json({
      error: `Unauthorized.`
    });
  }
})

router.delete('/', function(req,res,next) {
  if (req.body.api_key) {
    let inputKey = req.body.api_key
    User.findOne({
      where: {
        api_key: inputKey
      }
    }).then(user => {
      if (user) {
        const findOrCreateCityData = City.getCityData(req.body.location)
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
        res.status(401).json({
          error: `Unauthorized.`
        });
      }
    })
    .catch((error) => {
      console.log(error)
    });
  }
  else {
    res.setHeader("Content-Type", "application/json");
    res.status(401).json({
      error: `Unauthorized.`
    });
  }
})


module.exports = router;


module.exports = router;
