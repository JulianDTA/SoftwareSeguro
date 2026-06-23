import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLoanDto } from './dto/create-loan.dto';
import { UpdateLoanStatusDto } from './dto/update-loan-status.dto';
import { Loan, LoanStatus } from './entities/loan.entity';
import { ToolsService } from '../tools/tools.service';
import { Tool, PostType } from '../tools/entities/tool.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LoansService {
  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    private readonly toolsService: ToolsService,
    private readonly notifService: NotificationsService,
  ) {}

  async create(createLoanDto: CreateLoanDto, requesterId: string): Promise<Loan> {
    const { toolId, startDate, endDate } = createLoanDto;

    const tool = await this.toolsService.findOne(toolId);
    if (!tool) throw new BadRequestException('La herramienta no existe');
    if (!tool.available) throw new BadRequestException('Esta herramienta ya no está disponible'); // VALIDACIÓN IMPORTANTE
    if (tool.ownerId === requesterId) throw new BadRequestException('No puedes solicitar tu propia herramienta');

    const newLoan = this.loanRepository.create({
      toolId,
      ownerId: tool.ownerId,
      requesterId,
      startDate,
      endDate,
    });

    const savedLoan = await this.loanRepository.save(newLoan);

    // Notificación al dueño
    await this.notifService.create(
      tool.ownerId,
      `¡Solicitud nueva! Alguien quiere "${tool.name}". Revisa "Mis Préstamos".`
    );

    return savedLoan;
  }

  async updateStatus(id: string, updateLoanStatusDto: UpdateLoanStatusDto, userId: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({ 
      where: { id },
      relations: ['tool'] 
    });

    if (!loan) throw new NotFoundException('Préstamo no encontrado');
    
    const isOwner = loan.ownerId === userId;
    const isRequester = loan.requesterId === userId;

    if (!isOwner && !(isRequester && updateLoanStatusDto.status === LoanStatus.REJECTED)) {
       throw new UnauthorizedException('No tienes permiso');
    }

    loan.status = updateLoanStatusDto.status;
    const savedLoan = await this.loanRepository.save(loan);

    // --- LÓGICA DE DISPONIBILIDAD Y NOTIFICACIONES ---
    if (isOwner) {
        let message = '';
        switch (loan.status) {
            case LoanStatus.APPROVED:
                // Aprobado pero aun no entregado. Sigue disponible en catálogo hasta que se active "active".
                message = `Tu solicitud para "${loan.tool.name}" fue APROBADA. Coordina la entrega.`;
                break;

            case LoanStatus.ACTIVE:
                // ¡IMPORTANTE! Aquí sacamos la herramienta del catálogo
                await this.toolsService.setAvailability(loan.toolId, false);
                
                if (loan.tool.type === PostType.SALE) {
                   message = `Compra confirmada. Has adquirido "${loan.tool.name}".`;
                } else {
                   message = `Préstamo iniciado. Tienes "${loan.tool.name}" en tu poder.`;
                }
                break;

            case LoanStatus.RETURNED:
                // Si era préstamo, vuelve al catálogo. Si era venta, se queda fuera.
                if (loan.tool.type === PostType.LOAN) {
                    await this.toolsService.setAvailability(loan.toolId, true);
                }
                message = `Devolución confirmada de "${loan.tool.name}". ¡Gracias!`;
                break;
                
            case LoanStatus.REJECTED:
                message = `Solicitud rechazada para "${loan.tool.name}".`;
                break;
        }
        if (message) await this.notifService.create(loan.requesterId, message);

    } else if (isRequester && loan.status === LoanStatus.REJECTED) {
        await this.notifService.create(loan.ownerId, `El usuario canceló la solicitud de "${loan.tool.name}".`);
    }

    return savedLoan;
  }

  // ... (resto de métodos igual)
  async findMyLoans(userId: string): Promise<Loan[]> {
    return this.loanRepository.find({
      where: [{ requesterId: userId }, { ownerId: userId }],
      relations: { tool: true, owner: true, requester: true },
      order: { createdAt: 'DESC' },
    });
  }
  
  async findOne(id: string): Promise<Loan | null> {
      return this.loanRepository.findOneBy({ id });
  }
}