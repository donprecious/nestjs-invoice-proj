import { SetMetadata } from '@nestjs/common';

export const AllowPermissions = (...permissions: string[]) =>
  SetMetadata('permissions', permissions);
