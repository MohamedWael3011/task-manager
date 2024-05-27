import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { User } from './user.entity';
import { AuthCredentialsDto } from './dtos/auth-credentials.dto';
import { DataBaseErrors } from 'src/database-errors.enum';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(
    @InjectRepository(User)
    repository: Repository<User>
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  async createUser(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    const { username, password } = authCredentialsDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = this.create({ username, password: hashedPassword });
    try {
      await this.save(user);
    } catch (error) {
      if (error.code === DataBaseErrors.NOT_UNIQUE) {
        throw new ConflictException('Username already exists');
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
