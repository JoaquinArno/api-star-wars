import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  OneToOne,
} from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';
import { Role } from '../../../enums/userRole.enum';

@Entity('user')
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false, unique: true })
  email: string;

  @Column({
    type: 'int',
    default: Role.User,
  })
  role: Role;

  @OneToOne(() => Auth, (auth) => auth.userId)
  auth: Auth;
}
