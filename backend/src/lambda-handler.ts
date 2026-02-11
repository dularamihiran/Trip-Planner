/**
 * AWS Lambda Handler for Express App
 * Wraps the Express application using @vendia/serverless-express
 */
import serverlessExpress from '@vendia/serverless-express';
import app from './app';

// Create serverless handler
let serverlessHandler: any;

/**
 * Lambda handler function
 * This function will be invoked by AWS Lambda
 */
export const handler = async (event: any, context: any) => {
  // Initialize the serverless handler (lazy initialization)
  if (!serverlessHandler) {
    serverlessHandler = serverlessExpress({ app });
  }

  // Process the request
  return serverlessHandler(event, context);
};
