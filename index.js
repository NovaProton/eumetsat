const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio'); // Import cheerio
const app = express();

const PORT = process.env.PORT || 3000;

// Base URL for resolving relative image paths from JMA
const JMA_BASE_URL = 'https://www.data.jma.go.jp';
// URL of the JMA page displaying the satellite images
const JMA_PAGE_URL = 'https://www.data.jma.go.jp/mscweb/data/himawari/sat_img.php?area=fd_';

// URLs for the EUMETSAT images (kept from original code)
const LOCAL_EUMETSAT_URL = 'https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&TRANSPARENT=True&WIDTH=488&HEIGHT=487&BBOX=-62.8,-15.9,51.9,71.8&FORMAT=image/jpeg&LAYERS=mtg_fd:rgb_geocolour';
const WORLD_EUMETSAT_URL = 'https://view.eumetsat.int/geoserver/ows?access_token=311845d4-6c48-3832-8bed-546ef3284087&service=WMS&request=GetMap&version=1.3.0&layers=mtg_fd:rgb_geocolour&styles=&format=image/jpeg&crs=EPSG:4326&bbox=-77.3506393432617,-81.2777938842773,77.3563919067383,81.2807235717773&width=500&height=500';

// --- EUMETSAT Routes (from original code) ---

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
        console.error('Error fetching the local EUMETSAT image:', error.message);
        res.status(500).send('Error fetching the local EUMETSAT image');
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
        console.error('Error fetching the world EUMETSAT image:', error.message);
        res.status(500).send('Error fetching the world EUMETSAT image');
    }
});

// --- JMA Himawari Route ---

// Route to display the latest JMA Himawari B01 and B13 images
app.get('/aus', async (req, res) => {
    try {
        // 1. Fetch the HTML of the JMA page
        const pageResponse = await axios.get(JMA_PAGE_URL);
        const html = pageResponse.data;

        // 2. Load the HTML into cheerio
        const $ = cheerio.load(html);

        // 3. Find the image elements and extract their src URLs
        //    We need to inspect the JMA page's HTML structure to find reliable selectors.
        //    Let's assume the images are identifiable by containing '/B01/' and '/B13/'
        //    in their src and being within the main content area.
        //    *Update these selectors if the JMA page structure changes.*
        let b01_imageUrl = null;
        let b13_imageUrl = null;

        // Find images whose src contains the band identifier for the full disk (fd) area
        $('img[src*="/fd_/B01/"]').each((i, element) => {
             // Select the first one found (assuming it's the main one)
             if (!b01_imageUrl) {
                 b01_imageUrl = $(element).attr('src');
             }
        });

         $('img[src*="/fd_/B13/"]').each((i, element) => {
             // Select the first one found
             if (!b13_imageUrl) {
                 b13_imageUrl = $(element).attr('src');
             }
        });

        // Check if URLs were found
        if (!b01_imageUrl || !b13_imageUrl) {
            throw new Error('Could not find B01 or B13 image URLs on the JMA page. Selectors might need updating.');
        }

        // 4. Make URLs absolute if they are relative
        if (b01_imageUrl.startsWith('/')) {
            b01_imageUrl = JMA_BASE_URL + b01_imageUrl;
        }
         if (b13_imageUrl.startsWith('/')) {
            b13_imageUrl = JMA_BASE_URL + b13_imageUrl;
        }

        console.log("Found B01 URL:", b01_imageUrl);
        console.log("Found B13 URL:", b13_imageUrl);

        // 5. Send an HTML response displaying the images
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Latest Himawari Images (B01 & B13)</title>
                <style>
                    body { font-family: sans-serif; }
                    img { max-width: 90%; height: auto; border: 1px solid #ccc; margin-bottom: 20px;}
                    h2 { margin-top: 30px; }
                </style>
            </head>
            <body>
                <h1>Latest Himawari Images (Full Disk)</h1>
                <p>Images scraped from <a href="${JMA_PAGE_URL}" target="_blank">${JMA_PAGE_URL}</a></p>

                <h2>Band 01 (Visible)</h2>
                <img src="${b01_imageUrl}" alt="Latest Himawari B01 Image">

                <h2>Band 13 (Infrared)</h2>
                <img src="${b13_imageUrl}" alt="Latest Himawari B13 Image">

                <p>Source: <a href="https://www.jma.go.jp/jma/jma-eng/satellite/" target="_blank">Japan Meteorological Agency (JMA)</a></p>
            </body>
            </html>
        `);

    } catch (error) {
        console.error('Error fetching or parsing JMA Himawari images:', error.message);
        res.status(500).send(`Error fetching JMA Himawari images: ${error.message}`);
    }
});


// --- Home Route (modified to include link to /aus) ---
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Satellite Images</title>
             <style> body { font-family: sans-serif; } img { max-width: 90%; height: auto; border: 1px solid #ccc;} </style>
        </head>
        <body>
            <h1>Satellite Images</h1>

            <h2>EUMETSAT - Local</h2>
            <img src="/local" alt="Local EUMETSAT Image">
            <p>Source: <a href="https://www.eumetsat.int/">EUMETSAT</a></p>

            <h2>EUMETSAT - World</h2>
            <img src="/world" alt="World EUMETSAT Image">
            <p>Source: <a href="https://www.eumetsat.int/">EUMETSAT</a></p>

            <h2>JMA Himawari</h2>
            <p><a href="/aus">View Latest Himawari Full Disk Images (B01 & B13)</a></p>
             <p>Source: <a href="https://www.jma.go.jp/jma/jma-eng/satellite/" target="_blank">Japan Meteorological Agency (JMA)</a></p>

        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Access EUMETSAT images at http://localhost:${PORT}/`);
    console.log(`Access Himawari images at http://localhost:${PORT}/aus`);
});
