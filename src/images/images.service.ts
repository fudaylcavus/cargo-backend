import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ReadStream } from 'fs';
import { Model } from 'mongoose';
import { Cargo, CargoDocument } from 'src/cargos/schemas/cargos.schema';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { SendImageDto } from './dto/send-image.dto';
const S3 = require('aws-sdk/clients/s3');
import * as fs from 'fs';
import { promisify } from 'util';
const unlinkImage = promisify(fs.unlink);

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_SECRET_ACCESS_KEY;
const accessSecretKey = process.env.AWS_ACCESS_KEY_ID;

const s3 = new S3({
  region,
  accessKeyId,
  accessSecretKey,
});

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Cargo.name) private readonly cargoModel: Model<CargoDocument>,
  ) {}

  async upload(file: Express.Multer.File, data: SendImageDto) {
    console.log('IN UPLOAD');
    console.log(typeof file);
    console.log(file.path);
    console.log(file);
    const fileStream = await fs.createReadStream(file.path);
    const type = data.type.toUpperCase().trim();
    const uploadParams = {
      Bucket: bucketName,
      Body: fileStream,
      Key: data.id,
    };
    if (type === 'USER') {
      const user = await this.userModel.findOne({ _id: data.id });
      if (!user) {
        await unlinkImage(file.path);

        throw new HttpException(
          'Either no user or id is not an user id!',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (user) {
        if (user.image != undefined) this.deleteOldImage(data.id);
        const url = process.env.SERVER_URL + 'api/images/' + data.id;
        user.set('image', url, { strict: false });
        await user.save();
        await unlinkImage(file.path);
        return s3.upload(uploadParams).promise();
      }
    } else if (type === 'CARGO') {
      const cargo = await this.cargoModel.findOne({ _id: data.id });
      if (!cargo) {
        await unlinkImage(file.path);

        throw new HttpException(
          'Either no cargo or id is not an cargo id!',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (cargo) {
        if (cargo.image != undefined) this.deleteOldImage(data.id);
        const url = process.env.SERVER_URL + 'api/images/' + data.id;
        cargo.set('image', url, { strict: false });
        await cargo.save();
        await unlinkImage(file.path);
        return s3.upload(uploadParams).promise();
      }
    }
    await unlinkImage(file.path);
    throw new HttpException(
      'Bad Request, Wrong type provided!',
      HttpStatus.BAD_REQUEST,
    );
  }
  async getImage(key: string): Promise<ReadStream> {
    console.log('IN IMAGE');
    let downloadParams = {
      Key: key,
      Bucket: bucketName,
    };

    try {
      // Verify if exists
      const head = await s3.headObject(downloadParams).promise();
      console.log('no error');
      // Return object
      return s3.getObject(downloadParams).createReadStream();
    } catch (headErr) {
      console.log('errorrrrrrrrrrrrrrrrr' + headErr);
      // If get an error returns default pic
      downloadParams = {
        Key: 'profile-icon-png-898.png',
        Bucket: bucketName,
      };
      return s3.getObject(downloadParams).createReadStream();
    }
  }

  //to be moved ********************************************************************************

  private async deleteOldImage(key: string) {
    s3.deleteObject({ Bucket: bucketName, Key: key }, (err: any, data: any) => {
      console.log('Successfully deleted the old image: ' + data);
    });
  }
}
