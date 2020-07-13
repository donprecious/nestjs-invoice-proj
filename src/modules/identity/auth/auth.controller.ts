import { ApiTags } from '@nestjs/swagger/dist/decorators';
import { Body, Controller, Post } from '@nestjs/common';
import { SetupUserDto } from 'src/dto/user/setup-user.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  @Post('/activate')
  activate(@Body() detail: SetupUserDto) {
    return detail;
  }
}
