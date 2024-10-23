const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3000;
const EUMETSAT_URL = 'https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&TRANSPARENT=True&WIDTH=488&HEIGHT=487&BBOX=-62.8,-15.9,51.9,71.8&FORMAT=image/jpeg&LAYERS=mtg_fd:rgb_geocolour';

app.get('/image', async (req, res) => {
    try {
        const response = await axios({
            url: EUMETSAT_URL,
            method: 'GET',
            responseType: 'arraybuffer'
        });

        res.setHeader('Content-Type', 'image/jpeg');
        res.send(response.data);
    } catch (error) {
        console.error('Error fetching the image:', error);
        res.status(500).send('Error fetching the image');
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
