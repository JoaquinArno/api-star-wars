import { Test, TestingModule } from '@nestjs/testing';
import { MovieController } from '../movie.controller';
import { MovieService } from '../movie.service';
import { NotFoundException } from '@nestjs/common';
import { WinstonLogger } from '../../../config/logger.config';

const mockMovieService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  importMoviesFromSwapi: jest.fn(),
};

const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('MovieController', () => {
  let controller: MovieController;
  let service: jest.Mocked<MovieService>;
  let logger: WinstonLogger;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieController],
      providers: [
        { provide: MovieService, useValue: mockMovieService },
        { provide: WinstonLogger, useValue: mockLogger },
      ],
    }).compile();

    controller = module.get<MovieController>(MovieController);
    service = module.get(MovieService);
    logger = module.get(WinstonLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of movies', async () => {
      const movies = [
        {
          id: 1,
          title: 'Movie 1',
          description: 'Description 1',
          director: 'Director 1',
          year: 2020,
          genre: 'Action',
        },
      ];
      service.findAll.mockResolvedValue(movies);

      const result = await controller.findAll();

      expect(result).toEqual(movies);
      expect(service.findAll).toHaveBeenCalled();
      expect(logger.log).toHaveBeenCalledWith('Getting all movies');
    });
  });

  describe('findOne', () => {
    it('should return a single movie', async () => {
      const movie = {
        id: 1,
        title: 'Movie 1',
        description: 'Description 1',
        director: 'Director 1',
        year: 2020,
        genre: 'Action',
      };
      service.findOne.mockResolvedValue(movie);

      const result = await controller.findOne(1);

      expect(result).toEqual(movie);
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(logger.log).toHaveBeenCalledWith('Getting movie with id 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      service.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      expect(logger.log).toHaveBeenCalledWith('Getting movie with id 999');
    });
  });

  describe('create', () => {
    it('should create and return the movie', async () => {
      const createDto = {
        title: 'New Movie',
        description: 'New description',
        director: 'New director',
        year: 2023,
        genre: 'Drama',
      };
      const movie = { id: 1, ...createDto };
      service.create.mockResolvedValue(movie);

      const result = await controller.create(createDto);

      expect(result).toEqual(movie);
      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(logger.log).toHaveBeenCalledWith(
        `Creating movie with title: ${createDto.title}`
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated movie', async () => {
      const updateDto = {
        title: 'Updated Movie',
        description: 'Updated description',
        director: 'Updated director',
        year: 2024,
        genre: 'Comedy',
      };
      const movie = { id: 1, ...updateDto };
      service.update.mockResolvedValue(movie);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(movie);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
      expect(logger.log).toHaveBeenCalledWith('Updating movie with id 1');
    });
  });

  describe('remove', () => {
    it('should remove the movie', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove(1);

      expect(result).toEqual({ message: 'Movie deleted successfully' });
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(logger.log).toHaveBeenCalledWith('Deleting movie with id 1');
    });
  });

  describe('syncMovies', () => {
    it('should call starWarsApiSync and return success message', async () => {
      service.starWarsApiSync.mockResolvedValue(undefined);

      const result = await controller.sync();

      expect(service.starWarsApiSync).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Movies synced successfully' });
      expect(logger.log).toHaveBeenCalledWith('Syncing movies from SWAPI');
    });

    it('should log error and throw on failure', async () => {
      const error = new Error('Failed to sync');
      service.starWarsApiSync.mockRejectedValue(error);

      await expect(controller.sync()).rejects.toThrow(error);
      expect(logger.error).toHaveBeenCalledWith(
        'Error syncing movies',
        error.stack
      );
    });
  });
});
