const Session = require('../models/Session');
const config = require('../config');

class SessionCleanupService {

  constructor() {
    this.cleanupInterval = null;
    this.isRunning = false;
  }

  start(intervalMs = null) {
    if (this.isRunning) {
      console.log('Session cleanup service is already running');
      return;
    }

    const interval = intervalMs || this.parseInterval(config.SESSION_CLEANUP_INTERVAL || '24h');

    console.log(`Starting session cleanup service with ${interval}ms interval`);

    this.cleanup();

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, interval);

    this.isRunning = true;
  }

  stop() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.isRunning = false;
    console.log('Session cleanup service stopped');
  }

  async cleanup() {
    try {
      console.log('Running session cleanup...');

      const result = await Session.cleanupInactiveSessions();

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} expired/inactive sessions`);
      } else {
        console.log('No sessions to clean up');
      }

      await this.cleanupInactiveSessions();

    } catch (error) {
      console.error('Session cleanup failed:', error);
    }
  }

  async cleanupInactiveSessions() {
    try {
      const inactivityThreshold = new Date(Date.now() - (60 * 24 * 60 * 60 * 1000));

      const result = await Session.deleteMany({
        lastActivity: { $lt: inactivityThreshold },
        autoExtend: false
      });

      if (result.deletedCount > 0) {
        console.log(`Cleaned up ${result.deletedCount} long-inactive sessions`);
      }
    } catch (error) {
      console.error('Inactive session cleanup failed:', error);
    }
  }

  parseInterval(interval) {
    const units = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    };

    const match = interval.match(/^(\d+)([smhd])$/);
    if (!match) return 24 * 60 * 60 * 1000;

    const [, value, unit] = match;
    return parseInt(value) * units[unit];
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMs: this.cleanupInterval ? this.parseInterval(config.SESSION_CLEANUP_INTERVAL || '24h') : null,
      nextCleanup: this.isRunning ? new Date(Date.now() + this.parseInterval(config.SESSION_CLEANUP_INTERVAL || '24h')) : null
    };
  }

  async forceCleanup() {
    console.log('Forcing immediate session cleanup...');
    await this.cleanup();
    return this.getStatus();
  }
}

module.exports = new SessionCleanupService();
