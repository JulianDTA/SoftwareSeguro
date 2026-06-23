import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOnePublic(id);
  }
  @Get('seed/make-admin/:email')
  makeAdmin(@Param('email') email: string) {
    return this.usersService.promoteToAdmin(email);
  }
}