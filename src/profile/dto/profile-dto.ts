
export class ProfileDto {
    readonly name:string;
    readonly surname:string;
    readonly image:string;
    readonly badges:string[]
    readonly rating:Number;
    readonly ratingCount:Number;
    readonly hasVerifiedIdentity:Boolean;
    readonly hasVerifiedPhone:Boolean;
    readonly information:string;
    readonly sentCargoCount:Number;
    readonly deliveredCargoCount:Number;
    readonly createdAt:Date;

}