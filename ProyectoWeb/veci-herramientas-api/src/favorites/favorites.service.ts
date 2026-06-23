import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
  ) {}

  async addFavorite(userId: string, createFavoriteDto: CreateFavoriteDto) {
    const { toolId } = createFavoriteDto;

    // Verificar si ya existe
    const existing = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, tool: { id: toolId } },
    });

    if (existing) {
      throw new ConflictException('Esta herramienta ya está en tus favoritos');
    }

    const favorite = this.favoriteRepository.create({
      user: { id: userId },
      tool: { id: toolId },
    });

    return this.favoriteRepository.save(favorite);
  }

  async getMyFavorites(userId: string) {
    return this.favoriteRepository.find({
      where: { user: { id: userId } },
      relations: ['tool', 'tool.owner'], // Traemos la herramienta y su dueño
      order: { createdAt: 'DESC' },
    });
  }

  async removeFavorite(userId: string, toolId: string) {
    const favorite = await this.favoriteRepository.findOne({
      where: { user: { id: userId }, tool: { id: toolId } },
    });

    if (!favorite) {
      throw new NotFoundException('Favorito no encontrado');
    }

    return this.favoriteRepository.remove(favorite);
  }
}