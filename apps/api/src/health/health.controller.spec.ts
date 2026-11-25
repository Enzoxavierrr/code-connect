import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('returns ok with uptime and ISO timestamp', () => {
    const result = new HealthController().check();
    expect(result.status).toBe('ok');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
