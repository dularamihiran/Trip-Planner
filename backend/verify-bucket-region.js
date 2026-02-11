const path = require('path');
const dotenvPath = path.resolve(__dirname, '.env');
require('dotenv').config({ path: dotenvPath });

console.log('--- DEBUG INFO ---');
console.log('Loading credentials from:', dotenvPath);
// Obscure keys for security in logs
const keyId = process.env.AWS_ACCESS_KEY_ID;
console.log('AWS_ACCESS_KEY_ID loaded:', keyId ? `${keyId.substring(0, 4)}...${keyId.substring(keyId.length - 4)}` : 'NO');
console.log('AWS_SECRET_ACCESS_KEY loaded:', process.env.AWS_SECRET_ACCESS_KEY ? 'YES' : 'NO');
console.log('AWS_REGION loaded:', process.env.AWS_REGION || 'NOT SET');
console.log('Target Bucket:', process.env.AWS_S3_BUCKET);
console.log('------------------');

const { S3Client, ListBucketsCommand, GetBucketLocationCommand } = require('@aws-sdk/client-s3');

// Use us-east-1 to list all buckets (global operation)
const listClient = new S3Client({
    region: 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

async function runDiagnosis() {
    try {
        console.log('\nStep 1: Listing all buckets owned by this account...');
        const command = new ListBucketsCommand({});
        const response = await listClient.send(command);

        console.log(`Successfully listed ${response.Buckets.length} buckets:`);
        const buckets = response.Buckets;

        buckets.forEach(b => console.log(` - ${b.Name} (Created: ${b.CreationDate})`));

        const targetBucketName = process.env.AWS_S3_BUCKET;
        const foundBucket = buckets.find(b => b.Name === targetBucketName);

        if (foundBucket) {
            console.log(`\n✅ Bucket '${targetBucketName}' FOUND in your account!`);
            console.log('Step 2: Checking region for this bucket...');

            // Check region
            const locCommand = new GetBucketLocationCommand({ Bucket: targetBucketName });
            const locResponse = await listClient.send(locCommand);
            // LocationConstraint: null/empty means us-east-1
            const region = locResponse.LocationConstraint || 'us-east-1';
            console.log(`\n🌍 BUCKET REGION IS: ${region}`);

            if (region !== process.env.AWS_REGION) {
                console.warn(`⚠️  MISMATCH DETECTED! Config says '${process.env.AWS_REGION}' but bucket is in '${region}'`);
            } else {
                console.log('✅ Region matches configuration!');
            }
        } else {
            console.error(`\n❌ Bucket '${targetBucketName}' NOT FOUND in your account!`);
            console.error('This means either:');
            console.error('1. You did not create it yet.');
            console.error('2. You created it in a DIFFERENT AWS account.');
            console.error('3. Someone else owns this bucket name globally.');
        }

    } catch (error) {
        console.error('❌ Error listing buckets:', error.message);
        if (error.Code === 'InvalidAccessKeyId' || error.Code === 'SignatureDoesNotMatch') {
            console.error('👉 Your AWS Credentials seem INVALID.');
        }
        if (error.Code === 'AccessDenied') {
            console.error('👉 Your IAM User does not have "s3:ListAllMyBuckets" permission.');
        }
    }
}

runDiagnosis();
