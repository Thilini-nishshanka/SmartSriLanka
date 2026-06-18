// import { PrismaClient } from '@prisma/client';
//  import { prisma } from '../config/database';
// import { logger } from '../config/logger';

// /**
//  * BaseRepository
//  * Generic repository for Prisma models
//  */
// export abstract class BaseRepository<
//   ModelType,
//   CreateInput,
//   UpdateInput
// > {
//   protected prisma: PrismaClient;
//   protected abstract model: any;

//   constructor() {
//     this.prisma = prisma;
//   }

//   async findAll(
//     include?: any,
//     where?: any,
//     orderBy?: any
//   ): Promise<ModelType[]> {
//     try {
//       return await this.model.findMany({
//         where,
//         include,
//         orderBy,
//       });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.findAll:`, error);
//       throw error;
//     }
//   }

//   async findById(id: string, include?: any){
//     try {
//       return await this.model.findUnique({
//         where: { id },
//         include,
//       });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.findById:`, error);
//       throw error;
//     }
//   }

//   async create(data: CreateInput) {
//     try {
//       return await this.model.create({ data });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.create:`, error);
//       throw error;
//     }
//   }

//   async updateById(id: string, data: UpdateInput) {
//     try {
//       return await this.model.update({
//         where: { id },
//         data,
//       });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.updateById:`, error);
//       throw error;
//     }
//   }

//   async deleteById(id: string): Promise<ModelType> {
//     try {
//       return await this.model.delete({
//         where: { id },
//       });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.deleteById:`, error);
//       throw error;
//     }
//   }

//   async findWithPagination(
//     page: number = 1,
//     limit: number = 10,
//     where?: any,
//     include?: any,
//     orderBy?: any
//   ): Promise<{ data: ModelType[]; total: number }> {
//     try {
//       const skip = (page - 1) * limit;

//       const [data, total] = await Promise.all([
//         this.model.findMany({
//           where,
//           include,
//           orderBy,
//           skip,
//           take: limit,
//         }),
//         this.model.count({ where }),
//       ]);

//       return { data, total };
//     } catch (error) {
//       logger.error(
//         `Error in ${this.constructor.name}.findWithPagination:`,
//         error
//       );
//       throw error;
//     }
//   }

//   async count(where?: any): Promise<number> {
//     try {
//       return await this.model.count({ where });
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.count:`, error);
//       throw error;
//     }
//   }

//   async exists(where: any): Promise<boolean> {
//     try {
//       const result = await this.model.findFirst({
//         where,
//         select: { id: true },
//       });
//       return !!result;
//     } catch (error) {
//       logger.error(`Error in ${this.constructor.name}.exists:`, error);
//       throw error;
//     }
//   }
// }



import { PrismaClient } from '@prisma/client';
//import prisma from '../config/database';
 import { prisma } from '../config/database';
export abstract class BaseRepository<T> {
  protected prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }
}