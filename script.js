const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const captureButton = document.getElementById('capture');
const downloadLink = document.getElementById('download');
const context = canvas.getContext('2d');

// Akses kamera
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
    })
    .catch(err => {
        console.error("Gagal mengakses kamera:", err);
    });

// Tangkap gambar dari video
captureButton.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Konversi canvas ke gambar dan atur sebagai link unduhan
    downloadLink.href = canvas.toDataURL('image/png');
    downloadLink.style.display = 'block';
});
