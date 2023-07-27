import { customAlphabet, nanoid } from "nanoid";


export default function idGenerator(length:number=2):string{
   const nanoid=customAlphabet("ASDFGHJKLQWERTYUOPZXCVBNMI123456789")
   return nanoid(length).toUpperCase();
}
