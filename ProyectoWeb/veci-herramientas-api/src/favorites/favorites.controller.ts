import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  add(@Request() req, @Body() createFavoriteDto: CreateFavoriteDto) {
    return this.favoritesService.addFavorite(req.user.userId, createFavoriteDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.favoritesService.getMyFavorites(req.user.userId);
  }

  @Delete(':toolId')
  remove(@Request() req, @Param('toolId') toolId: string) {
    return this.favoritesService.removeFavorite(req.user.userId, toolId);
  }
}