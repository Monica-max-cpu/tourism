import type { UserApplicationStatus } from '/#/b2b';

let userApplicationStatus: UserApplicationStatus = {
  supplier: {
    merchantType: 'SUPPLIER',
    reviewStatus: 0,
    operationStatus: 0,
    bindStatus: 0,
    createTime: '2026-05-29 09:30:00',
  },
  store: undefined,
};

export function setMockUserApplicationStatus(status: UserApplicationStatus) {
  userApplicationStatus = status;
}

export function mockGetUserApplicationStatus(): Promise<UserApplicationStatus> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(userApplicationStatus), 300);
  });
}
