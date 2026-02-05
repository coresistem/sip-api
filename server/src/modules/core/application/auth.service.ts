
import { UserRepositoryPort } from '../ports/user.repository.port.js';
import { PrismaUserAdapter } from '../adapters/prisma-user.adapter.js';

export class AuthService {
    constructor(private userRepository: UserRepositoryPort = new PrismaUserAdapter()) { }

    async validateUser(email: string): Promise<any> {
        const user = await this.userRepository.findByEmail(email);
        return user;
    }

    async updateLoginHistory(userId: string): Promise<void> {
        await this.userRepository.updateLastLogin(userId);
    }
}

export const authService = new AuthService();
