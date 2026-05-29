import { mockLogin } from '/@/mocks/login.mock';
import {
  REVIEW_STATUS_LABEL,
  OPERATION_STATUS_LABEL,
  isPendingReview,
  isReviewApproved,
  isOperationEnabled,
} from '/@/constants/b2bStatus';

describe('merchant onboarding role and status helpers', () => {
  it('logs no-role demo users in as BASIC_USER', async () => {
    const result = await mockLogin({ username: 'basic', password: 'any' });

    expect(result.user.role).toBe('BASIC_USER');
    expect(result.user.permissions).toEqual([]);
  });

  it('maps split review and operation statuses', () => {
    expect(REVIEW_STATUS_LABEL[0]).toBe('待审核');
    expect(REVIEW_STATUS_LABEL[1]).toBe('审核通过');
    expect(REVIEW_STATUS_LABEL[2]).toBe('审核拒绝');
    expect(OPERATION_STATUS_LABEL[0]).toBe('待启用');
    expect(OPERATION_STATUS_LABEL[1]).toBe('启用');
    expect(OPERATION_STATUS_LABEL[2]).toBe('停用');
    expect(isPendingReview(0)).toBe(true);
    expect(isReviewApproved(1)).toBe(true);
    expect(isOperationEnabled(1)).toBe(true);
  });
});
