import * as cdk from '@aws-cdk/core';
import * as acm from '@aws-cdk/aws-certificatemanager'
import * as route53 from '@aws-cdk/aws-route53'
import * as apigw2 from '@aws-cdk/aws-apigatewayv2'
import * as apigw from '@aws-cdk/aws-apigateway'
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations'
import * as lambda from '@aws-cdk/aws-lambda'
import * as targets from '@aws-cdk/aws-route53-targets'
import * as es from '@aws-cdk/aws-lambda-event-sources'

interface MyProps extends cdk.StackProps {
  domainName: string
}

export class BookstoreBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: MyProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromLookup(this, 'MyHostedZone', {
      domainName: props!.domainName,
      privateZone: false
    })

    const subdomain = `dev.${props!.domainName}`
    console.log(subdomain)

    const certificate = new acm.Certificate(this, 'MyCertificate', {
      domainName: subdomain,
      subjectAlternativeNames: [
        `*.${subdomain}`
      ],
      validation: acm.CertificateValidation.fromDns(hostedZone),
    })

    const fn = new lambda.Function(this, 'MyFn', {
        code: lambda.Code.fromInline(`
          exports.handler = async function handler(event) {
            console.log(event)
            try {
              const method = event.httpMethod.toLowerCase()

              return {
                statusCode: 200,
                body: JSON.stringify({ message: "Hello from lambda! Your method was " + method }),
              }
            } catch (error) {
              console.log(error)
            }
          }
        `),
        handler: 'index.handler',
        runtime: lambda.Runtime.NODEJS_12_X,
        timeout: cdk.Duration.seconds(30),
    })

    const domain = new apigw2.DomainName(this, 'MyCustomDomain', {
      domainName: `api.${subdomain}`,
      certificate,
    })

    const api = new apigw2.HttpApi(this, 'MyApi', {
      apiName: 'testapi' ,
      defaultAuthorizer: new apigw2.HttpNoneAuthorizer(),
      defaultIntegration: new LambdaProxyIntegration({
        handler: new lambda.Function(this, 'CatchAllLambda', {
          handler: 'index.handler',
          code: lambda.Code.fromInline(`
            exports.handler = async function handler(event) {
              console.log(event)
              
              return {
                statusCode: 405,
                body: JSON.stringify({ message: "Method not allowed" })
              }
            }
          `),
          runtime: lambda.Runtime.NODEJS_12_X,
        }),
        payloadFormatVersion: apigw2.PayloadFormatVersion.VERSION_1_0,
      }),
      defaultDomainMapping: {
        domainName: domain,
      }
    })

    api.addRoutes({
      integration: new LambdaProxyIntegration({
        handler: fn,
        payloadFormatVersion: apigw2.PayloadFormatVersion.VERSION_1_0,
      }),
      path: '/test',
      authorizer: new apigw2.HttpNoneAuthorizer(),
      methods: [
        apigw2.HttpMethod.GET,
        apigw2.HttpMethod.POST,
      ],
    })

    // new route53.CnameRecord(this, 'MyCNAME', {
    //   domainName: domain.regionalDomainName,
    //   zone: hostedZone,
    //   recordName: `api.${subdomain}`,
    // })

    new route53.ARecord(this, 'MyARecord', {
      recordName: `api.${subdomain}`,
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayv2DomainProperties(domain.regionalDomainName, domain.regionalHostedZoneId))
   })

    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.apiEndpoint,
    })

    new cdk.CfnOutput(this, 'DomainName', {
      value: domain.regionalDomainName,
    })
  }
}
