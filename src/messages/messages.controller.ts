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
    Query,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { MessagesService } from './messages.service';
  import { CreateMessageDto, GetSendMessageDto } from './dto/create.message.dto';
  import { UpdateMessageDto } from './dto/update.messages.dto';
  
  import { Message, MessageDocument } from './schemas/messsages.schema';
import { GetCurrentUser } from 'src/auth/decorators/get-current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';

  @UseGuards(JwtAuthGuard)
  @Controller('api/messages')
  export class MessagesController {
    constructor(private readonly messageService: MessagesService) {}
    @Post()
    async create(
      @GetCurrentUser('userId') userId: string,
      @Body() createMessageDto: GetSendMessageDto,
    ): Promise<MessageDocument> {
      return await this.messageService.create({sender:userId,...createMessageDto});
    }
  
    @Get('/:chatId')
    
    async findMessagesOfChat(@Param('chatId') chatId: string, @Query() query: any): Promise<Message[] | null> {
      const {skip}=query
      const skipVal = skip && /^\d+$/.test(skip) ? Number(skip) : 0

      return this.messageService.findMessagesOfChat(chatId,skipVal);
    }

    @Post('/filter/:chatId')
    @HttpCode(HttpStatus.OK)

    async filterByDate(
        @Param(':chatId') id: string,
        @Req() req:any,
      @Param('chatId') chatId:string
    ): Promise<MessageDocument[]|null> {
        const date=req.body.date
        if(!date)  {
            throw new HttpException(
                'No date has been provided!',
                HttpStatus.BAD_REQUEST,
              );
        }
        console.log(date)
        console.log("you are here")
        console.log(new Date(date))
        console.log(typeof new Date)

      return await this.messageService.getAfterDate(new Date(date),chatId);
    }

    @Get()
    async findAll(): Promise<Message[]|null> {
      return this.messageService.findAll();
    }

  }
  