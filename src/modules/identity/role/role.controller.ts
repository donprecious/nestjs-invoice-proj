import { Organization } from 'src/entities/organization.entity';
import { RoleAccessableType } from 'src/shared/entity/entityStatus';
import { UserRepository } from './../../../services/user/userService';
import { AppResponse } from 'src/shared/helpers/appresponse';
import { BadRequestException } from '@nestjs/common/exceptions/bad-request.exception';
import { RoleRepository } from './../../../services/role/roleService';
import { Role } from 'src/entities/Role.entity';
import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  NotFoundException,
  Delete,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateRoleDto } from 'src/dto/role/role.dto';
import { AppService } from 'src/services/app/app.service';
import { OrganizationRepository } from 'src/services/organization/organizationService';
import { FindConditions, In, Like } from 'typeorm';
import { ApiTags } from '@nestjs/swagger/dist';
import { JwtAuthGuard } from '../auth/jwtauth.guard';
import { RolePermissionGuard } from 'src/shared/guards/role-permission.guard';

@UseGuards(JwtAuthGuard, RolePermissionGuard)
@Controller('role')
@ApiTags('Role')
export class RoleController {
  /**
   *
   */
  constructor(
    private configService: ConfigService,
    private appService: AppService,
    private orgRepo: OrganizationRepository,
    private roleRepo: RoleRepository,
    private userRepo: UserRepository,
  ) {}

  @Post()
  async createRole(@Body() roleDto: CreateRoleDto) {
    const roleexist = await this.roleRepo.findOne({
      where: { Name: roleDto.name.toLowerCase() },
    });
    if (roleexist) {
      throw new BadRequestException(
        AppResponse.badRequest(
          `role ${roleexist.Name} already exist use another one`,
        ),
      );
    }
    const role = {
      Name: roleDto.name.toLowerCase(),
      Description: roleDto.description,
      accessiblilty: roleDto.accessiblilty,
      type: roleDto.type,
      permission: roleDto.permission,
    } as Role;

    if (roleDto.organizationId) {
      const org = await this.orgRepo.findOne({
        where: { id: roleDto.organizationId },
      });
      if (!org) {
        throw new BadRequestException(
          AppResponse.badRequest('organization not found'),
        );
      }

      role.organization = org;
      role.organizationId = org.id;
    }

    await this.roleRepo.save(role);
    return AppResponse.OkSuccess(role);
  }

  @Put(':id')
  async updateRole(@Body() roleDto: CreateRoleDto, @Param('id') id: string) {
    const roleexist = await this.roleRepo.findOne({
      where: { id: id },
    });
    if (!roleexist) {
      throw new NotFoundException(
        AppResponse.NotFound(`role with ${id} not found`),
      );
    }
    const roleWithName = await this.roleRepo.findOne({
      where: { Name: roleDto.name.toLowerCase() },
    });
    if (
      roleWithName &&
      roleexist.Name.toLowerCase() != roleDto.name.toLowerCase()
    ) {
      throw new BadRequestException(
        AppResponse.badRequest(
          `role ${roleDto.name} already in use, try another one`,
        ),
      );
    }

    (roleexist.Name = roleDto.name),
      (roleexist.Description = roleDto.description),
      (roleexist.accessiblilty = roleDto.accessiblilty),
      (roleexist.permission = roleDto.permission),
      (roleexist.type = roleDto.type),
      await this.roleRepo.update(roleexist.id, roleexist);
    return AppResponse.OkSuccess(roleexist);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const roleexist = await this.roleRepo.findOne({
      where: { id: id },
    });
    if (!roleexist) {
      throw new NotFoundException(
        AppResponse.NotFound(`role with ${id} not found`),
      );
    }
    const userRoleCount = await this.userRepo.count({
      where: { role: roleexist },
    });
    if (userRoleCount > 0) {
      throw new BadRequestException(
        AppResponse.badRequest(
          'sorry, you cant delete this role, its already in use',
        ),
      );
    }
    const deleteResult = await this.roleRepo.delete(id);
    return AppResponse.OkSuccess(deleteResult, 'delete was successful');
  }

  @Get()
  async getAll(@Query('search') search?: string) {
    const where: FindConditions<Role>[] = [];
    if (search && search != '') {
      search = search.toLowerCase();
      where.push({ Name: Like(`%${search}%`) });
    }
    const query = await this.roleRepo.find({
      where: where,
      order: { createdOn: 'DESC' },
    });
    return AppResponse.OkSuccess(query);
  }

  @Get('organization/:organizationId')
  async getOrganization(
    @Query('search') search: string,
    @Param('organizationId') organizationId: string,
  ) {
    const organization = await this.orgRepo.findOne({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new BadRequestException(
        AppResponse.badRequest('organization not forund'),
      );
    }
    const where: FindConditions<Role>[] = [
      {
        organization: organization,
      },
      {
        accessiblilty: In([
          RoleAccessableType.public,
          // RoleAccessableType.private,
        ]),
      },
    ];
    if (search && search != '') {
      search = search.toLowerCase();
      where.push({ Name: Like(`%${search}%`) });
    }
    const query = await this.roleRepo.find({
      where: where,
      order: { createdOn: 'DESC' },
    });
    return AppResponse.OkSuccess(query);
  }

  @Get(':id')
  async GetOne(@Param('id') id: string) {
    const roleexist = await this.roleRepo.findOne({
      where: { id: id },
    });
    if (!roleexist) {
      throw new NotFoundException(
        AppResponse.NotFound(`role with ${id} not found`),
      );
    }
    return AppResponse.OkSuccess(roleexist);
  }
}
