// Create the QR code styling object with default settings
let qrCode = new QRCodeStyling({
    width: 300, // Initial size, will be updated
    height: 300,
    type: 'svg', // Use SVG for better scaling
    dotsOptions: {
        color: "#000000",
        type: "dots" // Default dot style
    },
    cornersSquareOptions: {
        type: "square", // Default corner style
         color: "#000000"
    },
     cornersDotOptions: { // Required if using dot corner type
        type: 'dot',
        color: '#000000'
    },
    backgroundOptions: {
        color: "#ffffff", // White background
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 5 // Default margin around logo
    },
    qrOptions: {
        errorCorrectionLevel: 'M' // Default error correction
    }
});

// Function to update the QR code based on user input
const updateQRCode = () => {
    const qrText = document.getElementById('inputText').value.trim();
    const qrCodeColor = document.getElementById('qrCodeColor').value;
    const dotStyle = document.getElementById('dotStyle').value;
    const eyeShape = document.getElementById('eyeShape').value; // Corrected ID
    const qrSize = parseInt(document.getElementById('qrSize').value);
    const errorCorrection = document.getElementById('errorCorrection').value;
    const logoFile = document.getElementById('logoUpload').files[0];
    const customText = document.getElementById('customText').value.trim();

    const qrCodeContainer = document.getElementById('qrCode');
    const qrCustomTextElement = document.getElementById('qrCustomText');

    // Update custom text display
    qrCustomTextElement.textContent = customText;

    // Basic validation: Ensure there's text to encode
    if (!qrText) {
        qrCodeContainer.innerHTML = '<p class="placeholder-text">Enter text or URL above</p>'; // Clear previous QR and show placeholder
        qrCustomTextElement.textContent = ''; // Clear custom text if input is empty
        return; // Stop if no input text
    } else {
         // Clear placeholder if text is entered
         const placeholder = qrCodeContainer.querySelector('.placeholder-text');
         if (placeholder) placeholder.remove();
    }


    const qrOptions = {
        data: qrText,
        width: qrSize,
        height: qrSize,
        dotsOptions: {
            color: qrCodeColor,
            type: dotStyle
        },
         // Dynamically set corner options based on selected type
        cornersSquareOptions: { type: eyeShape === 'square' ? 'square' : null, color: qrCodeColor },
        cornersDotOptions: { type: eyeShape === 'dot' ? 'dot' : null, color: qrCodeColor },
        // Add logic here if 'rounded' refers to cornersSquareOptions type or cornersDotOptions
        // Assuming 'rounded' applies to cornersSquareOptions for now:
        // cornersSquareOptions: { type: eyeShape === 'rounded' ? 'rounded' : (eyeShape === 'square' ? 'square' : null), color: qrCodeColor },
        // cornersDotOptions: { type: eyeShape === 'dot' ? 'dot' : null, color: qrCodeColor },

        // More robust corner handling based on library specifics might be needed
        // For simplicity, let's assume 'square' and 'dot' are the main corner types handled this way.
        // If 'rounded' is a valid type for cornersSquareOptions:
         cornersSquareOptions: { type: (eyeShape === 'square' || eyeShape === 'rounded') ? eyeShape : null, color: qrCodeColor },
         cornersDotOptions: { type: eyeShape === 'dot' ? 'dot' : null, color: qrCodeColor },

        backgroundOptions: {
            color: "#ffffff" // Keep background white unless customized
        },
        qrOptions: {
            errorCorrectionLevel: errorCorrection
        },
        imageOptions: { // Reset image options
             imageSize: 0.4, // Default relative size
             margin: 5
         }
    };

    // Handle Logo
    if (logoFile) {
        const reader = new FileReader();
        reader.onload = (e) => {
            qrOptions.image = e.target.result;
            qrCode.update(qrOptions); // Update QR code with logo
        };
        reader.onerror = () => {
             console.error("Error reading logo file.");
             alert("Could not load the logo file.");
             qrCode.update(qrOptions); // Update without logo on error
        };
        reader.readAsDataURL(logoFile);
    } else {
        qrOptions.image = null; // Ensure no image is used if file is removed
        qrCode.update(qrOptions); // Update QR code without logo
    }

    // Clear and append the updated QR code to the DOM
    // Check if qrCode instance has been appended before, otherwise append
    if (!qrCodeContainer.contains(qrCode._canvas)) {
         qrCodeContainer.innerHTML = ""; // Clear previous content (like placeholder)
         qrCode.append(qrCodeContainer); // Append new QR code
    }
};

// --- Event Listeners for Generator ---

// Initial generation on load if needed (optional)
document.addEventListener('DOMContentLoaded', () => {
     // Set initial size from dropdown
     const initialSize = parseInt(document.getElementById('qrSize').value);
     qrCode.update({ width: initialSize, height: initialSize });
     updateQRCode(); // Generate initial QR based on defaults (or empty)
});


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
    const qrText = document.getElementById('inputText').value.trim();
     if (!qrText) {
         alert("Please enter text or URL to generate a QR code first.");
         return;
     }
    const filename = qrText.length > 20 ? qrText.substring(0, 20) + '...' : (qrText || 'qrcode');
    qrCode.download({ name: filename.replace(/[^a-z0-9]/gi, '_').toLowerCase(), extension: "png" }); // Use png for wider compatibility
});


// --- QR Code Scanner Logic ---

const video = document.getElementById('preview');
const resultURLSpan = document.getElementById('resultURL');
const scannedResultDiv = document.getElementById('scannedResult');
let activeQrScanner = null; // To keep track of the scanner instance

// Scanner using Camera
document.getElementById('startScan').addEventListener('click', async function() {
    if (!window.QrScanner) {
        alert('Scanner library not loaded.');
        return;
    }

    // Stop previous scanner if running
    if (activeQrScanner) {
        activeQrScanner.stop();
        activeQrScanner.destroy();
        activeQrScanner = null;
    }

    try {
        // Check for camera availability
         if (!await QrScanner.hasCamera()) {
            alert('No camera found on this device.');
            return;
         }

        video.style.display = 'block'; // Show video element
        resultURLSpan.textContent = 'Scanning...';
        scannedResultDiv.style.display = 'block'; // Show result area

        activeQrScanner = new QrScanner(
            video,
            result => {
                console.log('decoded qr code:', result);
                resultURLSpan.textContent = result.data;
                stopCamera(); // Stop camera and hide video on success
                alert(`QR Code Scanned: ${result.data}`); // Notify user
            },
            {
                highlightScanRegion: true,
                highlightCodeOutline: true,
                calculateScanRegion: (v) => { // Example: Scan central 80%
                      const V_WIDTH = v.videoWidth;
                      const V_HEIGHT = v.videoHeight;
                      const ASPECT_RATIO = V_WIDTH / V_HEIGHT;
                      const REGION_SIZE = Math.min(V_WIDTH, V_HEIGHT) * 0.8; // 80% of the smaller dimension

                      return {
                        x: (V_WIDTH - REGION_SIZE) / 2,
                        y: (V_HEIGHT - REGION_SIZE) / 2,
                        width: REGION_SIZE,
                        height: REGION_SIZE,
                        downScaledWidth: REGION_SIZE,
                        downScaledHeight: REGION_SIZE,
                      };
                }
            }
        );

        await activeQrScanner.start();

    } catch (error) {
        console.error("Camera Scan Error:", error);
        alert(`Could not start camera: ${error.message || error}`);
        stopCamera(); // Ensure camera stops on error
    }
});

// Function to stop camera and hide video
function stopCamera() {
     if (activeQrScanner) {
        activeQrScanner.stop();
        activeQrScanner.destroy();
        activeQrScanner = null;
     }
     video.style.display = 'none';
     if (video.srcObject) {
         video.srcObject.getTracks().forEach(track => track.stop());
         video.srcObject = null; // Release the source object
     }
     // Optionally clear the result text if desired when stopping manually
     // resultURLSpan.textContent = '';
     // scannedResultDiv.style.display = 'none';
}


// Scanner using File Upload
document.getElementById('uploadQR').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    // Stop camera scanner if running
    stopCamera();

    resultURLSpan.textContent = 'Processing image...';
    scannedResultDiv.style.display = 'block'; // Show result area


    QrScanner.scanImage(file, { returnDetailedScanResult: true })
        .then(result => {
            console.log('decoded qr code from file:', result);
            resultURLSpan.textContent = result.data;
        })
        .catch(error => {
            console.error("File Scan Error:", error);
            resultURLSpan.textContent = 'No QR code found or error scanning.';
            alert(error || 'No QR code found in the uploaded image.');
        });

     // Fallback using jsQR (keep as alternative or remove if QrScanner works well)
    /*
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d', { willReadFrequently: true }); // Optimization hint
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0, img.width, img.height);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            try {
                 const code = jsQR(imageData.data, imageData.width, imageData.height, {
                     inversionAttempts: "dontInvert", // or "attemptBoth" if needed
                 });

                 if (code) {
                     resultURLSpan.textContent = code.data;
                     scannedResultDiv.style.display = 'block';
                 } else {
                      resultURLSpan.textContent = "No QR code found.";
                      scannedResultDiv.style.display = 'block';
                      // alert("No QR code found in the image.");
                 }
            } catch (err) {
                 console.error("jsQR Error:", err);
                 resultURLSpan.textContent = "Error scanning QR code.";
                 scannedResultDiv.style.display = 'block';
                 alert("Could not scan the QR code from the image.");
            }
        };
        img.onerror = function() {
             alert("Could not load image file.");
             resultURLSpan.textContent = "Failed to load image.";
             scannedResultDiv.style.display = 'block';
        };
        img.src = e.target.result;
    };
    reader.onerror = function() {
         alert("Could not read file.");
         resultURLSpan.textContent = "Failed to read file.";
         scannedResultDiv.style.display = 'block';
    };
    reader.readAsDataURL(file);
    */

     // Reset file input to allow scanning the same file again
     event.target.value = null;
});
