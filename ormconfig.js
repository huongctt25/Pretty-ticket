/* eslint-disable @typescript-eslint/no-var-requires */
require('tsconfig-paths/register')

require('@nestjs/config').ConfigModule.forRoot(
  require('./src/configs/base.env').baseEnvConfig,
)

const config = require('./src/postgres/orm').config

module.exports = {
  ...config,
}
