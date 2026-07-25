import prisma from '../config/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const authenticate = async (req, res, next) => {
  try {
    let token = req.cookies.accessToken;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    if (!token) {
      return sendError(res, 'Missing authorization token', 401);
    }

    const decoded = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        provider: true,
        providerId: true,
        createdAt: true,
        updatedAt: true,
        profile: true,
        setting: true,
        skill: true,
        subscription: true,
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 401);
    }

    req.user = user;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
};