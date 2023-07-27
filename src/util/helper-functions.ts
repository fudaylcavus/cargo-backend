import { HttpException } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';

export const isValidId = (id: string) => {
  if (!isValidObjectId(id)) throw new HttpException('Not a valid id!', 400);
};

export const isValidIdList = (idList: string[]) => {
  for (let id of idList)
    if (!isValidObjectId(id)) throw new HttpException('Not a valid id!', 400);
};
