// routes/s3.js
const express = require('express');
const router = express.Router();
const { S3 } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

router.get('/s3Url', async (req, res) => {
  //console.log('Generating signed URL for S3 upload...');
  const key = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: 'image/jpeg',
  };

  try {
    const command = new PutObjectCommand(params);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 });

    //console.log('Signed URL generated successfully:');
    //console.log('Key for the uploaded file:', key);
    res.send({ url, key });
  } catch (err) {
    console.error('Error generating signed URL for S3 upload:', err);
    res.status(500).send(err);
  }
});

module.exports = router;
