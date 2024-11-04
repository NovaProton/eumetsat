@@ -1,18 +1,49 @@
const fs = require('fs');
const getCurrentHimawariImageUrl = () => {
    const now = new Date();
    now.setUTCMinutes(Math.floor(now.getUTCMinutes() / 30) * 30); // Always round down to the nearest 10 mins
    now.setUTCMinutes(now.getUTCMinutes() - 30); // Subtract 30 minutes
    now.setUTCSeconds(0);
    now.setUTCMilliseconds(0);

    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hour = String(now.getUTCHours()).padStart(2, '0');
    const minute = String(now.getUTCMinutes()).padStart(2, '0');
    // Load the intervals from the UTC10MinIntervals.txt file
    const intervals = fs.readFileSync('UTC10MinIntervals.txt', 'utf-8')
        .split('\n')
        .filter(Boolean);
    // Extract the current hour and minute
    const currentHour = String(now.getUTCHours()).padStart(2, '0');
    const currentMinute = String(now.getUTCMinutes()).padStart(2, '0');
    // Find the largest interval less than or equal to the current time
    let closestInterval = null;
    for (let interval of intervals) {
        const [intervalHour, intervalMinute] = interval.split(':');
        if (
            intervalHour < currentHour ||
            (intervalHour === currentHour && intervalMinute <= currentMinute)
        ) {
            closestInterval = interval;
        } else {
            break; // Stop as soon as we exceed the current time
        }
    }

    if (!closestInterval) {
        // If no closest interval is found, default to the last interval of the previous day
        closestInterval = intervals[intervals.length - 1];
    }
    const [hour, minute] = closestInterval.split(':');
    return `https://www.data.jma.go.jp/mscweb/data/himawari/img/aus/aus_b13_${hour}${minute}.jpg`;
};

// Set interval to update the URL every 10 minutes
setInterval(() => {
    const HIMAWARI_URL = getCurrentHimawariImageUrl();
    console.log('Updated URL:', HIMAWARI_URL);
}, 10 * 60 * 1000);
const HIMAWARI_URL = getCurrentHimawariImageUrl();

// Existing code here
const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;

// URLs for the two images
const LOCAL_EUMETSAT_URL = 'https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&TRANSPARENT=True&WIDTH=488&HEIGHT=487&BBOX=-62.8,-15.9,51.9,71.8&FORMAT=image/jpeg&LAYERS=mtg_fd:rgb_geocolour';
const WORLD_EUMETSAT_URL = 'https://view.eumetsat.int/geoserver/ows?access_token=311845d4-6c48-3832-8bed-546ef3284087&service=WMS&request=GetMap&version=1.3.0&layers=mtg_fd:rgb_geocolour&styles=&format=image/jpeg&crs=EPSG:4326&bbox=-77.3506393432617,-81.2777938842773,77.3563919067383,81.2807235717773&width=800&height=761';
// const HIMAWARI_URL = 'https://www.himawari8.nict.go.jp/img/D531106/latest.jpg'; // Replace with the latest available Himawari URL if needed


// Route to serve the local image
app.get('/local', async (req, res) => {
    try {
        const response = await axios({
            url: LOCAL_EUMETSAT_URL,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the local image:', error);
        res.status(500).send('Error fetching the local image');
    }
});

// Route to serve the world image
app.get('/world', async (req, res) => {
    try {
        const response = await axios({
            url: WORLD_EUMETSAT_URL,
            method: 'GET',
            responseType: 'arraybuffer'
        });
        
        res.setHeader('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the world image:', error);
        res.status(500).send('Error fetching the world image');
    }
});

app.get('/aus', async (req, res) => {
    try {
        const response = await axios({
            url: HIMAWARI_URL_1,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error("Error fetching Himawari-8 image:", error);
        res.status(500).send("Error fetching Himawari-8 image");
    }
});

app.get('/worldjp', async (req, res) => {
    try {
        const response = await axios({
            url: HIMAWARI_URL_2,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error("Error fetching Himawari-8 image:", error);
        res.status(500).send("Error fetching Himawari-8 image");
    }
});

// Home route that loads both images
app.get('/', (req, res) => {
    res.send(`
        <html>
        <head>
            <title>EUMETSAT Images</title>
        </head>
        <body>
            <h1>EUMETSAT Images</h1>
            <h2>Local Image</h2>
            <img src="/local" alt="Local EUMETSAT Image" style="max-width: 100%;">
            <h2>World Image</h2>
            <img src="/world" alt="World EUMETSAT Image" style="max-width: 100%;">
            <br>
            <p>Source: <a href="https://www.eumetsat.int/">EUMETSAT</a></p>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
