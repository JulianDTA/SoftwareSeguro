import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  sendMessage(@Body() dto: CreateMessageDto, @Request() req: any) {
    return this.messagesService.sendMessage(req.user.userId, dto);
  }

  @Get('contacts')
  getContacts(@Request() req: any) {
    return this.messagesService.getMyContacts(req.user.userId);
  }

  @Get('conversation/:otherUserId')
  getConversation(@Param('otherUserId') otherUserId: string, @Request() req: any) {
    return this.messagesService.getConversation(req.user.userId, otherUserId);
  }
}