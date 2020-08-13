import { JwtPayloadDto } from './../dto/jwt.dto';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as _ from 'lodash'; 
import { AdminPermissions } from '../app/permissionsType';
@Injectable()
export class RolePermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const permissions = this.reflector.get<string[]>(
      'permissions',
      context.getHandler(),
    );
    if (!permissions) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayloadDto;
    
    const userPermissions = user.role.Permissions;
    return this.matchPermissions(permissions, userPermissions);
  }

  matchPermissions(requiredPermissions, userPermissions) {
   if( _.includes([AdminPermissions.any], userPermissions)) {
     return true; 
   }
    const hasValues = _.includes(requiredPermissions, userPermissions)
    return hasValues; 
  }
}