import {
  Injectable,
  Inject,
  NotFoundException,
  LoggerService,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { LOGGER_SERVICE } from '../constants/constants.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Injectable()
export class MovieService {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @Inject(LOGGER_SERVICE)
    private readonly logger: LoggerService
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
      throw new NotFoundException('Movie not found');
    }
    return movie;
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    this.logger.log(`Creating new movie with title: ${dto.title}`);
    const newMovie = this.movieRepository.create(dto);
    return await this.movieRepository.save(newMovie);
  }

  async update(id: number, dto: UpdateMovieDto): Promise<Movie> {
    this.logger.log(`Updating movie with id: ${id}`);
    const movie = await this.findOne(id);
    const updated = Object.assign(movie, dto);
    return await this.movieRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    this.logger.log(`Removing movie with id: ${id}`);
    const movie = await this.findOne(id);
    await this.movieRepository.remove(movie);
    this.logger.log(`Movie with id ${id} removed successfully`);
  }

  async starWarsApiSync(): Promise<void> {
    try {
      const response = await axios.get('https://www.swapi.tech/api/films');
      const filmList = response.data.result;

      for (const film of filmList) {
        const uid = film.uid;

        const exists = await this.movieRepository.findOne({
          where: { id: uid },
        });

        if (exists) {
          this.logger.log(`Movie with ID ${uid} already exists. Skipping.`);
          continue;
        }

        const filmDetailsResponse = await axios.get(
          `https://www.swapi.tech/api/films/${uid}`
        );
        const filmData = filmDetailsResponse.data.result;

        const createMovieDto: CreateMovieDto = {
          title: filmData.properties.title,
          description: filmData.description,
          director: filmData.properties.director,
          year: new Date(filmData.properties.release_date).getFullYear(),
          genre: 'Science Fiction',
        };

        const movie = this.movieRepository.create({
          id: uid,
          ...createMovieDto,
        });

        await this.movieRepository.save(movie);
        this.logger.log(`Imported movie: ${createMovieDto.title}`);
      }

      this.logger.log('Movie import from SWAPI completed.');
    } catch (error) {
      this.logger.error('Failed to import movies from SWAPI', error.stack);
      throw error;
    }
  }
}
