import { Inject, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { ICreateUserInput, ICreateUserOutput } from './create-user.use-case.dto';
import { IUserRepository, USER_REPOSITORY } from '@domain/user/repositories/user.repository';
import { Email } from '@shared/value-objects/email.vo';
import { EmailAlreadyExistsException } from '@domain/user/exceptions/email-already-exists.exception';
import { User } from '@domain/user/entities/user.entity';
import { WeakPasswordException } from '@domain/user/exceptions/weak-password.exception';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: ICreateUserInput): Promise<ICreateUserOutput> {
    // Validar senha forte
    this.validatePassword(input.password);

    // Criar Value Object Email (já valida formato)
    const email = new Email(input.email);

    // Verificar se email já existe
    const existingUser = await this.userRepository.findByEmail(email.getValue());
    if (existingUser) {
      throw new EmailAlreadyExistsException(email.getValue());
    }

    // Hash da senha
    const hashedPassword = await hash(input.password, 10);

    // Criar entidade User
    const user = new User({
      id: uuidv4(),
      name: input.name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Persistir
    const created = await this.userRepository.create(user);

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
      throw new WeakPasswordException();
    }
  }
}
