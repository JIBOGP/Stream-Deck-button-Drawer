export function blackAndWhite(canvas, pr = 0.299, pg = 0.587, pb = 0.114, invert = false) {
    console.log("blackAndWhite");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const gray = pr * r + pg * g + pb * b;
        data[i] = data[i + 1] = data[i + 2] = invert ? 255 - gray : gray;
    }

    ctx.putImageData(imageData, 0, 0);
}

export function invertColors(canvas) {
    console.log("invertColors");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];  
        data[i + 1] = 255 - data[i + 1]; 
        data[i + 2] = 255 - data[i + 2];
    }

    ctx.putImageData(imageData, 0, 0);
}


export function sepia(canvas) {
    console.log("sepia");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        data[i] = r * 0.393 + g * 0.769 + b * 0.189;
        data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
        data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131; 
    }

    ctx.putImageData(imageData, 0, 0);
}

export function simpleBlur(canvas) {
    console.log("simpleBlur");
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const tempData = new Uint8ClampedArray(data);

    const width = canvas.width;
    const height = canvas.height;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            let r = 0, g = 0, b = 0, count = 0;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    const nx = x + dx;
                    const ny = y + dy;
                    // Comprobar límites
                    if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                        const neighborIndex = (ny * width + nx) * 4;
                        r += tempData[neighborIndex];
                        g += tempData[neighborIndex + 1];
                        b += tempData[neighborIndex + 2];
                        count++;
                    }
                }
            }

            data[index] = r / count;
            data[index + 1] = g / count;
            data[index + 2] = b / count;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}
