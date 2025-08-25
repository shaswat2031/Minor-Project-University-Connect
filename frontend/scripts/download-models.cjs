// @ts-check
const fs = require('fs');
const path = require('path');
const https = require('https');

const MODELS_DIR = path.join(process.cwd(), 'public', 'models');
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
  console.log('Created models directory:', MODELS_DIR);
}

/**
 * Downloads a single model file
 * @param {string} filename The name of the file to download
 * @returns {Promise<void>}
 */
const downloadFile = (filename) => {
  /** @type {Promise<void>} */
  const promise = new Promise((resolve, reject) => {
    const url = `${BASE_URL}/${filename}`;
    const filePath = path.join(MODELS_DIR, filename);
    
    console.log(`\nDownloading ${filename}...`);
    console.log(`URL: ${url}`);
    console.log(`To: ${filePath}`);
    
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        // Handle redirect
        const redirectUrl = response.headers.location;
        if (!redirectUrl) {
          reject(new Error(`No redirect location for ${filename}`));
          return;
        }
        
        https.get(redirectUrl, (redirectResponse) => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`Failed to download ${filename}: ${redirectResponse.statusCode}`));
            return;
          }
          redirectResponse.pipe(file);
        }).on('error', reject);
        return;
      }
      
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {}); // Delete the file if download failed
      reject(err);
    });
  });

  return promise;
};

// Download all models
async function downloadModels() {
  console.log('Starting model downloads...');
  console.log('Models will be saved to:', MODELS_DIR);
  
  try {
    for (const file of MODEL_FILES) {
      await downloadFile(file);
    }
    console.log('\nAll models downloaded successfully! 🎉');
  } catch (error) {
    console.error('\nError downloading models:', error);
    process.exit(1);
  }
}

downloadModels();
