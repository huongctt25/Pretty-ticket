import { Injectable } from '@nestjs/common'
import { InjectConnection, InjectRepository } from '@nestjs/typeorm'
import { runInTrx } from 'src/common'
import { Connection, EntityManager, Repository } from 'typeorm'
import { Role, User } from './entities/users.entity'

@Injectable()
export class UsersService {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  private runInTrx<T>(
    run: (repo: Repository<User>) => Promise<T>,
    trx?: EntityManager,
  ): Promise<T> {
    return runInTrx({ connection: this.connection, trx }, (em) =>
      run(em.getRepository(User)),
    )
  }

  create(email: string, password: string, role: Role): Promise<User> {
    return this.runInTrx((repo) => {
      const user = repo.create({ email, password, role })

      return repo.save(user)
    })
  }

  async findOne(email: string): Promise<User[]> {
    return this.runInTrx((repo) => {
      return repo.find({ email })
    })
  }

  async findByEmail(email: string): Promise<User> {
    return this.runInTrx((repo) => {
      return repo.findOne({ email })
    })
  }

  async findById(id: number): Promise<User> {
    return this.runInTrx((repo) => {
      return repo.findOneOrFail({ id })
    })
  }

  async findAdmin(): Promise<User[]> {
    return this.runInTrx((repo) => {
      return repo.find({ role: Role.admin })
    })
  }
}
