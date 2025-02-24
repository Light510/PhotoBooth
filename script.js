const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const context = canvas.getContext('2d');

let currentFilter = 'none';
const capturedPhotos = [];
const maxPhotos = 3;
const captureInterval = 3000; // Timer antar foto (2 detik)

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

// Fungsi menangkap foto dengan efek filter
function capturePhoto() {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
    const tempContext = tempCanvas.getContext('2d');

    tempContext.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

    let imageData = tempContext.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    let data = imageData.data;

    // Terapkan filter
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
            data[i] = Math.min(data[i] * 1.5, 255);
            data[i + 1] = Math.min(data[i + 1] * 1.5, 255);
            data[i + 2] = Math.min(data[i + 2] * 1.5, 255);
        }
    }

    tempContext.putImageData(imageData, 0, 0);

    return tempCanvas.toDataURL('image/png');
}

// Fungsi untuk mengambil 3 foto otomatis dengan interval
function startAutoCapture() {
    capturedPhotos.length = 0; // Reset foto lama
    let count = 0;

    function takePhoto() {
        if (count < maxPhotos) {
            capturedPhotos.push(capturePhoto());
            count++;
            if (count < maxPhotos) {
                setTimeout(takePhoto, captureInterval);
            } else {
                createCollage();
            }
        }
    }

    takePhoto();
}

// Fungsi membuat kolase dari 3 foto
function createCollage() {
    if (capturedPhotos.length === 0) return;

    const photoWidth = video.videoWidth;
    const photoHeight = video.videoHeight;
    const spacing = 10;
    const collageHeight = (photoHeight * maxPhotos) + (spacing * (maxPhotos - 1));

    canvas.width = photoWidth;
    canvas.height = collageHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);

    capturedPhotos.forEach((photo, index) => {
        const img = new Image();
        img.src = photo;
        img.onload = () => {
            context.drawImage(img, 0, index * (photoHeight + spacing), photoWidth, photoHeight);
            
            // Setelah semua gambar digambar, aktifkan tombol download
            if (index === capturedPhotos.length - 1) {
                setTimeout(() => {
                    downloadLink.href = canvas.toDataURL('image/png');
                    downloadLink.style.display = 'block';
                }, 500);
            }
        };
    });
}

// Event listener untuk tombol capture
captureButton.addEventListener('click', startAutoCapture);
