import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { IUpdateUserInput, IUpdateUserOutput } from './update-user.use-case.dto';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { UserNotFoundException } from '@domain/user/exceptions/user-not-found.exception';
import { Email } from '@shared/value-objects/email.vo';
import { EmailAlreadyExistsException } from '@domain/user/exceptions/email-already-exists.exception';
import { ValidationException } from '@shared/exceptions/validation.exception';
import { HashService } from '@application/auth/services/hash.service';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(input: IUpdateUserInput): Promise<IUpdateUserOutput> {
    const user = await this.userRepository.findById(input.id);

    if (!user || user.isDeleted()) {
      throw new UserNotFoundException(input.id);
    }

    if (input.name) {
      user.setName(input.name);
    }

    if (input.email) {
      const newEmail = new Email(input.email);

      const existingUser = await this.userRepository.findByEmail(newEmail.getValue());
      if (existingUser && existingUser.getId() !== user.getId()) {
        throw new EmailAlreadyExistsException(newEmail.getValue());
      }

      user.setEmail(newEmail);
    }

    if (input.password) {
      this.validatePassword(input.password);
      const hashedPassword = await this.hashService.hash(input.password);
      user.setPassword(hashedPassword);
    }

    const updated = await this.userRepository.update(user);

    return {
      id: updated.getId(),
      name: updated.getName(),
      email: updated.getEmail().getValue(),
      updatedAt: updated.getUpdatedAt(),
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
