import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';

const accessTokenSecret = process.env.JWT_SECRET || 'dev_only_secret_change_me';
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || accessTokenSecret;

export const signAccessToken = (payload) => jwt.sign(payload, accessTokenSecret, { expiresIn: '15m' });
export const verifyAccessToken = (token) => jwt.verify(token, accessTokenSecret);

export const signRefreshToken = (payload) => {
	const jti = randomUUID();

	return {
		jti,
		token: jwt.sign(payload, refreshTokenSecret, {
			expiresIn: '30d',
			jwtid: jti,
		}),
	};
};

export const verifyRefreshToken = (token) => jwt.verify(token, refreshTokenSecret);