import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as rds from '@aws-cdk/aws-rds'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations'

export class CdkRdsTsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // 1. Create a VPC in which to launch Aurora
    const vpc = new ec2.Vpc(this, 'Aurora')

    // 2. Create our Aurora Cluster in VPC
    const cluster = new rds.ServerlessCluster(this, 'AuroraCluster', {
      // Specify engine: Postgres / MySQL
      engine: rds.DatabaseClusterEngine.AURORA_POSTGRESQL,
      // Use predefined AWS params to select Postgres version?
      parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        this,
        'ParameterGroup',
        'default.aurora-postgresql10'
      ),
      defaultDatabaseName: 'dev', // Specify the name of the DB
      vpc, // VPC from step #1
      scaling: { autoPause: cdk.Duration.seconds(0) }, // Prevents DB from pausing
    })

    // 3. Create a lambda function
    const endpointLambda = new lambda.Function(this, 'endpointLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode('functions'),
      handler: 'index.handler',
      environment: {
        DB_NAME: 'dev',
        CLUSTER_ARN: cluster.clusterArn,
        SECRET_ARN: cluster.secret?.secretArn || '', // Our cluster auto creates a secret, map the ARN to our lambda env for later
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1', // AWS specific var to resuse TCP connection https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
      },
    })

    // We're using the AWS Data API to query our DB.
    // Grant the lambda access to the cluster
    cluster.grantDataApiAccess(endpointLambda)

    // 4. Create an API to interact with our DB
    const api = new apigw.HttpApi(this, 'Endpoint', {
      // Some basic cors config
      corsPreflight: {
        allowMethods: [
          apigw.CorsHttpMethod.GET,
          apigw.CorsHttpMethod.PUT,
          apigw.CorsHttpMethod.OPTIONS,
          apigw.CorsHttpMethod.POST,
        ],
        allowOrigins: ['*'], // ToDo: Change this to frontend URL later
      },
    })

    api.addRoutes({
      path: '/{proxy+}',
      integration: new integrations.LambdaProxyIntegration({
        handler: endpointLambda,
      }),
    })

    // 5. Output the API URL so we can use it
    new cdk.CfnOutput(this, 'API URL', {
      value: api.url ?? 'No URL',
    })
  }
}
