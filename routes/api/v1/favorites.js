var express = require('express');
var router = express.Router();
var fetch = require('node-fetch')
var pry = require('pryjs');
require('dotenv').config()

var User = require('../../../models').User;
var City = require('../../../models').City;
var UserCity = require('../../../models').UserCity;


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


router.get("/", function(req,res,next) {
  let inputKey = req.body.api_key
  User.findOne({
    where: {
      api_key: inputKey
    }
  }).then(user => {
    if (user) {
      return UserCity.findAll({
        where: {
          userId: user["dataValues"]["id"]
        }
      })
      .then(data => {
        res.setHeader("Content-Type", "application/json");
        res.status(200).send({
          favorites: data
        })
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


router.post('/', function(req,res,next) {
  let inputKey = req.body.api_key
  // get the city from the request - find or create it
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
          UserCity.create({
            cityId: city.id,
            userId: user["dataValues"]["id"]
            // cityCurrent?
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
