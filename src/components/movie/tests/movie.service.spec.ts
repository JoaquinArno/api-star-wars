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
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import axios from 'axios';

jest.mock('axios');

const mockMovieRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
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
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all movies', async () => {
      const movies = [{ id: 1, title: 'Movie 1' }];
      mockMovieRepository.find.mockResolvedValue(movies);

      const result = await service.findAll();

      expect(result).toEqual(movies);
      expect(mockLogger.log).toHaveBeenCalledWith('Fetching all movies');
    });
  });

  describe('findOne', () => {
    it('should return a movie by id', async () => {
      const movie = { id: 1, title: 'Movie 1' };
      mockMovieRepository.findOne.mockResolvedValue(movie);

      const result = await service.findOne(1);

      expect(result).toEqual(movie);
      expect(mockLogger.log).toHaveBeenCalledWith('Fetching movie with id: 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Movie with id 999 not found'
      );
    });
  });

  describe('create', () => {
    it('should create and return the movie', async () => {
      const dto: CreateMovieDto = {
        title: 'New Movie',
        description: 'A movie',
        director: 'Director',
        year: 2022,
        genre: 'Action',
      };
      const created = { id: 1, ...dto };

      mockMovieRepository.create.mockReturnValue(created);
      mockMovieRepository.save.mockResolvedValue(created);

      const result = await service.create(dto);

      expect(result).toEqual(created);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Creating new movie with title: New Movie'
      );
    });

    it('should throw InternalServerErrorException on error', async () => {
      const dto: CreateMovieDto = {
        title: 'Error Movie',
        description: '',
        director: '',
        year: 2022,
        genre: '',
      };
      mockMovieRepository.create.mockReturnValue(dto);
      mockMovieRepository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.create(dto)).rejects.toThrow(
        InternalServerErrorException
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create movie',
        expect.any(String)
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated movie', async () => {
      const movie = { id: 1, title: 'Old Title' };
      const updateDto: UpdateMovieDto = { title: 'New Title' };
      const updated = { ...movie, ...updateDto };

      mockMovieRepository.findOne.mockResolvedValue(movie);
      mockMovieRepository.save.mockResolvedValue(updated);

      const result = await service.update(1, updateDto);

      expect(result).toEqual(updated);
      expect(mockLogger.log).toHaveBeenCalledWith('Updating movie with id: 1');
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.update(999, { title: 'x' })).rejects.toThrow(
        NotFoundException
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Movie with id 999 not found'
      );
    });
  });

  describe('remove', () => {
    it('should delete a movie by id', async () => {
      const movie = { id: 1, title: 'Movie' };
      mockMovieRepository.findOne.mockResolvedValue(movie);
      mockMovieRepository.remove.mockResolvedValue(undefined);

      await service.remove(1);

      expect(mockLogger.log).toHaveBeenCalledWith('Removing movie with id: 1');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Movie with id 1 removed successfully'
      );
    });

    it('should throw NotFoundException if movie not found', async () => {
      mockMovieRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Movie with id 999 not found'
      );
    });
  });

  describe('starWarsApiSync', () => {
    it('should import movies without error', async () => {
      const swapiList = {
        data: {
          result: [{ uid: '1' }, { uid: '2' }],
        },
      };

      const swapiDetails = {
        data: {
          result: {
            description: 'A long time ago...',
            properties: {
              title: 'A New Hope',
              director: 'George Lucas',
              release_date: '1977-05-25',
            },
          },
        },
      };

      (axios.get as jest.Mock)
        .mockResolvedValueOnce(swapiList)
        .mockResolvedValueOnce(swapiDetails)
        .mockResolvedValueOnce(swapiDetails);

      mockMovieRepository.findOne.mockResolvedValue(null);
      mockMovieRepository.create.mockImplementation((data) => data);
      mockMovieRepository.save.mockResolvedValue({});

      await expect(service.starWarsApiSync()).resolves.toBeUndefined();

      expect(mockLogger.log).toHaveBeenCalledWith('Imported movie: A New Hope');
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Movie import from SWAPI completed.'
      );
    });

    it('should log and throw error on failure', async () => {
      const error = new Error('SWAPI error');
      (axios.get as jest.Mock).mockRejectedValue(error);

      await expect(service.starWarsApiSync()).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to import movies from SWAPI',
        expect.any(String)
      );
    });
  });
});
