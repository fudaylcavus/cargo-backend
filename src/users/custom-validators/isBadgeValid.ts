import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BADGES } from '../constants/constants';

@ValidatorConstraint({ name: 'Unique', async: true })
@Injectable()
export class IsBadge implements ValidatorConstraintInterface {
  constructor() {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    if (!value) return false;
    return BADGES.includes(value.toUpperCase())

  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} entered is not valid`;
  }
}

export function IsValidBadge(         
  badge: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [badge],
      validator: IsBadge,
    });
  };
}
