import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  BaseEntity,
  OneToOne,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('auth')
export class Auth extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @OneToOne(() => User, { eager: false, cascade: true })
  @JoinColumn({ name: 'userId' })
  userId: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
