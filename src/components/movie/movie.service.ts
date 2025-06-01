import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { WinstonLogger } from '../../config/logger.config';
import axios from 'axios';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    private readonly logger: WinstonLogger
  ) {}

  async findAll(): Promise<Movie[]> {
    this.logger.log('Fetching all movies');
    return await this.movieRepository.find();
  }

  async findOne(id: number): Promise<Movie> {
    this.logger.log(`Fetching movie with id: ${id}`);
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      this.logger.warn(`Movie with id ${id} not found`);
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  async create(createMovieDto: CreateMovieDto): Promise<Movie> {
    try {
      this.logger.log(`Creating new movie with title: ${createMovieDto.title}`);
      const movie = this.movieRepository.create(createMovieDto);
      return await this.movieRepository.save(movie);
    } catch (error) {
      this.logger.error('Failed to create movie', error.stack);
      throw new InternalServerErrorException('Failed to create movie');
    }
  }

  async update(id: number, updateMovieDto: UpdateMovieDto): Promise<Movie> {
    this.logger.log(`Updating movie with id: ${id}`);
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      this.logger.warn(`Movie with id ${id} not found`);
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    Object.assign(movie, updateMovieDto);
    return await this.movieRepository.save(movie);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing movie with id: ${id}`);
    const movie = await this.movieRepository.findOne({ where: { id } });
    if (!movie) {
      this.logger.warn(`Movie with id ${id} not found`);
      throw new NotFoundException(`Movie with id ${id} not found`);
    }

    await this.movieRepository.remove(movie);
    this.logger.log(`Movie with id ${id} removed successfully`);
  }

  async starWarsApiSync(): Promise<void> {
    try {
      const listUrl = 'https://www.swapi.tech/api/films';
      const listResponse = await axios.get(listUrl);
      const results = listResponse.data.result;

      for (const item of results) {
        const detailUrl = `https://www.swapi.tech/api/films/${item.uid}`;
        const detailResponse = await axios.get(detailUrl);

        const film = detailResponse.data.result;
        const { title, director, release_date } = film.properties;

        const existingMovie = await this.movieRepository.findOne({
          where: { title },
        });

        if (!existingMovie) {
          const newMovie = this.movieRepository.create({
            title,
            director,
            year: new Date(release_date).getFullYear(),
            description: film.description,
            genre: 'Sci-Fi',
          });

          await this.movieRepository.save(newMovie);
          this.logger.log(`Imported movie: ${title}`);
        }
      }

      this.logger.log('Movie import from SWAPI completed.');
    } catch (error) {
      this.logger.error('Failed to import movies from SWAPI', error.stack);
      throw error;
    }
  }
}
