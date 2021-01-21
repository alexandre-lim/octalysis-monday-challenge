function buildReqParameter({ ...overrides } = {}) {
  const req = { params: {}, ...overrides };
  return req;
}

function buildResParameter(overrides = {}) {
  const res = {
    json: jest.fn(() => res).mockName('json'),
    status: jest.fn(() => res).mockName('status'),
    ...overrides,
  };
  return res;
}

function buildNextParameter(impl) {
  return jest.fn(impl).mockName('next');
}

export { buildReqParameter, buildResParameter, buildNextParameter };
