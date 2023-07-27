import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { ProfileDto } from './dto/profile-dto';

@Injectable()
export class ProfileService {
  constructor(private readonly usersService: UsersService) {}
  async getProfile(id: Number): Promise<ProfileDto | null> {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    return {
      name: user.name,
      surname: user.surname,
      image: user.image,
      badges: await this.usersService.topBadges(String(id)),
      rating: user.rating,
      ratingCount: user.ratingCount,
      hasVerifiedIdentity: user.hasVerifiedIdentity,
      hasVerifiedPhone: user.hasVerifiedPhone,
      information: user.information,
      sentCargoCount: user.sentCargoCount,
      deliveredCargoCount: user.deliveredCargoCount,
      createdAt: user.createdAt
    };
  }
}
