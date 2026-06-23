import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createReviewDto: CreateReviewDto, @Request() req: any) {
    const reviewerId = req.user.userId;
    return this.reviewsService.create(createReviewDto, reviewerId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.reviewsService.findByUser(userId);
  }
}