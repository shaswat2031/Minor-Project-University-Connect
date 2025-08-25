const fs = require('fs');
const path = require('path');
const https = require('https');

const MODELS_DIR = path.join(__dirname, '..', 'public', 'models');
const BASE_URL = 'https://github.com/justadudewhohacks/face-api.js/raw/master/weights';

// List of model files needed
const MODEL_FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
];

// Create models directory if it doesn't exist
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// Download function
const downloadFile = (filename) => {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${filename}`;
    const filePath = path.join(MODELS_DIR, filename);
    
    console.log(`Downloading ${filename}...`);
    
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filePath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });
};

// Download all models
async function downloadModels() {
  console.log('Starting model downloads...');
  try {
    await Promise.all(MODEL_FILES.map(file => downloadFile(file)));
    console.log('\nAll models downloaded successfully! 🎉');
  } catch (error) {
    console.error('\nError downloading models:', error);
    process.exit(1);
  }
}

downloadModels();
