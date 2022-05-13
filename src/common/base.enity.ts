import { ApiHideProperty } from '@nestjs/swagger'
import {
  ClassConstructor,
  classToPlain,
  ClassTransformOptions,
  Expose,
  plainToClass,
} from 'class-transformer'
import {
  Connection,
  CreateDateColumn,
  DeleteDateColumn,
  EntityManager,
  UpdateDateColumn,
} from 'typeorm'

export class AbstractEntity {
  @Expose()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date

  @Expose()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date

  @ApiHideProperty()
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date
}

export class PageInfoType {
  @Expose()
  limit: number

  @Expose()
  offset: number

  @Expose()
  total: number
}

export abstract class KeyValue {
  @Expose()
  key: string

  @Expose()
  value: string
}

export abstract class Collection<T> {
  data: T[]

  @Expose()
  pageInfo: PageInfoType
}

export const dataToResponse =
  <U, T>(cls: ClassConstructor<U>, options?: ClassTransformOptions) =>
  (res: T): U | undefined =>
    res
      ? plainToClass(cls, classToPlain(res), {
          enableImplicitConversion: true,
          excludeExtraneousValues: true,
          ...options,
        })
      : undefined

// export const arrToResponse = <U, T>(cls: ClassConstructor<U>, options?: ClassTransformOptions) => (
//   res: Array<T>,
// ): U[] => res.map(dataToResponse(cls, options))

export const runInTrx = async <T>(
  {
    connection,
    trx,
    onRelease,
  }: {
    connection: Connection
    trx?: EntityManager
    onRelease?: (data: T) => any
  },
  func: (trx: EntityManager) => Promise<T>,
): Promise<T> => {
  if (!trx) {
    const [callbacks, res] = await connection.manager.transaction(
      async (em) => {
        em.queryRunner.data.releaseFn = []
        if (onRelease) {
          em.queryRunner.data.releaseFn.push(onRelease)
        }
        const res = await func(em)
        return [em.queryRunner.data.releaseFn, res]
      },
    )
    callbacks.map((fn) => fn(res))
    return res
  } else {
    if (onRelease) {
      trx.queryRunner.data.releaseFn.push(onRelease)
    }
    return func(trx)
  }
}

// private runInTrx<T>(
//   run: (repo: Repository<UserEntity>) => Promise<T>,
//   trx?: EntityManager,
// ): Promise<T> {
//   return runInTrx({ connection: this.connection, trx }, (em) =>
//     run(em.getRepository(UserEntity)),
//   )
// }
