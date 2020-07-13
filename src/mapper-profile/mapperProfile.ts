import { OrganizationDto } from './../dto/organization/organization.dto';
import { Organization } from 'src/entities/organization.entity';
import { CreateUserDto } from './../dto/organization/create-user.dto';
import { UserDto } from './../dto/user/user.dto';
import { User } from 'src/entities/User.entity';
import { AutoMapper, ProfileBase } from 'nestjsx-automapper';
import { Mapper } from '@nartc/automapper';
import { Profile } from 'nestjsx-automapper/dist/decorators/profile.decorator';
import { CreateOrganizationDto } from 'src/dto/organization/create-organization.dto';

@Profile()
export class AppProfile extends ProfileBase {
  constructor() {
    super();
    // Mapper.createMap(source, destination)
    Mapper.createMap(User, UserDto).reverseMap();
    Mapper.createMap(User, CreateUserDto).reverseMap();

    Mapper.createMap(Organization, CreateOrganizationDto).reverseMap();
    Mapper.createMap(Organization, OrganizationDto).reverseMap();
  }
}
