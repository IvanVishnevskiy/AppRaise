import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, Tree, TreeParent, TreeChildren } from 'typeorm';

@Entity()
@Tree("materialized-path")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  name: string;

  @TreeParent()
  parent?: UserEntity;

  @TreeChildren()
  children?: UserEntity[];
}