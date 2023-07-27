import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
    ValidationArguments,
  } from 'class-validator';
  import { Injectable } from '@nestjs/common';

import { CargosService } from 'src/cargos/cargos.service';
import { TripsService } from 'src/trips/trips.service';


  
  const REQUEST_TYPES=['Cargo','Trip']
  @ValidatorConstraint({ name: 'Unique', async: true })
  @Injectable()
  export class isValidRequest implements ValidatorConstraintInterface {
    constructor(private readonly cargoService: CargosService,
        private readonly tripService: TripsService
        ) {}

  
    async validate(value: string, args: ValidationArguments): Promise<boolean> {
        const [requestType='requestType',request='request'] = args.constraints;
        console.log("CHECKK");
        const req_type=(<any>args.object)["requestType"]
        console.log(req_type)
      if (!value||!req_type) return false;
      if(REQUEST_TYPES.includes(req_type)) {
        console.log("IN IFF")
        console.log(await this.cargoService.findById(value))
        if(req_type=='Cargo'&&await this.cargoService.findById(value)!=null) return true
        else if(req_type=='Trip'&&await this.tripService.findById(value)!=null) return true
        return false
      }
      else return false;
    }
  
    defaultMessage(args: ValidationArguments) {
      return `requestType or request entered is not valid OR doesn't match!`;
    }
  }
  
  export function IsValidRequest(
    requestType: string,
    request:string,
    validationOptions?: ValidationOptions,
  ) {
    return function (object: any, propertyName: string) {
      registerDecorator({
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        constraints: [requestType,request],
        validator: isValidRequest,
      });
    };
  }