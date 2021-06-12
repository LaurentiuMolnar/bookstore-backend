#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BookstoreBackendStack } from './bookstore-backend-stack';

const app = new cdk.App();
console.log(process.env)
new BookstoreBackendStack(app, 'BookstoreBackendStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});
