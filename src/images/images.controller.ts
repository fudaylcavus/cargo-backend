import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, MulterModule } from '@nestjs/platform-express';
import { Response } from 'express';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { GetSendImageDto, SendImageDto } from './dto/send-image.dto';
import { ImagesService } from './images.service';


@Controller('api/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @UseGuards(JwtAuthGuard)
@Post()
  @UseInterceptors(FileInterceptor('image'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUser('userId') userId: string,
    @Body() data: GetSendImageDto,
  ) {
    if(!file.path) throw new HttpException("File error!",500)
    console.log(data);
    console.log('SENDING ');
    console.log(file);
    const image = await this.imagesService.upload(file,{id:userId,...data});
    console.log(file.path)
    return image;
  }
  @Get('/:key')
  async getImage(@Param('key') key: string,
    
  @Res() res: Response) {
    const image = await this.imagesService.getImage(key);
    res.header({
      'Content-Type':'image/png'
    })
    return image.pipe(res);
  }
}
