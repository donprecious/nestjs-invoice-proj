import { CreateOrganizationDto } from './dto/create-organization.dto';
import { Controller, Get, Body, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  create(@Body() org: CreateOrganizationDto): string {
    return 'ok';
  }
}
