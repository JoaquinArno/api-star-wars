import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../guards/checkRole.guard';
import { Role } from '../../enums/userRole.enum';
import { Roles } from '../../decorators/roles.decorator';
import { WinstonLogger } from '../../config/logger.config';

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(
    private readonly movieService: MovieService,
    private readonly logger: WinstonLogger
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all movies' })
  @ApiResponse({
    status: 200,
    description: 'List of movies retrieved successfully',
  })
  findAll() {
    this.logger.log('Getting all movies');
    return this.movieService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.User)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a specific movie by ID (Users only)' })
  @ApiResponse({ status: 200, description: 'Movie retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Getting movie with id ${id}`);
    return this.movieService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new movie (Admin only)' })
  @ApiResponse({ status: 201, description: 'Movie created successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createMovieDto: CreateMovieDto) {
    this.logger.log(`Creating movie with title: ${createMovieDto.title}`);
    return this.movieService.create(createMovieDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update an existing movie (Admin only)' })
  @ApiResponse({ status: 200, description: 'Movie updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMovieDto: UpdateMovieDto
  ) {
    this.logger.log(`Updating movie with id ${id}`);
    return this.movieService.update(id, updateMovieDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a movie (Admin only)' })
  @ApiResponse({ status: 204, description: 'Movie deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`Deleting movie with id ${id}`);
    await this.movieService.remove(id);
    return { message: 'Movie deleted successfully' };
  }

  @Post('sync')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync movies from SWAPI (Admin only)' })
  @ApiResponse({ status: 200, description: 'Movies synchronized successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async sync() {
    this.logger.log('Syncing movies from SWAPI');
    try {
      await this.movieService.starWarsApiSync();
      return { message: 'Movies synced successfully' };
    } catch (error) {
      this.logger.error('Error syncing movies', error.stack);
      throw error;
    }
  }
}
