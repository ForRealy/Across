import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: 'No token provided' });
        return;
    }

    try {
        const decoded = jwt.verify(token, 'tu_secreto_super_seguro') as any;
        (req as any).user = decoded;
        next();
    } catch (error) {
        res.status(403).json({ message: 'Invalid token' });
        return;
    }
}; 