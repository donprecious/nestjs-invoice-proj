import { UserOrganization } from './../../../../entities/userOrganization.entity';
import { UserRepository } from './../../../../services/userService';
import { CreateOrganizationUserDto } from 'src/dto/create-organization-user.dto';
import {
  OrganizationRepository,
  UserOrganizationRepository,
} from './../../../../services/organization/organizationService';
import { AppResponse } from './../../../../shared/helpers/appresponse';
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger/dist/decorators/api-use-tags.decorator';
import { Organization } from 'src/entities/organization.entity';
import { User } from 'src/entities/User.entity';
import { CreateOrganizationDto } from 'src/dto/create-organization.dto';

@ApiTags('organization')
@Controller('organization')
export class OrganizationController {
  constructor(
    private orgService: OrganizationRepository,
    private userRepo: UserRepository,
    private userOrgRepo: UserOrganizationRepository,
  ) {}

  @Post()
  async create(@Body() createUserOrg: CreateOrganizationUserDto) {
    const org = createUserOrg.orgainzation as Organization;
    const user = createUserOrg.user as User;
    await this.orgService.insert(org);
    await this.userRepo.insert(user);
    const userOrg = {
      user: user,
      organization: org,
    } as UserOrganization;
    this.userOrgRepo.insert(userOrg);
    return AppResponse.OkSuccess(createUserOrg);
  }
}
