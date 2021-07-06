# RDS / APIGW / Lambda

Boilerplate for CDK (TS)

- Creates VPC
- Creates Aurora Cluster
- Creates APIGW
- Creates LambdaProxyIntegration

## Prerequisites

You'll need Typescript installed:

`cd ~`
`npm i -g typescript`

## CDK

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

- `npm run build` compile typescript to js
- `npm run watch` watch for changes and compile
- `npm run test` perform the jest unit tests
- `cdk deploy` deploy this stack to your default AWS account/region
- `cdk diff` compare deployed stack with current state
- `cdk synth` emits the synthesized CloudFormation template
