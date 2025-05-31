import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Movie {
  @PrimaryGeneratedColumn()
  @ApiProperty({ example: 1 })
  id: number;

  @Column()
  @ApiProperty({ example: 'Solaris' })
  title: string;

  @Column()
  @ApiProperty({
    example:
      'A cosmonaut investigates reports from a crew aboard a space station who are experiencing visions.',
  })
  description: string;

  @Column()
  @ApiProperty({ example: 'Andréi Tarkovski' })
  director: string;

  @Column()
  @ApiProperty({ example: 1972 })
  year: number;

  @Column()
  @ApiProperty({ example: 'Science Fiction' })
  genre: string;
}
