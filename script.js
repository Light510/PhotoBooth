const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const rollCanvas = document.getElementById('rollCanvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const downloadRoll = document.getElementById('downloadRoll');
const context = canvas.getContext('2d');
const rollContext = rollCanvas.getContext('2d');
const countdownText = document.getElementById('countdown');
const rollColorPicker = document.getElementById('rollColor');

let currentFilter = 'none';
let photoRoll = []; // Menyimpan foto untuk roll film

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Gagal mengakses kamera:", err);
    });

function setFilter(filter) {
    currentFilter = filter;
}

function applyFilter(imageData) {
    let data = imageData.data;

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
}

// Fungsi countdown sebelum mengambil foto
function startCountdown(callback) {
    let count = 3;
    countdownText.innerText = count;

    let interval = setInterval(() => {
        count--;
        countdownText.innerText = count;
        if (count === 0) {
            clearInterval(interval);
            countdownText.innerText = "";
            callback();
        }
    }, 1000);
}

// Menangkap gambar & menambahkannya ke roll film
captureButton.addEventListener('click', () => {
    startCountdown(() => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        let imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        applyFilter(imageData);

        if (photoRoll.length < 3) {
            photoRoll.push(canvas.toDataURL('image/png'));
        }

        if (photoRoll.length === 3) {
            const scaleFactor = 0.87; // Mengecilkan foto menjadi 87% dari ukuran asli
            const spacing = 8; // Jarak antar foto
            const scaledWidth = canvas.width * scaleFactor;
            const scaledHeight = canvas.height * scaleFactor;

            rollCanvas.width = scaledWidth;
            rollCanvas.height = scaledHeight * 3 + spacing * 2; // 3 foto + 2x jarak antar foto

            rollContext.fillStyle = rollColorPicker.value;
            rollContext.fillRect(0, 0, rollCanvas.width, rollCanvas.height);

            photoRoll.forEach((photo, index) => {
                let img = new Image();
                img.src = photo;
                img.onload = () => {
                    let yPos = index * (scaledHeight + spacing);
                    rollContext.drawImage(img, 0, yPos, scaledWidth, scaledHeight);
                };
            });

            downloadRoll.href = rollCanvas.toDataURL('image/png');
            downloadRoll.style.display = 'block';
        }
    });
});
