import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import * as lambda from '@aws-cdk/aws-lambda'

// interface MyProps extends cdk.StackProps {
//   environment: string
// }

export class BookstoreBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = new cdk.CfnParameter(this, 'Environment', {
      type: 'String',
      description: 'The environment used for stack deployment; is the same as the Git branch used for deploying',
      default: 'dev'
    })

    
  }
}
