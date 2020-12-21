const { response, request } = require('express');
const express = require('express');
const Datastore = require('nedb');
const fetch = require('node-fetch');
require('dotenv').config();

// console.log(process.env);

const app = express();
// for deploy at cloud Glitch
const port = process.env.PORT || 4000;

app.listen(port, () => {console.log(`Starting server at ${port}`);
});

// npm install -g nodemon to no need to node index.js every time you change code
app.use(express.static('public'));
app.use(express.json({ limit: '1mb'}));


const database = new Datastore('database.db');
database.loadDatabase();

app.get('/api', (request, response)=> {
   
    database.find({}, (err, data) => {
        if (err) {
            response.end();
            return;
        }
       
        response.json(data);
       
    });
});


app.post('/api', (request, response) => {
    console.log('I got a request!');
    // console.log(request.body);
    const data = request.body;
    const timestamp = Date.now();
    data.timestamp = timestamp;
    // database.push(data);
    database.insert(data);
    console.log(database)
    // response.json(data) ili  =>
    response.json({
        status: 'success',
        timestamp: timestamp,
        latitude: data.lat,
        longitude: data.lon      
    });

});

app.get('/weather/:latlon', async (request, response)=> {
    console.log('searching for weather report')
    console.log(request.params);
    const latlon = request.params.latlon.split(',');
    console.log(latlon);
    const lat = latlon[0];
    const lon = latlon[1];
    console.log(lat, lon);

    const api_key = process.env.API_KEY;
    
    // const api_url =  `https://api.openweathermap.org/data/2.5/weather?&units=metric&lat=45.24&lon=19.78&appid=af0519be771c2e101efe196cc58eb510`;

    const weather_url =  `https://api.openweathermap.org/data/2.5/weather?&units=metric&lat=${lat}&lon=${lon}&appid=${api_key}`;
    const weather_response = await fetch(weather_url);
    const weather_data = await weather_response.json();

    const aq_url =  `https://api.openaq.org/v1/latest?coordinates=${lat},${lon}&radius=5000`;
   
    const aq_response = await fetch(aq_url);
    const aq_data = await aq_response.json();

    const data = {
        weather: weather_data,
        air_quality: aq_data
    };
   
    response.json(data);
   
});
setInterval(async () => {
    await fetch('https://check-in-and-weather.glitch.me/').then(console.log('Pinged! Wait another 4 minutes...'))
}, 24000);
