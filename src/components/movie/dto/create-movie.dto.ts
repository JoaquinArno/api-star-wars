import { IsNotEmpty, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMovieDto {
  @ApiProperty({
    description: 'Title of the movie',
    example: 'Solaris',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Brief description or synopsis of the movie',
    example:
      'A cosmonaut investigates reports from a crew aboard a space station who are experiencing visions.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Director of the movie',
    example: 'Andréi Tarkovski',
  })
  @IsNotEmpty()
  @IsString()
  director: string;

  @ApiProperty({
    description: 'Year the movie was released',
    example: 1972,
    minimum: 1888,
    maximum: new Date().getFullYear(),
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear())
  year: number;

  @ApiProperty({
    description: 'Genre of the movie',
    example: 'Science Fiction',
  })
  @IsNotEmpty()
  @IsString()
  genre: string;
}
