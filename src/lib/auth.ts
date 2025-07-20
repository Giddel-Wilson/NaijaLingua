import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from './env';
import type { User } from '@prisma/client';

export interface JWTPayload {
	userId: string;
	email: string;
	role: string;
}

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: Pick<User, 'id' | 'email' | 'role'>): string {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role
		},
		env.JWT_SECRET,
		{ expiresIn: '7d' }
	);
}

export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, env.JWT_SECRET) as JWTPayload;
	} catch {
		return null;
	}
}

export function isAdmin(user: User | null): boolean {
	return user?.role === 'ADMIN';
}

export function isTutor(user: User | null): boolean {
	return user?.role === 'TUTOR' || user?.role === 'ADMIN';
}

export function isStudent(user: User | null): boolean {
	return user?.role === 'STUDENT';
}
