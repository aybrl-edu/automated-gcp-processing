const fs = require('fs');
const path = require('path');
const axios = require('axios')

const Busboy = require('busboy');
const {Storage} = require('@google-cloud/storage');

const projectId = 'orchestration-gcp-episen';
const BUCKET_INPUT='image-input'
const DETECT_FUNCTION_URL='https://us-central1-orchestration-gcp-episen.cloudfunctions.net/orc-http-image-detect'

const storage = new Storage({projectId});

// Use the express-fileupload middleware



/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.upload = (req, res) => {
    // Get the file that was set to our field named "image"

    const busboy = Busboy({ headers: req.headers });

    // Image uploads obj
    const uploads = {};

    const fileWrites = [];

    // This code will process each file uploaded.
    busboy.on('file', (fieldname, file, filename) => {
        console.log(`Processed image ${filename.filename}`);

        const filepath = path.join(filename.filename);
        uploads[fieldname] = filepath;

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);    

        // File was processed by Busboy; wait for it to be written to disk.
        const promise = new Promise((resolve, reject) => {
            file.on('end', () => {
                writeStream.end();
            });
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
        fileWrites.push(promise);
    });

    busboy.on('finish', () => {
        Promise.all(fileWrites)
        .then(() => {
            for (const name in uploads) {
                const file = uploads[name];
                async function upload2bucket() {
                    fileRes = await storage.bucket(BUCKET_INPUT).upload(file);
                    fs.unlinkSync(file);

                    console.log(fileRes[0].name)
                    const post_data = {
                        "imageId" : fileRes[0].name
                    }

                    await axios.post(DETECT_FUNCTION_URL, post_data)

                    res.send(fileRes);
                }
                upload2bucket()
            }
        });
    });

    busboy.end(req.rawBody);
    
};


// Old function
async function uploadImageToBucket(imageName, tempLocalPath){
    // upload image to bucket
    const blurredBucket = storage.bucket(BUCKET_INPUT);
    const gcsPath = `gs://${BUCKET_INPUT}/${imageName}`;

    try {
        await blurredBucket.upload(tempLocalPath, {destination: imageName});
        console.log(`Uploaded image to: ${gcsPath}`);
    } catch (err) {
        throw new Error(`Unable to upload image to ${gcsPath}: ${err}`);
    }
}