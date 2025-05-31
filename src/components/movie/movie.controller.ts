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

@ApiTags('Movies')
@Controller('movies')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get()
  @ApiOperation({ summary: 'Get list of all movies' })
  @ApiResponse({
    status: 200,
    description: 'List of movies retrieved successfully',
  })
  findAll() {
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
    await this.movieService.starWarsApiSync();
    return { message: 'Movies synchronized successfully' };
  }
}
