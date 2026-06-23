import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private repo: Repository<Notification>,
  ) {}

  async create(userId: string, message: string) {
    const notif = this.repo.create({ userId, message });
    return this.repo.save(notif);
  }

  async findAllByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(id: string) {
    await this.repo.update(id, { read: true });
  }
}