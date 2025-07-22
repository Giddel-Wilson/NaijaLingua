import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWT_SECRET, AUTH_SECRET } from './env';
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
		JWT_SECRET,
		{ expiresIn: '7d' }
	);
}

export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch {
		return null;
	}
}

// Alias for verifyToken to maintain consistency
export const verifyJWT = verifyToken;

export function isAdmin(user: User | null): boolean {
	return user?.role === 'ADMIN';
}

export function isInstructor(user: User | null): boolean {
	return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
}

export function isTutor(user: User | null): boolean {
	// Keep for backward compatibility, but use isInstructor instead
	return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';
}

export function isStudent(user: User | null): boolean {
	return user?.role === 'STUDENT';
}
