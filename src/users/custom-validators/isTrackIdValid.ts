import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { DeliveriesService } from 'src/deliveries/deliveries.service';
@ValidatorConstraint({ name: 'Unique', async: true })
@Injectable()
export class IsTrackId implements ValidatorConstraintInterface {
  constructor(private readonly deliveriesService: DeliveriesService) {}

  async validate(value: string, args: ValidationArguments): Promise<boolean> {
    console.log('VALIDATOR');
    console.log(value);
    if(await this.deliveriesService.findByTrackIdString(value)) return true;
    return false
}

  defaultMessage(args: ValidationArguments) {
    return `${args.property} entered is not valid`;
  }
}

export function IsValidTrackId(
  trackId: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [trackId],
      validator: IsTrackId,
    });
  };
}
