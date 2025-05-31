import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateMovieDto {
  @ApiPropertyOptional({
    description: 'Title of the movie',
    example: 'Solaris',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Brief description or synopsis of the movie',
    example:
      'A cosmonaut investigates reports from a crew aboard a space station who are experiencing visions.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Director of the movie',
    example: 'Andréi Tarkovski',
  })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({
    description: 'Year the movie was released',
    example: 1972,
    minimum: 1888,
    maximum: new Date().getFullYear(),
  })
  @IsOptional()
  @IsInt()
  @Min(1888)
  @Max(new Date().getFullYear())
  releaseDate?: number;

  @ApiPropertyOptional({
    description: 'Genre of the movie',
    example: 'Science Fiction',
  })
  @IsOptional()
  @IsString()
  genre?: string;
}
