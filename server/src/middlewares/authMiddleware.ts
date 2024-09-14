import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Define the expected shape of the JWT payload
interface JwtPayload {
  id: number;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtPayload; // Extend the Request interface to include `user`
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(401); // Respond with unauthorized status
    return; // Explicitly return `void`
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      res.sendStatus(403); // Respond with forbidden status
      return; // Explicitly return `void`
    }

    // Type assertion for decoded payload
    const payload = decoded as JwtPayload;
    req.user = payload; // Attach the payload to `req.user`
    next(); // Proceed to the next middleware
  });
};
