const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const context = canvas.getContext('2d');
const countdownText = document.getElementById('countdown');
const rollCanvas = document.createElement('canvas');
const rollContext = rollCanvas.getContext('2d');

let currentFilter = 'none';
const heartSticker = new Image();
heartSticker.src = 'heart.png';  // Pastikan gambar ada di folder proyek

let capturedImages = []; // Menyimpan 3 foto untuk digabungkan

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

// Fungsi untuk countdown sebelum foto diambil
function startCountdown(callback) {
    let count = 3;
    countdownText.innerText = count;
    countdownText.style.display = 'block';

    let countdownInterval = setInterval(() => {
        count--;
        if (count === 0) {
            countdownText.innerText = "Klik!";
        } else {
            countdownText.innerText = count;
        }

        if (count < 0) {
            clearInterval(countdownInterval);
            countdownText.style.display = 'none';
            callback();
        }
    }, 1000);
}

// Fungsi menangkap gambar
async function captureImage() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Ambil data gambar
    let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
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
    }

    context.putImageData(imageData, 0, 0);

    // Deteksi wajah dan tambahkan stiker hati
    if ('FaceDetector' in window) {
        const faceDetector = new FaceDetector();
        const faces = await faceDetector.detect(video);
        
        faces.forEach(face => {
            const x = face.boundingBox.x;
            const y = face.boundingBox.y;
            const w = face.boundingBox.width;
            const h = face.boundingBox.height;

            context.drawImage(heartSticker, x + w * 0.2, y + h * 0.25, w * 0.2, h * 0.2);
            context.drawImage(heartSticker, x + w * 0.6, y + h * 0.25, w * 0.2, h * 0.2);
        });
    }

    // Simpan gambar ke dalam array
    capturedImages.push(canvas.toDataURL('image/png'));

    if (capturedImages.length === 3) {
        mergePhotos();
    }
}

// Fungsi untuk menggabungkan 3 foto menjadi 1 roll panjang
function mergePhotos() {
    rollCanvas.width = canvas.width;
    rollCanvas.height = canvas.height * 3;

    // Ganti warna pinggiran roll sesuai pilihan
    rollContext.fillStyle = selectedBorderColor;
    rollContext.fillRect(0, 0, rollCanvas.width, rollCanvas.height);

    // Tempelkan 3 foto ke dalam roll panjang
    capturedImages.forEach((imgSrc, index) => {
        let img = new Image();
        img.src = imgSrc;
        img.onload = () => {
            rollContext.drawImage(img, 0, index * canvas.height, canvas.width, canvas.height);
            if (index === 2) {
                downloadRoll();
            }
        };
    });

    // Reset array setelah penggabungan selesai
    capturedImages = [];
}

// Fungsi mengunduh hasil foto dalam format roll
function downloadRoll() {
    const today = new Date();
    const formattedDate = today.getFullYear().toString() + 
                          String(today.getMonth() + 1).padStart(2, '0') + 
                          String(today.getDate()).padStart(2, '0');

    downloadLink.href = rollCanvas.toDataURL('image/png');
    downloadLink.download = `yourSelfie_${formattedDate}.png`;
    downloadLink.style.display = 'block';
}

// Pilihan warna pinggiran roll
let selectedBorderColor = '#000000'; // Default warna hitam
document.getElementById('border-color').addEventListener('change', (e) => {
    selectedBorderColor = e.target.value;
});

// Event listener untuk tombol ambil foto
captureButton.addEventListener('click', () => {
    if (capturedImages.length < 3) {
        startCountdown(captureImage);
    }
});
