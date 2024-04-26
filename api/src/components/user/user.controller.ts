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
    if(!userId) return { error: 'No user id provided'};
    if(userId === parentId) return { error: 'Parent and child can\'t be the same user'}
    const status: UserEntity | false = await this.userService.setParent(userId, parentId);
    // this error handling is not great but it will do for the assessment sake. Ideally we should have constants with output message
    // and setParent() should return such constant depending on what went wrong.
    return status || { error: 'Couldn\'t find parent or children using provided id, or this user had children'};
  }

  @Post('adduser')
  async addUser(@Body() dto: AddUserDto): Promise<UserEntity | {}> {
    const status: UserEntity | false = await this.userService.add(dto);
    return status || { error: 'No parent found'};
  }

  @Post('removeuser')
  async removeUser(@Body() dto: { userId: string }):  Promise<{}> {
    const status: boolean = await this.userService.remove(dto.userId);
    return status ? { success: true } : { error: 'No parent found'};
  }
  
}