const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const context = canvas.getContext('2d');

let currentFilter = 'none';
const heartSticker = new Image();
heartSticker.src = 'heart.png';  // Gambar hati, pastikan ada di folder project

// Akses kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Gagal mengakses kamera:", err);
    });

// Fungsi untuk mengatur filter sebelum mengambil foto
function setFilter(filter) {
    currentFilter = filter;
}

// Tangkap gambar dengan filter & stiker hati
captureButton.addEventListener('click', async () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Ambil data gambar
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    // Terapkan filter menggunakan Canvas API
    if (currentFilter === 'grayscale') {
        for (let i = 0; i < data.length; i += 4) {
            let avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = data[i + 1] = data[i + 2] = avg;
        }
    } else if (currentFilter === 'sepia') {
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i + 1], b = data[i + 2];
            data[i] = r * 0.393 + g * 0.769 + b * 0.189;
            data[i + 1] = r * 0.349 + g * 0.686 + b * 0.168;
            data[i + 2] = r * 0.272 + g * 0.534 + b * 0.131;
        }
    } else if (currentFilter === 'invert') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     
            data[i + 1] = 255 - data[i + 1]; 
            data[i + 2] = 255 - data[i + 2]; 
        }
    } else if (currentFilter === 'brightness') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * 1.5; 
            data[i + 1] = data[i + 1] * 1.5; 
            data[i + 2] = data[i + 2] * 1.5; 
        }
    }

    // Simpan perubahan filter ke canvas
    context.putImageData(imageData, 0, 0);

    // Deteksi wajah (Face Detection API)
    if ('FaceDetector' in window) {
        const faceDetector = new FaceDetector();
        const faces = await faceDetector.detect(video);
        
        faces.forEach(face => {
            const x = face.boundingBox.x;
            const y = face.boundingBox.y;
            const w = face.boundingBox.width;
            const h = face.boundingBox.height;

            // Gambar stiker hati di atas kedua mata
            context.drawImage(heartSticker, x + w * 0.2, y + h * 0.25, w * 0.2, h * 0.2);
            context.drawImage(heartSticker, x + w * 0.6, y + h * 0.25, w * 0.2, h * 0.2);
        });
    } else {
        console.warn('Face Detection API tidak didukung di browser ini.');
    }

    // Set hasil gambar untuk diunduh
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.style.display = 'block';
});

    
    // Ambil tanggal saat ini dalam format YYYYMMDD
const today = new Date();
const formattedDate = today.getFullYear().toString() + 
                      String(today.getMonth() + 1).padStart(2, '0') + 
                      String(today.getDate()).padStart(2, '0');

// Set nama file sesuai format: yourSelfie_YYYYMMDD.png
downloadLink.download = `yourSelfie_${formattedDate}.png`; 
downloadLink.href = canvas.toDataURL('image/png');
downloadLink.style.display = 'block';