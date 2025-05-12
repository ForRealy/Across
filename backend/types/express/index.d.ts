import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      idUser: number;
      [key: string]: any;
    }

    interface Request {
      user?: User;
    }
  }
}
