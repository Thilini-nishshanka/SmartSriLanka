import { PolicyRepository } from '../repositories/policy.repository';
import { AppError } from '../utils/error.util';
import { UpdatePolicyDTO } from '../types/dto/policy.dto';

export class PolicyService {
  private policyRepository: PolicyRepository;

  constructor() {
    this.policyRepository = new PolicyRepository();
  }

  async getAllPolicies() {
    return this.policyRepository.findAll();
  }

  async getPolicyBySlug(slug: string) {
    const policy = await this.policyRepository.findBySlug(slug);
    if (!policy) {
      throw new AppError('Policy page not found', 404);
    }
    return policy;
  }

  async updatePolicy(slug: string, dto: UpdatePolicyDTO) {
    const policy = await this.policyRepository.updateBySlug(slug, { content: dto.content });
    if (!policy) {
      throw new AppError('Policy page not found', 404);
    }
    return policy;
  }
}