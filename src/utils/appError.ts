import { CustomError } from "./customError";
import { HttpStatus } from "./httpStatus";

export class AppError extends CustomError{
    isOperational = true;  
    status:string;  
    public readonly code?: number;
    constructor(public message:string, public statusCode: HttpStatus){
    super(message)
    this.status = `${this.statusCode}`.startsWith("4") ? "fail" : "error";
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
    }
    serializedError(){
        return {message:this.message, status: this.status}
    }
}