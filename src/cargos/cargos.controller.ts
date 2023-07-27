import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CargosService } from './cargos.service';
import { CreateCargoDto, GetCreateCargoDto } from './dto/create-cargo.dto';
import { Cargo, CargoDocument } from './schemas/cargos.schema';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { ImagesService } from 'src/images/images.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('api/cargos')
export class CargosController {
  constructor(
    private readonly cargosService: CargosService,
    private readonly imagesService: ImagesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetCreateCargoDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<CargoDocument> {
    const cargo = await this.cargosService.create({ owner: userId, ...data });
    if (file) {
      await this.imagesService
        .upload(file, {
          id: cargo._id.toString(),
          type: 'CARGO',
        })
        .catch((error) => {
          throw new HttpException(
            {
              messages: {
                Cargo: 200,
                Image: 400,
              },
            },
            207,
          );
        });
    }
    console.log('no file so didnt add image');
    console.log('IMAGE');
    console.log(file);
    return cargo;
  }

  @Get()
  async findAll(): Promise<Cargo[] | null> {
    return this.cargosService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCargoDto: UpdateCargoDto,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.cargosService.update(id, updateCargoDto,userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @GetCurrentUser('userId') userId: string,
  ) {
    return this.cargosService.delete(id,userId);
  }
}
