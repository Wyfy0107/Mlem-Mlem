import { SetMetadata } from '@nestjs/common'

const BypassAuth = () => SetMetadata('no_auth', true)
export default BypassAuth
