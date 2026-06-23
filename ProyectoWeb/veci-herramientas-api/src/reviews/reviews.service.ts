import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { Review } from './entities/review.entity';
import { LoansService } from '../loans/loans.service';
import { LoanStatus } from '../loans/entities/loan.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    private readonly loansService: LoansService,
  ) {}

  async create(createReviewDto: CreateReviewDto, reviewerId: string) {
    const { loanId, rating, comment } = createReviewDto;

    const loan = await this.loansService.findOne(loanId);
    if (!loan) throw new NotFoundException('Préstamo no encontrado');

    if (loan.status !== LoanStatus.RETURNED) {
      throw new BadRequestException('Solo puedes reseñar préstamos finalizados (devueltos).');
    }

    let revieweeId: string;

    if (reviewerId === loan.ownerId) {
      revieweeId = loan.requesterId;
    } else if (reviewerId === loan.requesterId) {
      revieweeId = loan.ownerId;
    } else {
      throw new UnauthorizedException('No participaste en este préstamo.');
    }

    const review = this.reviewRepository.create({
      rating,
      comment,
      loanId,
      reviewerId,
      revieweeId,
    });

    return this.reviewRepository.save(review);
  }

  async findByUser(userId: string) {
    return this.reviewRepository.find({
      where: { revieweeId: userId },
      order: { createdAt: 'DESC' },
      relations: { reviewer: true },
    });
  }
}