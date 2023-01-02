const fs = require('fs');
const path = require('path');

const {Storage} = require('@google-cloud/storage');

const projectId = 'orchestration-gcp-episen';
const BUCKET_INPUT='image-input'

const storage = new Storage({projectId});


/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.searchDownloadImage = (req, res) => {
    let message = req.query.message || req.body.message || 'Hello From Image Search!';
    res.status(200).send(message);
    
};



const file = {
    name : "nodejs"
}

async function uploadImageToBucketTest(file, blurredBucketName){
    // upload image to bucket
    const tempLocalPath = "nodejs.png"
    const blurredBucket = storage.bucket(blurredBucketName);
    const gcsPath = `gs://${blurredBucketName}/${file.name}`;

    try {
        await blurredBucket.upload(tempLocalPath, {destination: file.name});
        console.log(`Uploaded image to: ${gcsPath}`);
    } catch (err) {
        throw new Error(`Unable to upload image to ${gcsPath}: ${err}`);
    }
}

uploadImageToBucketTest(file, BUCKET_INPUT)