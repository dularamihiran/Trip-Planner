const { S3Client, HeadBucketCommand } = require('@aws-sdk/client-s3');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const bucketName = process.env.AWS_S3_BUCKET || 'trip-planer-new';
console.log(`🔍 Searching for bucket '${bucketName}' across regions...`);

const regions = [
    'ap-south-1', // Mumbai (Most likely)
    'us-east-1',  // N. Virginia (Default)
    'eu-north-1', // Stockholm (Current config)
    'us-east-2',
    'us-west-1',
    'us-west-2',
    'ap-southeast-1',
    'ap-southeast-2',
    'ap-northeast-1',
    'eu-central-1',
    'eu-west-1',
    'eu-west-2'
];

async function checkRegion(region) {
    const client = new S3Client({
        region: region,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
    });

    try {
        const command = new HeadBucketCommand({ Bucket: bucketName });
        await client.send(command);
        return true; // Success!
    } catch (error) {
        // If 403 Forbidden, it means bucket exists in this region but we might not have list permissions
        // But HeadBucket usually returns 404 if not found in region, or 301 if in another region.
        // However, if we get 200 OK, we are good.
        // If we get 403, it means it exists in this region (or S3 gives 403 globally?)
        // Actually, S3 returns 400 Bad Request 'AuthorizationHeaderMalformed' if region is wrong for V4 signature?
        // Or 301 PermanentRedirect.

        if (error.name === 'NotFound') return false;
        if (error.$metadata && error.$metadata.httpStatusCode === 200) return true;

        // If 301, it's not here.
        if (error.name === 'PermanentRedirect' || error.$metadata.httpStatusCode === 301) return false;

        // If 403, it usually means it exists in this region but permission denied.
        // So this IS the region.
        if (error.$metadata.httpStatusCode === 403) {
            // Double check: if it was in another region, we'd get 301 usually.
            // But let's log it.
            return 'POSSIBLE';
        }

        return false;
    }
}

async function findRegion() {
    for (const region of regions) {
        process.stdout.write(`Checking ${region}... `);
        const result = await checkRegion(region);

        if (result === true) {
            console.log(`\n✅ FOUND IT! The bucket '${bucketName}' is in '${region}'`);
            console.log('Update your .env file with this region!');
            return;
        } else if (result === 'POSSIBLE') {
            console.log(`\n⚠️  Possible match: '${region}' (Access Denied, but bucket seems to look for this region)`);
            // Continue searching just in case
        } else {
            console.log('No');
        }
    }
    console.log('\n❌ Could not find bucket in common regions.');
}

findRegion();
