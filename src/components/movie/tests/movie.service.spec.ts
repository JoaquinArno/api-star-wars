import { Test, TestingModule } from '@nestjs/testing';
import { MovieService } from '../movie.service';
import { Repository } from 'typeorm';
import { Movie } from '../entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WinstonLogger } from '../../../config/logger.config';

const mockMovieRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('MovieService', () => {
  let service: MovieService;
  let repository: Repository<Movie>;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MovieService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepository,
        },
        {
          provide: WinstonLogger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<MovieService>(MovieService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
    logger = module.get(WinstonLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const movies = [{ id: 1, title: 'Movie 1' }];
      mockMovieRepository.find.mockResolvedValue(movies);

      const result = await service.findAll();

      expect(result).toEqual(movies);
      expect(mockMovieRepository.find).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Fetching all movies');
    });
  });

  describe('findOne', () => {
    it('should return a movie by id', async () => {
      const movie = { id: 1, title: 'Movie 1' };
      mockMovieRepository.findOne.mockResolvedValue(movie);

      const result = await service.findOne(1);

      expect(result).toEqual(movie);
      expect(mockMovieRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(logger.log).toHaveBeenCalledWith('Fetching movie with id 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(logger.error).toHaveBeenCalledWith('Movie with id 999 not found');
    });
  });

  describe('create', () => {
    it('should create and return the movie', async () => {
      const createDto = {
        title: 'New Movie',
        description: 'Desc',
        director: 'Dir',
        year: 2020,
        genre: 'Action',
      };
      const movie = { id: 1, ...createDto };
      mockMovieRepository.save.mockResolvedValue(movie);

      const result = await service.create(createDto);

      expect(result).toEqual(movie);
      expect(mockMovieRepository.save).toHaveBeenCalledWith(createDto);
      expect(logger.log).toHaveBeenCalledWith(
        `Creating movie: ${createDto.title}`
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      mockMovieRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.create({} as any)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(logger.error).toHaveBeenCalledWith(
        'Error creating movie',
        expect.any(String)
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated movie', async () => {
      const movie = { id: 1, title: 'Old Title' };
      const updateDto = { title: 'Updated Title' };
      mockMovieRepository.findOne.mockResolvedValue(movie);
      mockMovieRepository.save.mockResolvedValue({ ...movie, ...updateDto });

      const result = await service.update(1, updateDto);

      expect(result.title).toEqual(updateDto.title);
      expect(mockMovieRepository.save).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Updating movie with id 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, {} as any)).rejects.toThrow(
        NotFoundException
      );
      expect(logger.error).toHaveBeenCalledWith('Movie with id 999 not found');
    });
  });

  describe('remove', () => {
    it('should delete a movie by id', async () => {
      mockMovieRepository.delete.mockResolvedValue({ affected: 1 });

      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Movie deleted successfully' });
      expect(mockMovieRepository.delete).toHaveBeenCalledWith(1);
      expect(logger.log).toHaveBeenCalledWith('Deleting movie with id 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(logger.error).toHaveBeenCalledWith('Movie with id 999 not found');
    });
  });

  describe('starWarsApiSync', () => {
    it('should import movies without error', async () => {
      mockMovieRepository.save.mockResolvedValue(undefined);
      const spyLog = jest.spyOn(logger, 'log');

      await expect(service.starWarsApiSync()).resolves.toBeUndefined();

      expect(spyLog).toHaveBeenCalledWith(
        'Starting import of movies from SWAPI'
      );
      expect(spyLog).toHaveBeenCalledWith(
        'Finished import of movies from SWAPI'
      );
    });

    it('should log and throw error on failure', async () => {
      const error = new Error('SWAPI error');
      jest.spyOn(service, 'starWarsApiSync').mockImplementationOnce(() => {
        throw error;
      });

      await expect(service.starWarsApiSync()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Error importing movies from SWAPI',
        expect.any(String)
      );
    });
  });
});
