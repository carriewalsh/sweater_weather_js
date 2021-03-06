# sweater_weather_js
by Carrie Walsh

Deployed site: https://lit-meadow-10610.herokuapp.com/

This solo project is a remake of the Ruby project Sweater Weather: https://github.com/carriewalsh/sweater_weather. It is an API that provides weather data for a yet-to-be-made weather app. The fifty most populous cities are seeded and every time a new city is searched (whether in a forecast or added as a favorite) that becomes a new data point.

There are two ways to get forecast and favorites:
- '/forecast' and '/favorites' make API calls to fetch the information
- '/dbforecast' and '/dbfavorites' - though implementation is incomplete, uses CitySteadies, CityCurrents, and CityDays that are saved in the database.


## Endpoints

### GET `/api/v1/forecast?location=CITYNAME`

request:
```javascript
Content-Type: application/json
Accept: application/json

body:
{
  "api_key": "jgn983hy48thw9begh98h4539h4"
}
```
response:
```javascript
{
  "city": {
  "id": 64,
  "name": "Newport",
  "state": "OR",
  "country": "USA",
  "latitude": "44.6367836",
  "longitude": "-124.0534505",
  "updatedAt": "2019-07-11T17:31:51.480Z",
  "createdAt": "2019-07-11T17:31:51.480Z"
},
"current": {
  "temp": 63.68,
  "apparent": 63.98,
  "icon": "partly-cloudy-day",
  "cloud_cover": 0.87,
  "humidity": 0.9,
  "visibility": 8.708,
  "uv_index": 4,
  "wind_speed": 3.89,
  "wind_direction": 248,
  "summary": "Mostly Cloudy"
},
"steadies": {
  "sunrise": "5:41AM",
  "sunset": "9:01PM",
  "moonPhase": 0.669,
  "phaseDescription": "Waxing gibbous",
  "phaseIcon": "cw_waxing_gibbous"
},
"forecast": {
  "1": {
    "high": 65.18,
    "low": 57.02,
    "icon": "fog",
    "precipProbability": 0.13,
    "summary": "Foggy in the morning."
  },
  "2": {
    "high": 64.99,
    "low": 56.72,
    "icon": "partly-cloudy-day",
    "precipProbability": 0.05,
    "summary": "Mostly cloudy throughout the day."
  },
  "3": {
    "high": 64.36,
    "low": 55.06,
    "icon": "partly-cloudy-day",
    "precipProbability": 0.07,
    "summary": "Mostly cloudy throughout the day."
  },
  "4": {
    "high": 63.34,
    "low": 57.13,
    "icon": "partly-cloudy-day",
    "precipProbability": 0.05,
    "summary": "Mostly cloudy throughout the day."
  },
  "5": {
    "high": 66.34,
    "low": 55.26,
    "icon": "cloudy",
    "precipProbability": 0.06,
    "summary": "Mostly cloudy throughout the day."
  },
  "6": {
    "high": 66.05,
    "low": 52.3,
    "icon": "clear-day",
    "precipProbability": 0.01,
    "summary": "Partly cloudy throughout the day."
  },
  "7": {
    "high": 65.81,
    "low": 56.78,
    "icon": "cloudy",
    "precipProbability": 0.07,
    "summary": "Overcast throughout the day."
  },
  "8": {
    "high": 63,
    "low": 55.21,
    "icon": "partly-cloudy-day",
    "precipProbability": 0.23,
    "summary": "Mostly cloudy throughout the day."
    }
  }
}
```
### POST `/api/v1/users?email=EXAMPLE@EXAMPLE.COM&password=PASSWORD&password_confirmation=PASSWORD`

request:
```javascript
Content-Type: application/json
Accept: application/json

body:
{
  "email": "my_email@example.com",
  "password": "password"
  "password_confirmation": "password"
}
```
response:
```javascript
body:
{
  "message": "email@example.com has been created",
  "api_key": "jgn983hy48thw9begh98h4539h4"
}
```
### POST `/api/v1/sessions?user[email]=EXAMPLE@EXAMPLE.COM&user[password]=PASSWORD`

request:
```javascript
Content-Type: application/json
Accept: application/json
body:
{
  "email": "my_email@example.com",
  "password": "password"
}
```
response:
```javascript
body:
{
  "api_key": "jgn983hy48thw9begh98h4539h4",
}
```
### POST `/api/v1/favorites?api_key=USER_API_KEY&location=CITY_NAME`

request:
```javascript
Content-Type: application/json
Accept: application/json

body:
{
  "location": "Denver, CO",
  "api_key": "jgn983hy48thw9begh98h4539h4"
}
```
response:
```javascript
body:
{
  "message": "Denver, CO has been added to your favorites",
}
```
### GET `/api/v1/favorites?api_key=USER_API_KEY`

request:
```javascript
Content-Type: application/json
Accept: application/json
body:

{
  "api_key": "jgn983hy48thw9begh98h4539h4"
}
```
response:
```javascript
body:
[
  {
    "id": 14,
    "cityName": "Salem, OR",
    "UserId": 6,
    "CityId": 2,
    "CityCurrentId": 16,
    "createdAt": "2019-07-11T17:26:06.404Z",
    "updatedAt": "2019-07-11T17:26:06.404Z",
    "CityCurrent": {
      "id": 16,
      "temp": 70.72,
      "apparent": 70.72,
      "icon": "partly-cloudy-day",
      "cloudCover": 0.69,
      "humidity": 0.65,
      "visibility": 10,
      "uvIndex": 4,
      "windSpeed": 0.85,
      "windDirection": 327,
      "summary": "Mostly Cloudy",
      "CityId": 2,
      "createdAt": "2019-07-11T17:26:06.362Z",
      "updatedAt": "2019-07-11T17:26:06.362Z"
    }
  }
]
```
### DELETE `/api/v1/favorites?api_key=USER_API_KEY&location=CITY_NAME`

request:
```javascript
Content-Type: application/json
Accept: application/json

body:
{
  "location": "Denver, CO",
  "api_key": "jgn983hy48thw9begh98h4539h4"
}
```
response:
```javascript
{
    "message": "phoenix has been removed from your favorites"
}
```
## Getting Started

### Requirements

Requires Node 12.1.0 and Express 4.16.1

### Setup

Clone down the repo and package install:

`$ git clone https://github.com/carriewalsh/sweater_weather_js.git`
`$ npm install`

Set up the database:

`$ npx sequelize db:create`
`$ npx sequelize db:migrate`
`$ npx sequelize db:seed`

Set up dotenv:

`$ npx install dotenv`

`touch .env`
`touch .gitignore`

add `.env` to your `.gitignore` file

### API Keys

You will need to set up 2 API keys and add them to .env:

- DarkSky defined within `[DARK_SKY_SECRET_KEY]`
- Google Geocoding defined within `[GOOGLE_SECRET_KEY]`

## Schema

![Sweater Weather JS Schema](/schema.png?raw=true "Sweater Weather JS Schema")

## Author

At the time of this project, I have just started week 2 Mod 4 at Turing School of Software & Design.

This was a tough project going from a language I know well, Ruby, to a new language. The biggest struggle was with promises and how to access the data that feels 'trapped' in that promise. I also found myself wanting to make simple ActiveRecord calls that become promises when using Sequelize. Originally, I wanted to save all forecast data to the database, but currently, full functionality makes a API call for each request.

My learning is reflected in my blog: https://medium.com/@carriewalsh/so-you-want-to-learn-a-new-language-a8d050a92fbc?postPublishedType=initial
