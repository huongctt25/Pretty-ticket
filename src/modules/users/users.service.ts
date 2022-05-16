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

  create(email: string, password: string, role: Role) {
    return this.runInTrx((repo) => {
      const user = repo.create({ email, password, role })

      return repo.save(user)
    })
  }

  async findOne(email: string) {
    return this.runInTrx((repo) => {
      return repo.find({ email })
    })
  }

  async findAdmin() {
    return this.runInTrx((repo) => {
      return repo.find({ role: Role.admin })
    })
  }
}
