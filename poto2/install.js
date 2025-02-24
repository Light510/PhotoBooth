const finalCanvas = document.getElementById("finalCanvas");
const ctx = finalCanvas.getContext("2d");
const downloadBtn = document.getElementById("download-btn");

let capturedPhotos = JSON.parse(sessionStorage.getItem("capturedPhotos")) || [];

if (capturedPhotos.length === 0) {
    console.error("No photos found in sessionStorage.");
}

const canvasWidth = 240;
const imageHeight = 160;
const spacing = 10;
const framePadding = 10;

// Tambahkan tinggi untuk background
const backgroundHeight = framePadding + (imageHeight + spacing) * Math.min(capturedPhotos.length, 3);

finalCanvas.width = canvasWidth;
finalCanvas.height = backgroundHeight;

capturedPhotos = capturedPhotos.slice(0, 3);

// Fungsi untuk memuat gambar dengan Promise
async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    });
}

console.log("Photos in sessionStorage:", sessionStorage.getItem("capturedPhotos"));
console.log("Parsed Photos:", capturedPhotos);

// Fungsi untuk menggambar kolase dengan background hitam.jpg
async function drawCollage() {
    try {
        // Load background hitam.jpg
        const background = await loadImage("hitam.jpg");
        ctx.clearRect(0, 0, finalCanvas.width, finalCanvas.height);
        ctx.drawImage(background, 0, 0, finalCanvas.width, finalCanvas.height);

        // Memuat dan menggambar setiap foto
        for (let index = 0; index < capturedPhotos.length; index++) {
            const img = await loadImage(capturedPhotos[index]);
            const x = framePadding;
            const y = framePadding + index * (imageHeight + spacing);
            ctx.drawImage(img, x, y, canvasWidth - 2 * framePadding, imageHeight);
        }
    } catch (error) {
        console.error("Error in drawCollage:", error);
    }
}

// Tombol download hasil foto
downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.href = finalCanvas.toDataURL("image/png");
    link.download = "Photosky.jpg";
    link.click();
});

// Inisialisasi gambar
async function init() {
    await drawCollage();
}
init();
