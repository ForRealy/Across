import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    console.log('Authorization Header:', authHeader);

    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.log('No token provided');
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, 'tu_secreto_super_seguro') as any;
        console.log('Token decoded:', decoded);
        (req as any).user = decoded;
        next();
    } catch (error) {
        console.log('Invalid token:', error);
        res.status(403).json({ message: 'Invalid token' });
        return;
    }
};
