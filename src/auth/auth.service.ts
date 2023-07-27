import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { LoginInfo } from './types/loginInfo.type';
import { jwtConstants } from './constants';
import { Tokens } from './types/tokens.type';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { AuthDto } from './dto/auth.dto';

const shortid = require('shortid');

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async logout(userId: string) {
    await this.usersService.update(userId, { refreshToken: null });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access denied!');
    const tokens = await this.getTokens(user._id, user.email);
    await this.updateRefreshTokenHash(user._id, tokens.refresh_token);
    return tokens;
  }

  async login(user: AuthDto): Promise<LoginInfo> {
    const userToFind = await this.usersService.findOne(user.email);
    if (!userToFind) throw new ForbiddenException('Wrong credentials');
    const passwordMatches = await bcrypt.compare(
      user.password,
      userToFind.password,
    );
    if (!passwordMatches) throw new ForbiddenException('Wrong credentials!');

    const tokens = await this.getTokens(userToFind._id, user.email);
    await this.updateRefreshTokenHash(userToFind._id, tokens.refresh_token);
    return {
      ...tokens,
      _id: userToFind._id,
      email: userToFind.email,
      name: userToFind.name,
      surname: userToFind.surname,
      gender: '',
      phone: userToFind.phone,
      birthdate: userToFind.birthDate,
      newsletter: userToFind.newsLetter,
    };
  }

  async signUp(body: CreateUserDto): Promise<Tokens> {
    const { password } = body;
    const hashedPassword = await this.hashData(password);
    const result = await this.usersService.create({
      ...body,
      password: hashedPassword,
    });
    const tokens = await this.getTokens(result._id, result.email);
    await this.updateRefreshTokenHash(result._id, tokens.refresh_token);
    return { ...tokens, _id: result._id };
  }

  private async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async getTokens(userId: number, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: '15d',
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          email,
        },
        {
          secret: jwtConstants.refreshSecret,
          expiresIn: '62d',
        },
      ),
    ]);
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async validateUser(mail: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(mail);
    console.log('in validate user of auth' + user);
    if (!user) return null;
    console.log(await bcrypt.hash(pass, 10));
    console.log(user.password);
    const isMatch = await bcrypt.compare(pass, user.password);
    console.log(isMatch);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await this.hashData(refreshToken);
    await this.usersService.update(userId, { refreshToken: hash });
  }
}
