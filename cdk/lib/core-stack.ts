import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class CoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ========================================
    // DynamoDB Tables
    // ========================================

    // Users Table
    const usersTable = new dynamodb.Table(this, 'UsersTable', {
      tableName: 'TripPlanner-Users',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN, // Keep data on stack deletion
      pointInTimeRecovery: true,
    });

    // Add GSI for email lookup (for login)
    usersTable.addGlobalSecondaryIndex({
      indexName: 'EmailIndex',
      partitionKey: { name: 'email', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Hotels Table
    const hotelsTable = new dynamodb.Table(this, 'HotelsTable', {
      tableName: 'TripPlanner-Hotels',
      partitionKey: { name: 'hotelId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // Add GSI for owner lookup
    hotelsTable.addGlobalSecondaryIndex({
      indexName: 'OwnerIndex',
      partitionKey: { name: 'ownerId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI for district lookup
    hotelsTable.addGlobalSecondaryIndex({
      indexName: 'DistrictIndex',
      partitionKey: { name: 'district', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'price', type: dynamodb.AttributeType.NUMBER },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Trips Table
    const tripsTable = new dynamodb.Table(this, 'TripsTable', {
      tableName: 'TripPlanner-Trips',
      partitionKey: { name: 'tripId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // Add GSI for user trips lookup
    tripsTable.addGlobalSecondaryIndex({
      indexName: 'UserTripsIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Bookings Table
    const bookingsTable = new dynamodb.Table(this, 'BookingsTable', {
      tableName: 'TripPlanner-Bookings',
      partitionKey: { name: 'bookingId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // Add GSI for user bookings
    bookingsTable.addGlobalSecondaryIndex({
      indexName: 'UserBookingsIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Add GSI for hotel bookings
    bookingsTable.addGlobalSecondaryIndex({
      indexName: 'HotelBookingsIndex',
      partitionKey: { name: 'hotelId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'checkInDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Places Table
    const placesTable = new dynamodb.Table(this, 'PlacesTable', {
      tableName: 'TripPlanner-Places',
      partitionKey: { name: 'placeId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      pointInTimeRecovery: true,
    });

    // Add GSI for trip places lookup
    placesTable.addGlobalSecondaryIndex({
      indexName: 'TripPlacesIndex',
      partitionKey: { name: 'tripId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'visitDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ========================================
    // S3 Bucket for Photos
    // ========================================

    const photosBucket = new s3.Bucket(this, 'PhotosBucket', {
      bucketName: `trip-planner-photos-${this.account}`,
      versioned: false,
      publicReadAccess: false, // Set to true if you want public access
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      cors: [
        {
          allowedMethods: [
            s3.HttpMethods.GET,
            s3.HttpMethods.PUT,
            s3.HttpMethods.POST,
            s3.HttpMethods.DELETE,
          ],
          allowedOrigins: ['*'], // In production, specify your frontend domain
          allowedHeaders: ['*'],
          maxAge: 3000,
        },
      ],
      lifecycleRules: [
        {
          abortIncompleteMultipartUploadAfter: cdk.Duration.days(7),
          expiredObjectDeleteMarker: true,
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // ========================================
    // Lambda Function
    // ========================================

    const backendLambda = new NodejsFunction(this, 'BackendLambda', {
      functionName: 'TripPlannerAPI',
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, '../../backend/src/lambda-handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        USERS_TABLE: usersTable.tableName,
        HOTELS_TABLE: hotelsTable.tableName,
        TRIPS_TABLE: tripsTable.tableName,
        BOOKINGS_TABLE: bookingsTable.tableName,
        PLACES_TABLE: placesTable.tableName,
        PHOTOS_BUCKET: photosBucket.bucketName,
        AWS_REGION: this.region,
        NODE_ENV: 'production',
      },
      bundling: {
        minify: true,
        sourceMap: true,
        externalModules: ['aws-sdk'], // AWS SDK is provided by Lambda runtime
      },
    });

    // Grant Lambda permissions to DynamoDB tables
    usersTable.grantReadWriteData(backendLambda);
    hotelsTable.grantReadWriteData(backendLambda);
    tripsTable.grantReadWriteData(backendLambda);
    bookingsTable.grantReadWriteData(backendLambda);
    placesTable.grantReadWriteData(backendLambda);

    // Grant Lambda permissions to S3 bucket
    photosBucket.grantReadWrite(backendLambda);
    photosBucket.grantPutAcl(backendLambda);

    // Add S3 presigned URL permissions
    backendLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:GetObject', 's3:DeleteObject'],
        resources: [`${photosBucket.bucketArn}/*`],
      })
    );

    // ========================================
    // API Gateway
    // ========================================

    const api = new apigateway.RestApi(this, 'TripPlannerAPI', {
      restApiName: 'Smart Trip Planner API',
      description: 'API for Smart Trip Planner Sri Lanka',
      deployOptions: {
        stageName: 'prod',
        throttlingRateLimit: 100,
        throttlingBurstLimit: 200,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS, // In production, specify your frontend domain
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
      },
    });

    // Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(backendLambda, {
      proxy: true,
      integrationResponses: [
        {
          statusCode: '200',
        },
      ],
    });

    // Add proxy resource to forward all requests to Lambda
    const proxyResource = api.root.addProxy({
      defaultIntegration: lambdaIntegration,
      anyMethod: true,
    });

    // ========================================
    // Outputs
    // ========================================

    new cdk.CfnOutput(this, 'APIEndpoint', {
      value: api.url,
      description: 'API Gateway endpoint URL',
      exportName: 'TripPlannerAPIEndpoint',
    });

    new cdk.CfnOutput(this, 'PhotosBucketName', {
      value: photosBucket.bucketName,
      description: 'S3 bucket for hotel and user photos',
      exportName: 'TripPlannerPhotosBucket',
    });

    new cdk.CfnOutput(this, 'UsersTableName', {
      value: usersTable.tableName,
      description: 'DynamoDB Users Table',
    });

    new cdk.CfnOutput(this, 'HotelsTableName', {
      value: hotelsTable.tableName,
      description: 'DynamoDB Hotels Table',
    });

    new cdk.CfnOutput(this, 'TripsTableName', {
      value: tripsTable.tableName,
      description: 'DynamoDB Trips Table',
    });

    new cdk.CfnOutput(this, 'BookingsTableName', {
      value: bookingsTable.tableName,
      description: 'DynamoDB Bookings Table',
    });

    new cdk.CfnOutput(this, 'PlacesTableName', {
      value: placesTable.tableName,
      description: 'DynamoDB Places Table',
    });
  }
}
