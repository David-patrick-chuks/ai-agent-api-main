import{Request,Response, NextFunction} from "express";

export default (fn:any) => {
    return (res:Request, req:Response, next:NextFunction) => {
        fn(res, req, next).catch(next)
    }
}