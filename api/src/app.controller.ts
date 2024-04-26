import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { AddUserDto, IUser, SetParentDto } from './types';

@Controller()
export class AppController {
  constructor(
    // private readonly appService: AppService
  ) {}

  @Get()
  empty(): string {
    return 'Nothing here';
  }
}
