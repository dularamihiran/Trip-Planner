#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CoreStack } from '../lib/core-stack';

const app = new cdk.App();

new CoreStack(app, 'TripPlannerStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.AWS_REGION || 'ap-south-1',
  },
  description: 'Smart Trip Planner for Sri Lanka - Infrastructure Stack',
});

app.synth();
