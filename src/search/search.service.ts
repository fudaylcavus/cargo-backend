import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cargo, CargoDocument } from 'src/cargos/schemas/cargos.schema';
import { Trip, TripDocument } from 'src/trips/schemas/trips.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { FilterDto, SearchModeEnum } from './dto/filter-dto';
import { searchResultDto } from './dto/search-result-dto';

@Injectable()
export class SearchService {
  constructor(
    @InjectModel(Cargo.name) private readonly cargoModel: Model<CargoDocument>,
    @InjectModel(Trip.name) private readonly tripModel: Model<TripDocument>,
  ) {}
  async search(filterDto: FilterDto) {
    if (filterDto.searchMode == SearchModeEnum.CARGO) {
      return await this.searchCargo(filterDto);
    } else if (filterDto.searchMode == SearchModeEnum.CARRIER) {
      return await this.searchCarrier(filterDto);
    }
    throw new HttpException(
      'Search mode is null or wrong value provided!',
      HttpStatus.BAD_REQUEST,
    );
  }
  private async searchCargo(filterDto: FilterDto):Promise<searchResultDto>{
    console.log('IN CARGO SEARCH');
    console.log(filterDto);
    const cargos= await this.cargoModel.find({
      ...filterDto,
      volume: { $lte: filterDto.volume == null ? 2 ^ 53 : filterDto.volume },
      weight: { $lte: filterDto.weight == null ? 2 ^ 53 : filterDto.weight },
      deadline: {
        $gte: filterDto.date == null ? new Date('2001-03-28') : filterDto.date,
      },
    }).populate('owner');

    const result= {results:cargos,type:"Cargo"}
    return result
      
  }
  private async searchCarrier(filterDto: FilterDto):Promise<searchResultDto> {
    console.log('IN TRIP SEARCH');
    console.log(filterDto);
    const trips= await this.tripModel.find({
      ...filterDto,
      volume: { $gte: filterDto.volume == null ? -11111 : filterDto.volume },
      weight: { $gte: filterDto.weight == null ? -11111 : filterDto.weight },
      deadline: {
        $lte: filterDto.date == null ? new Date('2001-03-28') : filterDto.date,
      },
    }).populate('owner');
    const result= {results:trips,type:"Trip"}
    return result
  }
}
