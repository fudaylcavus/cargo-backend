import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth-guard';
import { FilterDto } from './dto/filter-dto';
import { SearchService } from './search.service';


@Controller('api/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}
  @UsePipes(new ValidationPipe({transform: true}))
  @Post()
  @HttpCode(HttpStatus.OK)
  async getFilter(@Body() filter: FilterDto) {
    return this.searchService.search(filter);
  }
}
