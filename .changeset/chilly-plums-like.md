---
'seek-datadog-custom-metrics': major
---

Migrate to ESM

This package is now authored as an ESM package. It is still published as a dual CJS/ESM package.

There are no intentional breaking changes in this release. While it has been tested on an internal Koa server, CDK Lambda function, and Serverless Lambda function, the change in underlying build tool may cause issues for bespoke application configurations. Exercise caution when upgrading and test that your application deploys successfully in a pre-production environment.
