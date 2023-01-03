const fs = require('fs');
const path = require('path');

const {Storage} = require('@google-cloud/storage');

const projectId = 'orchestration-gcp-episen';
const BUCKET_UNBLURRED='image-unblurred'

const storage = new Storage({projectId});

// Use the express-fileupload middleware



/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.search = async (req, res) => {
    const [files] = await storage.bucket(BUCKET_UNBLURRED).getFiles()

    const resObj = []
    files.forEach(file => resObj.push({'image' : file.name, 'link' : file.metadata.mediaLink}))
    
    res.send(resObj)
};