import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ToolsService } from './tools.service';
import { CreateToolDto } from './dto/create-tool.dto';
import { ToolStatus } from './entities/tool.entity';

@UseGuards(AuthGuard('jwt'))
@Controller('tools')
export class ToolsController {
  constructor(private readonly toolsService: ToolsService) {}

  /**
   * Crea una nueva herramienta (Estado inicial: PENDING)
   */
  @Post()
  create(@Body() createToolDto: CreateToolDto, @Request() req: any) {
    return this.toolsService.create(createToolDto, req.user.userId);
  }

  /**
   * NUEVO: El dueño marca la herramienta como VENDIDA.
   * Esto la saca del catálogo y la pone como no disponible.
   */
  @Patch(':id/sell')
  markAsSold(@Param('id') id: string, @Request() req: any) {
    return this.toolsService.markAsSold(id, req.user.userId);
  }

  /**
   * Obtiene todas las herramientas DISPONIBLES y APROBADAS (Catálogo público)
   */
  @Get()
  findAll() {
    return this.toolsService.findAll();
  }

  /**
   * Obtiene herramientas NO DISPONIBLES (Prestadas o Vendidas - Historial)
   */
  @Get('unavailable')
  getUnavailable() {
    return this.toolsService.findAllUnavailable();
  }

  /**
   * ADMIN: Obtiene herramientas pendientes de aprobación
   */
  @Get('pending')
  getPending(@Request() req: any) {
    if (req.user.role !== 'admin') throw new UnauthorizedException('Acceso denegado');
    return this.toolsService.findAllPending();
  }

  /**
   * ADMIN: Aprueba o Rechaza una herramienta
   */
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: ToolStatus, @Request() req: any) {
    if (req.user.role !== 'admin') throw new UnauthorizedException('Acceso denegado');
    return this.toolsService.updateStatus(id, status);
  }

  /**
   * Obtiene una herramienta por ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.toolsService.findOne(id);
  }

  /**
   * Elimina una herramienta (Solo el dueño)
   */
  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.toolsService.remove(id, req.user.userId);
  }
}