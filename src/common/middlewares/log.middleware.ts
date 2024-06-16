import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction } from "express";

@Injectable()
export class LogMiddleWare implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(
      `[req] | ${req.method} | ${req.url} | ${new Date().toLocaleString("kr")}`,
    );
    next();
  }
}
