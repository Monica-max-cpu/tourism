import type { UserApplicationStatus } from '/#/b2b';

let userApplicationStatus: UserApplicationStatus = {
  supplier: {
    applied: true,
    bindStatus: 0,
    merchantId: 'mock-sup-001',
    memberRole: 'OWNER',
    reviewStatus: 1,
    operationStatus: 0,
  },
  store: {
    applied: true,
    bindStatus: 0,
    merchantId: 'mock-str-001',
    memberRole: 'OWNER',
    reviewStatus: 1,
    operationStatus: 0,
  },
};

export function setMockUserApplicationStatus(status: UserApplicationStatus) {
  userApplicationStatus = status;
}

export function mockGetUserApplicationStatus(): Promise<UserApplicationStatus> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(userApplicationStatus), 300);
  });
}
