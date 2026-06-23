import { Controller, Get, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  findAll(@Request() req: any) {
    return this.service.findAllByUser(req.user.userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string) {
    return this.service.markAsRead(id);
  }
}