/**
 * Authentication Service
 * 
 * Provides authentication and authorization functions for API routes
 */

import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-key';
const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Authenticate user from request
 * @throws Error if user is not authenticated
 */
export async function authenticateUser(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload.sub as string || verified.payload.userId as string;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Authorize user role
 * @throws Error if user does not have required role
 */
export async function authorizeRole(
  request: NextRequest,
  requiredRoles: string[]
): Promise<string> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader) {
    throw new Error('Authorization header missing');
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const verified = await jwtVerify(token, secret);
    const userRole = verified.payload.role as string;
    
    if (!requiredRoles.includes(userRole)) {
      throw new Error(`User role '${userRole}' not in required roles: ${requiredRoles.join(', ')}`);
    }
    
    return verified.payload.sub as string || verified.payload.userId as string;
  } catch (error) {
    if (error instanceof Error && error.message.includes('not in required roles')) {
      throw error;
    }
    throw new Error('Invalid or expired token');
  }
}
