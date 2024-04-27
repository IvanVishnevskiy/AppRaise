import { Body, Controller, Get, Post } from '@nestjs/common';
import { AddUserDto, IUser, SetParentDto } from '../../types';
import { UserService } from './user.service';
import { UserEntity } from 'src/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {};

  @Get()
  async getUsers(): Promise<Array<UserEntity>> {
    return await this.userService.findAll();
  }

  /**
   * 
   * @param dto 
   * @returns new tree or error
   */
  @Post('setparent')
  async setParent(@Body() dto: SetParentDto): Promise<UserEntity | {}> {
    const { userId, parentId } = dto;
    if(!userId) return { error: 'No employee id provided'};
    if(userId === parentId) return { error: 'Employee and boss can\'t be the same user'}
    const status: Array<UserEntity> | false = await this.userService.setParent(userId, parentId);
    // this error handling is not great but it will do for the assessment sake. Ideally we should have constants with output message
    // and setParent() should return such constant depending on what went wrong.
    return status || { error: 'Couldn\'t find employee or boss using provided id, or this user has subordinates'};
  }

  @Post('adduser')
  async addUser(@Body() dto: AddUserDto): Promise<UserEntity | {}> {
    const status: Array<UserEntity> | false = await this.userService.add(dto);
    return status || { error: 'No boss found'};
  }

  @Post('removeuser')
  async removeUser(@Body() dto: { userId: string }): Promise<{}> {
    const status: Array<UserEntity> | boolean = await this.userService.remove(dto.userId);
    return status || { error: 'Can\'t remove employee with subordinates'};
  }
  
}
