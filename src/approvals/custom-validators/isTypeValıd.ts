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
  export class IsType implements ValidatorConstraintInterface {
    constructor() {}
  
    async validate(value: string, args: ValidationArguments): Promise<boolean> {
      if (!value) return false;
      let val=value.toUpperCase()
      return val==='PICKUP'||val==='DELIVERY'
  
    }
  
    defaultMessage(args: ValidationArguments) {
      return `${args.property} entered is not valid`;
    }
  }
  
  export function IsValidBadge(
    type: string,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [type],
        validator: IsType,
      });
    };
  }
  