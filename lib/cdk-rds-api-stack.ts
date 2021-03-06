import * as cdk from '@aws-cdk/core'
import * as lambda from '@aws-cdk/aws-lambda'
import * as rds from '@aws-cdk/aws-rds'
import * as apigw from '@aws-cdk/aws-apigatewayv2'
import * as ec2 from '@aws-cdk/aws-ec2'
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations'
import * as iam from '@aws-cdk/aws-iam'

export class CdkRdsApiStack extends cdk.Stack {
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

    // 3. Create an API to interact with our DB
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

    // 4. Create a lambda function
    const todosLambda = new lambda.Function(this, 'todosLambda', {
      runtime: lambda.Runtime.NODEJS_14_X,
      code: new lambda.AssetCode('functions'),
      handler: 'todos.handler',
      environment: {
        DB_NAME: 'dev',
        CLUSTER_ARN: cluster.clusterArn,
        SECRET_ARN: cluster.secret?.secretArn || '', // Our cluster auto creates a secret, map the ARN to our lambda env for later
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1', // AWS specific var to resuse TCP connection https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/node-reusing-connections.html
      },
    })

    // 5. Setup permissions
    // We're using the AWS Data API to query our DB.
    // Grant the lambda R/W access to the cluster
    cluster.grantDataApiAccess(todosLambda)

    // 6. Add an API route
    api.addRoutes({
      path: '/todos',
      methods: [apigw.HttpMethod.ANY],
      integration: new integrations.LambdaProxyIntegration({
        handler: todosLambda,
      }),
    })

    // 7. IAM: Add Permissions Boundary to all entities created by stack (optional)
    const boundary = iam.ManagedPolicy.fromManagedPolicyArn(
      this,
      'Boundary',
      `arn:aws:iam::${process.env.AWS_ACCOUNT}:policy/ScopePermissions`
    )
    iam.PermissionsBoundary.of(this).apply(boundary)

    // 8. Output the API URL so we can use it
    new cdk.CfnOutput(this, 'API URL', {
      value: api.url ?? 'No URL',
    })
  }
}
