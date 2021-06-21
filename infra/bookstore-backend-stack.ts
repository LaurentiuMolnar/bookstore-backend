import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import * as lambda from '@aws-cdk/aws-lambda'

export class BookstoreBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamodb.Table(this, 'myTable', {
      partitionKey: {
        name: 'PK',
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamodb.AttributeType.STRING,
      },
      tableName: 'Bookstore',
      billingMode: dynamodb.BillingMode.PROVISIONED,
      writeCapacity: 1,
      readCapacity: 1,
    })
  

    const gw = new apigw.HttpApi(this, 'myApi', {
      apiName: 'bookstoreApi',
    })

    const fn = new lambda.Function(this, 'booksFunction', {
      code: lambda.Code.fromAsset('dist/add-books'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_14_X,
      functionName: 'addBooksFn',
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        TABLE_NAME: table.tableName,
      }
    })
    
    table.grantFullAccess(fn)
    
    gw.addRoutes({
      integration: new LambdaProxyIntegration({ handler: fn }),
      path: '/books',
      methods: [apigw.HttpMethod.POST],
    })

    new cdk.CfnOutput(this, 'addBooksUrl', {
      value: `${gw.apiEndpoint}/books`
    })
  }
}
