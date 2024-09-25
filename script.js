// Create the QR code styling object with default settings
let qrCode = new QRCodeStyling({
    width: 300,
    height: 300,
    dotsOptions: {
        color: "#000000",
        type: "dots"
    },
    cornersSquareOptions: {
        type: "square"
    },
    qrOptions: {
        errorCorrectionLevel: 'L'
    }
});

// Function to update the QR code based on user input
const updateQRCode = () => {
    const qrText = document.getElementById('inputText').value;
    const qrCodeColor = document.getElementById('qrCodeColor').value;
    const dotStyle = document.getElementById('dotStyle').value;
    const eyeShape = document.getElementById('eyeShape').value;
    const qrSize = parseInt(document.getElementById('qrSize').value);
    const errorCorrection = document.getElementById('errorCorrection').value;
    const logoFile = document.getElementById('logoUpload').files[0];
    const customText = document.getElementById('customText').value;

    document.getElementById('qrCustomText').textContent = customText;

    const qrOptions = {
        data: qrText,
        width: qrSize,
        height: qrSize,
        dotsOptions: {
            color: qrCodeColor,
            type: dotStyle
        },
        cornersSquareOptions: {
            type: eyeShape
        },
        qrOptions: {
            errorCorrectionLevel: errorCorrection
        },
    };

    if (logoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            qrOptions.image = e.target.result;
            qrOptions.imageOptions = { crossOrigin: 'anonymous', margin: 5 };
            qrCode.update(qrOptions);
        };
        reader.readAsDataURL(logoFile);
    } else {
        qrCode.update(qrOptions);
    }

    // Clear and append the updated QR code to the DOM
    document.getElementById('qrCode').innerHTML = ""; // Clear any previous QR code
    qrCode.append(document.getElementById('qrCode')); // Append new QR code
};

// Attach event listeners to dynamically update the QR code when the user interacts with inputs
document.getElementById('inputText').addEventListener('input', updateQRCode);
document.getElementById('qrCodeColor').addEventListener('input', updateQRCode);
document.getElementById('dotStyle').addEventListener('change', updateQRCode);
document.getElementById('eyeShape').addEventListener('change', updateQRCode);
document.getElementById('qrSize').addEventListener('change', updateQRCode);
document.getElementById('errorCorrection').addEventListener('change', updateQRCode);
document.getElementById('logoUpload').addEventListener('change', updateQRCode);
document.getElementById('customText').addEventListener('input', updateQRCode);

// Attach event listener for downloading the QR code
document.getElementById('downloadQRCode').addEventListener('click', function() {
    qrCode.download({ name: "qrcode", extension: "png" });
});

// QR Code Scanner using Camera
document.getElementById('startScan').addEventListener('click', function() {
    const video = document.getElementById('preview');
    video.style.display = 'block';

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
            .then(function(stream) {
                video.srcObject = stream;
                video.play();
            });

        const qrScanner = new QrScanner(video, function(result) {
            document.getElementById('resultURL').textContent = result;
            video.srcObject.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
        });
    } else {
        alert('Camera not supported in this browser.');
    }
});

// QR Code Scanner using File Upload
document.getElementById('uploadQR').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const imageData = e.target.result;
        const img = new Image();
        img.src = imageData;
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const qrCodeData = jsQR(imageData.data, canvas.width, canvas.height);

            if (qrCodeData) {
                document.getElementById('resultURL').textContent = qrCodeData.data;
            } else {
                alert("No QR code found in the image.");
            }
        };
    };

    if (file) {
        reader.readAsDataURL(file);
    }
});
