function generateImageUrl() {
    const currentHour = new Date().getUTCHours().toString().padStart(2, '0'); // Hour in UTC
    // For the rest of the placeholder calculation, assuming you want it at 10-minute intervals (as the placeholder suggests)
    const minutes = Math.floor(new Date().getUTCMinutes() / 10) * 10;
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Format as '00', '10', '20', etc.

    const url = `https://www.data.jma.go.jp/mscweb/data/himawari/img/aus/aus_b13_${currentHour}${formattedMinutes}.jpg`;

    return url;
}

const AusImage = generateImageUrl();

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
            url: AusImage,
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
