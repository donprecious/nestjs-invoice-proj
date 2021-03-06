import { JwtPayloadDto } from './../dto/jwt.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash';


@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions = this.reflector.getAllAndMerge<string[]>('permissions', [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();

    if (permissions.length == 0) {
      return true;
    }

    const user = request.user as JwtPayloadDto;

    const userPermissions = user.role.permissions;
    return this.matchPermissions(permissions, userPermissions);
  }

  matchPermissions(requiredPermissions, userPermissions) {
 
    const sameValues = _.intersection(requiredPermissions, userPermissions);
    if (sameValues.length > 0) return true;
    return false;
  }
}
