const video = document.getElementById("video");
const countdownEl = document.getElementById("countdown");
const counterEl = document.getElementById("counter");

const shutterOverlay = document.createElement("div");
shutterOverlay.style.position = "absolute";
shutterOverlay.style.top = "0";
shutterOverlay.style.left = "0";
shutterOverlay.style.width = "100%";
shutterOverlay.style.height = "100%";
shutterOverlay.style.background = "white";
shutterOverlay.style.opacity = "0";
shutterOverlay.style.transition = "opacity 0.2s ease-out";
document.body.appendChild(shutterOverlay);

const shutterSound = new Audio("shutter.mp3");
const countdownSound = new Audio("countdown.mp3");

const capturedPhotos = [];
let capturedCount = 0;

const isMobile = window.innerWidth <= 600;
const videoConstraints = {
    video: {
        facingMode: "user",
        width: isMobile ? { ideal: 480 } : { ideal: 640 },
        height: isMobile ? { ideal: 640 } : { ideal: 480 }
    }
};

navigator.mediaDevices.getUserMedia(videoConstraints)
    .then(stream => {
        video.srcObject = stream;
        video.play();
        startCaptureProcess();
    })
    .catch(err => console.error("Camera access denied", err));

function startCaptureProcess() {
    capturePhotoWithCountdown();
}

function capturePhotoWithCountdown() {
    if (capturedCount >= 3) {
        redirectToDownload();
        return;
    }

    let timeLeft = 2;
    countdownEl.textContent = timeLeft;
    counterEl.textContent = `${capturedCount}/3`;
    countdownSound.play();

    const countdownInterval = setInterval(() => {
        timeLeft--;
        countdownEl.textContent = timeLeft;
        countdownSound.play();

        if (timeLeft === 1) {
            triggerShutterAnimation();
        }

        if (timeLeft <= 1) {
            clearInterval(countdownInterval);
            capturePhoto();
        }
    }, 1000);
}

function capturePhoto() {
    const canvas = document.createElement("canvas");
    canvas.width = isMobile ? 480 : 640;
    canvas.height = isMobile ? 640 : 480;
    const ctx = canvas.getContext("2d");

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    capturedPhotos.push(canvas.toDataURL("image/png"));
    capturedCount++;
    counterEl.textContent = `${capturedCount}/3`;

    setTimeout(capturePhotoWithCountdown, 1000);
}

function triggerShutterAnimation() {
    shutterOverlay.style.opacity = "1";
    shutterSound.play();
    setTimeout(() => {
        shutterOverlay.style.opacity = "0";
    }, 100);
}

function redirectToDownload() {
    sessionStorage.setItem("capturedPhotos", JSON.stringify(capturedPhotos));
    window.location.href = "install.html";
}

document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && (e.key === "u" || e.key === "s" || e.key === "i" || e.key === "j")) {
        e.preventDefault();
    }
});
