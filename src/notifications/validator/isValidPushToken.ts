import { Expo } from 'expo-server-sdk';
import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { Injectable } from '@nestjs/common';
  @ValidatorConstraint({ name: 'Unique', async: true })
  @Injectable()
  export class IsValidPushToken implements ValidatorConstraintInterface {
    constructor() {}
  
    async validate(value: string, args: ValidationArguments): Promise<boolean> {
      if (!value) return false;
      return Expo.isExpoPushToken(value)

    }
  
    defaultMessage(args: ValidationArguments) {
      return `${args.property} entered is not valid push token!`;
    }
  }
  
  export function IsExpoToken(
    pushToken: string,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [pushToken],
        validator: IsValidPushToken,
      });
    };
  }
  