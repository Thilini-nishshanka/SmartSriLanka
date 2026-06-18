import { Prisma, PolicyPage } from '@prisma/client';
import { BaseRepository } from './baseRepository';

export class PolicyRepository extends BaseRepository<PolicyPage> {
  constructor() {
    super();
  }

  async findBySlug(slug: string): Promise<PolicyPage | null> {
    return this.prisma.policyPage.findUnique({
      where: { slug },
    });
  }

  async findAll(): Promise<PolicyPage[]> {
    return this.prisma.policyPage.findMany();
  }

  async updateBySlug(slug: string, data: Prisma.PolicyPageUpdateInput): Promise<PolicyPage> {
    return this.prisma.policyPage.update({
      where: { slug },
      data,
    });
  }
}