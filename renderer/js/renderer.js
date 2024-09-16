const form = document.querySelector('#img-form');
const img = document.querySelector('#img');
const outputPath = document.querySelector('#output-path');
const filename = document.querySelector('#filename');
const widthInput = document.querySelector('#width');
const heightInput = document.querySelector('#height');
let imgPath = null;

const loadImage = async (e) => {
    e.preventDefault();
    const filePath = await ipcRenderer.openFileDialog();
    // Get original image dimensions
    const img = new Image();
    img.src = filePath;
    img.onload = () => {
        widthInput.value = img.width;
        heightInput.value = img.height;
    }
    form.style.display = 'block';
    filename.innerText = path.basename(filePath);
    imgPath = filePath;
    outputPath.innerText = path.join(os.homedir, 'image-resizer');
}

const sendImage = async (e) => {
    e.preventDefault();
    const width = widthInput.value;
    const height = heightInput.value;
    if(!imgPath) {
        alertError('Please select an image file');
        return;
    }
    if(!width || !height) {
        alertError('Please enter the width and height');
        return;
    }
    // Send image to main process
    ipcRenderer.send('resize-image', { imgPath, width, height });
}

ipcRenderer.on('image:done', () => {
    alertSuccess(`Image resized successfully to ${widthInput.value}x${heightInput.value}`);
})

const alertError = (message) => {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'red',
            color: 'white',
            textAlign: 'center',
        }
    })
}

const alertSuccess = (message) => {
    Toastify.toast({
        text: message,
        duration: 3000,
        close: false,
        style: {
            background: 'green',
            color: 'white',
            textAlign: 'center',
        }
    })
}

img.addEventListener('click', loadImage);
form.addEventListener('submit', sendImage);