import { Request, Response, NextFunction } from "express";


export class BaseError extends Error {
    public message: string = "";
    public status: string = "Server Error";
    public statusCode: number = 500;
  
    constructor(message: string, status?: string, statusCode?: number) {
      super();
      if (message) this.message = message;
  
      if (status) this.status = status;
  
      if (statusCode) this.statusCode = statusCode;
    }
  }
  export async function errorHandler(
    err: BaseError,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    // if (err.name === "ValidationError") err.statusCode = 400;
    // logger.error(err.message, `${JSON.stringify(err.statusCode)}`,)
    return res.status(err.statusCode || 500).json({
      success: false,
      status: err.status,
      statusCode: err.statusCode,
      message: err.message,
      data:null
    });
  }

