import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { IUser } from 'src/types';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<UserEntity[]> {
    const users = await this.usersRepository.manager.getTreeRepository(UserEntity).findTrees();
    return users;
  }

  /**
   * 
   * @param user 
   * @returns created user
   */
  async add(user: Partial<IUser>): Promise<Array<UserEntity> | false> {
    const parent = await this.usersRepository.findOne({ where: {
        id: user.parentId
    }});

    if( user.parentId && !parent ) return false;
    const newUser = new UserEntity();
    newUser.name = user.name;

    if(user.parentId) {
      newUser.parent = parent;
    }

    await this.usersRepository.manager.save(newUser);
    return this.findAll();
  }

  /**
   * Set new parent id to user. If no parent id provided, user loses current parent
   * @param userId child id
   * @param parentId mew parent id
   * @returns parent
   */
  async setParent(userId: string, parentId?: string): Promise<Array<UserEntity> | false> {
    let parent = null;
    if(parentId) {
      parent = await this.usersRepository.findOne({ where: {
        id: parentId
      }});
      if(!parent) return false;
    }

    const ancestors = await this.usersRepository.manager.getTreeRepository(UserEntity).findAncestors(parent);
    
    // prevent ouroboros
    if(ancestors.find(user => user.id === userId)) {
      return false;
    }

    const user = await this.usersRepository.findOne({ where: {
      id: userId
    }});

    user.parent = parent;
    await this.usersRepository.manager.save(user);
    return this.findAll();
  }


  async remove(id: string): Promise<Array<UserEntity> | boolean> {
    const user = await this.usersRepository.findOne({ where: {
      id
    }});
    // this returns children count including our user so we substract 1
    const children = await this.usersRepository.manager.getTreeRepository(UserEntity).countDescendants(user) - 1;
    // Drop the operation if user has children.
    // It's possible to move the whole part of the tree elsewhere, but I believe it is outside of the scope of this assessment.
    // That would require additional clarification in real world scenario, though.
    if(children > 0) return false;

    await this.usersRepository.delete(id);
    return this.findAll();
  }
}