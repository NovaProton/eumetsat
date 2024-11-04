// Step 1: Function to replace placeholders with actual values
function generateImageUrl() {
    const currentHour = new Date().getUTCHours().toString().padStart(2, '0'); // Hour in UTC
    // For the rest of the placeholder calculation, assuming you want it at 10-minute intervals (as the placeholder suggests)
    const minutes = Math.floor(new Date().getUTCMinutes() / 10) * 10;
    const formattedMinutes = minutes.toString().padStart(2, '0'); // Format as '00', '10', '20', etc.

    const url = `https://www.data.jma.go.jp/mscweb/data/himawari/img/aus/aus_b13_${currentHour}${formattedMinutes}.jpg`;

    return url;
}

const AusImage = generateImageUrl();

// Step 2: Create an image element and set the src attribute
function displayImage() {
    const imageUrl = generateImageUrl();
    const imgElement = document.createElement('img');
    imgElement.src = imageUrl;
    imgElement.alt = 'Himawari Satellite Image';
    document.body.appendChild(imgElement);
}

// Call the function to display the image
displayImage();
