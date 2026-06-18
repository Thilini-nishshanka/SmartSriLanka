import { Request, Response } from 'express';
import { PolicyService } from '../services/policy.service';
import { sendSuccess, sendError } from '../utils/response.util';
import { UpdatePolicyDTO } from '../types/dto/policy.dto';

export class PolicyController {
  private policyService: PolicyService;

  constructor() {
    this.policyService = new PolicyService();
  }

  getAllPolicies = async (req: Request, res: Response) => {
    try {
      const policies = await this.policyService.getAllPolicies();
      sendSuccess(res, policies);
    } catch (error: any) {
      sendError(res, error.message);
    }
  };

  getPolicyBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return sendError(res, 'Policy slug is required in the URL.', 400);
      }
      const policy = await this.policyService.getPolicyBySlug(slug);
      sendSuccess(res, policy);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode);
    }
  };

  updatePolicy = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      if (!slug) {
        return sendError(res, 'Policy slug is required in the URL.', 400);
      }
      const dto: UpdatePolicyDTO = req.body;
      const updatedPolicy = await this.policyService.updatePolicy(slug, dto);
      sendSuccess(res, updatedPolicy);
    } catch (error: any) {
      sendError(res, error.message, error.statusCode);
    }
  };
}