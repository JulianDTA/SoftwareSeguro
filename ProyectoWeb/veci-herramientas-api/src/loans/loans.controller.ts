import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get, 
  Patch, 
  Param 
} from '@nestjs/common';
import { LoansService } from './loans.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto'; // <-- Importar
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('loans')
export class LoansController {
  constructor(private readonly loansService: LoansService) {}

  @Post()
  create(@Body() createLoanDto: CreateLoanDto, @Request() req: any) {
    const requesterId = req.user.userId;
    return this.loansService.create(createLoanDto, requesterId);
  }

  @Get('my-loans')
  getMyLoans(@Request() req: any) {
    const userId = req.user.userId;
    return this.loansService.findMyLoans(userId);
  }
  
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateLoanStatusDto: UpdateLoanStatusDto,
    @Request() req: any,
  ) {
    const userId = req.user.userId;
    return this.loansService.updateStatus(id, updateLoanStatusDto, userId);
  }
}