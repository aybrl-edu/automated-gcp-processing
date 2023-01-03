const fs = require('fs');
const path = require('path');

const {Storage} = require('@google-cloud/storage');
//const vision = require('@google-cloud/vision');
const gm = require('gm').subClass({imageMagick: true});

const projectId = 'orchestration-gcp-episen';
const BUCKET_INPUT='image-input'
const BUCKET_BLURRED='image-blurred'
const BUCKET_UNBLURRED='image-unblurred'

const storage = new Storage({projectId});
//const client = new vision.ImageAnnotatorClient();

// Use the express-fileupload middleware



/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.detect = async (req, res) => {
    // Get the file that was set to our field named "image"
    const IMAGE_ID = req.body.imageId

    if(!IMAGE_ID) res.sendStatus(400)



    const file = storage.bucket(BUCKET_INPUT).file(IMAGE_ID);
    const filePath = `gs://${BUCKET_INPUT}/${IMAGE_ID}`;

    // Detect Image w/ Vision
    try {
        const [result] = await client.safeSearchDetection(filePath);
        const detections = result.safeSearchAnnotation || {};
    
        if (detections.adult === 'VERY_LIKELY' || detections.violence === 'VERY_LIKELY') {
            console.log(`Detected ${file.name} as offensive.`);
            await blurImageAndSaveToBucket(file);
            res.sendStatus(201)
        } else {
            console.log(`Detected ${file.name} as OK.`);
            await saveToBucket(file)
            res.sendStatus(201)
        }
      } catch (err) {
        console.error(`Failed to analyze ${file.name}.`, err);
        res.sendStatus(400)
        throw err;
      }
};

async function blurImageAndSaveToBucket(file) {
    const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

    // Download file from bucket.
    try {
        await file.download({destination: tempLocalPath});
        console.log(`Downloaded ${file.name} to ${tempLocalPath}.`);

    } catch (err) {
        throw new Error(`Image download failed: ${err}`);
    }

    await new Promise((resolve, reject) => {
        gm(tempLocalPath)
        .blur(0, 16)
        .write(tempLocalPath, (err, stdout) => {
            if (err) {
                console.error('Failed to blur image.', err);
                reject(err);
            } else {
                console.log(`Blurred image: ${file.name}`);
                resolve(stdout);
            }
        });
    });

    const blurredBucket = storage.bucket(BUCKET_BLURRED);

    // Upload the Blurred image back into the bucket.
    const gcsPath = `gs://${BUCKET_BLURRED}/${file.name}`;

    try {
        await blurredBucket.upload(tempLocalPath, {destination: file.name});
        console.log(`Uploaded blurred image to: ${gcsPath}`);
    } catch (err) {
        throw new Error(`Unable to upload blurred image to ${gcsPath}: ${err}`);
    }

    // Delete the temporary file.
    fs.unlinkSync(tempLocalPath);

    return;
}

async function saveToBucket(file) {
    const tempLocalPath = `/tmp/${path.parse(file.name).base}`;

    // Download file from bucket.
    try {
        await file.download({destination: tempLocalPath});
        console.log(`Downloaded ${file.name} to ${tempLocalPath}.`);

    } catch (err) {
        throw new Error(`Image download failed: ${err}`);
    }

    const unblurredBucket = storage.bucket(BUCKET_UNBLURRED);

    // Upload the Blurred image back into the bucket.
    const gcsPath = `gs://${BUCKET_UNBLURRED}/${file.name}`;

    try {
        await unblurredBucket.upload(tempLocalPath, {destination: file.name});
        console.log(`Uploaded image to: ${gcsPath}`);

    } catch (err) {
        throw new Error(`Unable to upload image to ${gcsPath}: ${err}`);
    }

    // Delete the temporary file.
    fs.unlinkSync(tempLocalPath);

    return;
}