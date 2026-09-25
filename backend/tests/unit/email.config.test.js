import { jest } from '@jest/globals';

const mockCreateTransport = jest.fn().mockReturnValue({
  sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  verify: jest.fn().mockResolvedValue(true)
});

jest.unstable_mockModule('nodemailer', () => ({
  default: {
    createTransport: mockCreateTransport
  }
}));

describe('Email Transport Configuration', () => {
  let emailUtil;
  
  beforeAll(async () => {
    // Import after mocking nodemailer
    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USER = 'test_user';
    process.env.SMTP_PASSWORD = 'test_password';

    const module = await import('../../src/utils/email.js');
    emailUtil = module.default;
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it('1. transporter is configured with pool=true', () => {
    expect(mockCreateTransport).toHaveBeenCalledTimes(1);
    const config = mockCreateTransport.mock.calls[0][0];
    expect(config.pool).toBe(true);
  });

  it('2. maxConnections is limited', () => {
    const config = mockCreateTransport.mock.calls[0][0];
    expect(config.maxConnections).toBeDefined();
    expect(config.maxConnections).toBeLessThanOrEqual(5);
  });

  it('3. maxMessages is configured', () => {
    const config = mockCreateTransport.mock.calls[0][0];
    expect(config.maxMessages).toBeDefined();
  });

  it('4. explicit timeout values are present', () => {
    const config = mockCreateTransport.mock.calls[0][0];
    expect(config.connectionTimeout).toBeDefined();
    expect(config.greetingTimeout).toBeDefined();
    expect(config.socketTimeout).toBeDefined();
  });

  it('5. explicitly configures family: 4 to prevent IPv6 ENETUNREACH', () => {
    const config = mockCreateTransport.mock.calls[0][0];
    expect(config.family).toBe(4);
  });

  it('6. email functions continue using the shared transporter', async () => {
    const transporterMock = mockCreateTransport.mock.results[0].value;
    
    // Call a function
    await emailUtil.verifyEmailTransport();
    expect(transporterMock.verify).toHaveBeenCalled();

    // Call another function to ensure it uses the SAME transporter without creating a new one
    expect(mockCreateTransport).toHaveBeenCalledTimes(1);
  });
});
