import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ICreateUserInput, ICreateUserOutput } from './create-user.use-case.dto';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { Email } from '@shared/value-objects/email.vo';
import { EmailAlreadyExistsException } from '@domain/user/exceptions/email-already-exists.exception';
import { User } from '@domain/user/entities/user.entity';
import { RedisIdempotencyRepository } from '@infrastructure/cache/repositories/redis-idempotency.repository';
import { DuplicateRequestException } from '@shared/exceptions/duplicate-request.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { HashService } from '@application/auth/services/hash.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly idempotencyRepository: RedisIdempotencyRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(input: ICreateUserInput): Promise<ICreateUserOutput> {
    if (input.idempotencyKey) {
      const existing = await this.idempotencyRepository.get(input.idempotencyKey);
      if (existing) {
        throw new DuplicateRequestException(existing.orderId);
      }
    }

    this.validatePassword(input.password);

    const email = new Email(input.email);

    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new EmailAlreadyExistsException(email.getValue());
    }

    const hashedPassword = await this.hashService.hash(input.password);

    const user = new User({
      id: uuidv4(),
      name: input.name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const created = await this.userRepository.create(user);

    if (input.idempotencyKey) {
      await this.idempotencyRepository.set(input.idempotencyKey, created.getId());
    }

    return {
      id: created.getId(),
      name: created.getName(),
      email: created.getEmail().getValue(),
      createdAt: created.getCreatedAt(),
    };
  }

  private validatePassword(password: string): void {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (
      password.length < minLength ||
      !hasUpperCase ||
      !hasLowerCase ||
      !hasNumber ||
      !hasSpecialChar
    ) {
      throw new ValidationException(
        'Password must be at least 8 characters long and contain uppercase, lowercase, number and special character',
      );
    }
  }
}
