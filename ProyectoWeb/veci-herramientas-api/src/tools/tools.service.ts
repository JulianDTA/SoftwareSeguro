import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateToolDto } from './dto/create-tool.dto';
import { Tool, ToolStatus } from './entities/tool.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ToolsService {
  constructor(
    @InjectRepository(Tool)
    private readonly toolRepository: Repository<Tool>,
    private readonly notifService: NotificationsService,
  ) {}

  /**
   * Crea una nueva herramienta.
   * Estado inicial: PENDING (requiere aprobación).
   */
  async create(createToolDto: CreateToolDto, userId: string): Promise<Tool> {
    const newTool = this.toolRepository.create({
      ...createToolDto,
      ownerId: userId,
      status: ToolStatus.PENDING,
      available: true, // Aunque esté disponible, no se verá hasta ser APPROVED
    });
    
    // Notificar al usuario que está en revisión
    await this.notifService.create(userId, `Tu publicación "${newTool.name}" está en revisión por el administrador.`);
    
    return this.toolRepository.save(newTool);
  }

  /**
   * CATÁLOGO PÚBLICO
   * Solo devuelve herramientas que están APROBADAS y DISPONIBLES.
   */
  async findAll(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { 
        status: ToolStatus.APPROVED,
        available: true 
      },
      relations: { owner: true },
      select: { owner: { id: true, name: true, email: true } }, // Datos públicos del dueño
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * HISTORIAL (No Disponibles)
   * Devuelve herramientas prestadas o vendidas.
   */
  async findAllUnavailable(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { available: false },
      relations: { owner: true },
      order: { createdAt: 'DESC' }
    });
  }

  /**
   * ADMIN
   * Devuelve solo las herramientas pendientes de revisión.
   */
  async findAllPending(): Promise<Tool[]> {
    return this.toolRepository.find({
      where: { status: ToolStatus.PENDING },
      relations: { owner: true },
      order: { createdAt: 'ASC' } // Las más antiguas primero
    });
  }

  /**
   * ADMIN
   * Aprueba o rechaza una herramienta.
   */
  async updateStatus(id: string, status: ToolStatus): Promise<Tool> {
    const tool = await this.toolRepository.findOneBy({ id });
    if (!tool) throw new NotFoundException('Herramienta no encontrada');

    tool.status = status;
    const savedTool = await this.toolRepository.save(tool);

    // Notificar decisión al dueño
    const message = status === ToolStatus.APPROVED 
      ? `¡Felicidades! Tu publicación "${tool.name}" ha sido APROBADA y ya es visible en el catálogo.`
      : `Lo sentimos, tu publicación "${tool.name}" ha sido RECHAZADA por el administrador.`;
      
    await this.notifService.create(tool.ownerId, message);

    return savedTool;
  }

  /**
   * DUEÑO
   * Marca una herramienta como VENDIDA (la saca del catálogo permanentemente).
   */
  async markAsSold(id: string, userId: string): Promise<void> {
    const tool = await this.toolRepository.findOneBy({ id });
    
    if (!tool) throw new NotFoundException('Herramienta no encontrada');
    if (tool.ownerId !== userId) throw new UnauthorizedException('No eres el dueño de este artículo');

    // La marcamos como no disponible
    tool.available = false;
    
    await this.toolRepository.save(tool);
    
    // Notificación de confirmación
    await this.notifService.create(userId, `Has marcado "${tool.name}" como VENDIDA exitosamente.`);
  }

  /**
   * SISTEMA (Uso Interno)
   * Cambia la disponibilidad (usado por LoansService al prestar/devolver).
   */
  async setAvailability(id: string, available: boolean) {
    await this.toolRepository.update(id, { available });
  }

  async findOne(id: string) {
    return this.toolRepository.findOneBy({ id });
  }

  async remove(toolId: string, userId: string): Promise<void> {
    const tool = await this.toolRepository.findOneBy({ id: toolId });
    if (!tool) throw new NotFoundException('Herramienta no encontrada');
    if (tool.ownerId !== userId) throw new UnauthorizedException('No tienes permiso para borrar esta herramienta');
    await this.toolRepository.remove(tool);
  }
}