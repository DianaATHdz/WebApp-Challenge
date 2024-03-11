const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENWEATHER_API_KEY = "0eebd1fcf852d29ca0340c5c451d4c9a";
const RESERVAMOS_API_URL = "https://search.reservamos.mx/api/v2/places";
const OPENWEATHER_API_URL = "https://api.openweathermap.org/data/2.5/forecast";

app.use(express.static(path.join(__dirname, 'public')));
app.get('/weather', async (req, res) => {
    const city = req.query.city;
    if (!city) {
        return res.status(400).send("Provide a city in the parameter.");
    }

    try {
        const { data: places } = await axios.get(RESERVAMOS_API_URL, { params: { q: city } });

        const cityPlace = places.find(place => place.result_type === "city");
        if (!cityPlace) {
            return res.status(404).send("City not found.");
        }

        const { lat, long } = cityPlace;
        const { data: weatherData } = await axios.get(OPENWEATHER_API_URL, {
            params: {
                lat,
                lon: long,
                appid: OPENWEATHER_API_KEY,
                units: "metric"
            }
        });

        const forecast = weatherData.list.map(entry => ({
            date: entry.dt_txt,
            temperature: {
                min: entry.main.temp_min,
                max: entry.main.temp_max
            }
        }));

        res.json(forecast);
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 
