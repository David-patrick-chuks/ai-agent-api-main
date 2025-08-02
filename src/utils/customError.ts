import { HttpStatus } from "./httpStatus"

export abstract class CustomError extends Error{
    abstract isOperational: boolean;
    abstract statusCode:  HttpStatus;
    abstract status:   string;
    constructor(public message:string){
        super(message)
    }
abstract serializedError():{
message:string;
status: string
}

 }