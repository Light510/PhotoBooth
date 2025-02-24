const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const context = canvas.getContext('2d');

let currentFilter = 'none';

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

// Tangkap gambar dengan filter
captureButton.addEventListener('click', () => {
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
            data[i] = 255 - data[i];     // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
        }
    } else if (currentFilter === 'brightness') {
        for (let i = 0; i < data.length; i += 4) {
            data[i] = data[i] * 1.5; // Red
            data[i + 1] = data[i + 1] * 1.5; // Green
            data[i + 2] = data[i + 2] * 1.5; // Blue
        }
    }

    // Simpan perubahan filter ke canvas
    context.putImageData(imageData, 0, 0);
    
    // Ambil tanggal saat ini dalam format YYYYMMDD
const today = new Date();
const formattedDate = today.getFullYear().toString() + 
                      String(today.getMonth() + 1).padStart(2, '0') + 
                      String(today.getDate()).padStart(2, '0');

// Set nama file sesuai format: yourSelfie_YYYYMMDD.png
downloadLink.download = `yourSelfie_${formattedDate}.png`; 
downloadLink.href = canvas.toDataURL('image/png');
downloadLink.style.display = 'block';

});
