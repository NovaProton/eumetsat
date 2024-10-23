const axios = require('axios');
const express = require('express');
const app = express();

app.get('/proxy', async (req, res) => {
    try {
        const response = await axios.get('https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&TRANSPARENT=True&WIDTH=488&HEIGHT=487&BBOX=-62.8,-15.9,51.9,71.8&FORMAT=image/jpeg&LAYERS=mtg_fd:rgb_geocolour', { responseType: 'stream' });
        response.data.pipe(res);
    } catch (error) {
        res.status(500).send('Error fetching data');
    }
});

app.listen(3000, () => console.log('Proxy running on port 3000'));
