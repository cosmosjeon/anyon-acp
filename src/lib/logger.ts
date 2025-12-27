/**
 * Centralized logging utility with development/production mode support
 *
 * In production, only warnings and errors are logged to avoid console clutter.
 * In development, all log levels are enabled.
 */

// type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

const isDevelopment = import.meta.env.DEV;

class Logger {
  private prefix: string;

  constructor(prefix: string = '') {
    this.prefix = prefix;
  }

  private formatMessage(...args: any[]): any[] {
    if (this.prefix) {
      return [`[${this.prefix}]`, ...args];
    }
    return args;
  }

  /**
   * Log general information (development only)
   */
  log(...args: any[]): void {
    if (isDevelopment) {
      console.log(...this.formatMessage(...args));
    }
  }

  /**
   * Log informational messages (development only)
   */
  info(...args: any[]): void {
    if (isDevelopment) {
      console.info(...this.formatMessage(...args));
    }
  }

  /**
   * Log debug information (development only)
   */
  debug(...args: any[]): void {
    if (isDevelopment) {
      console.debug(...this.formatMessage(...args));
    }
  }

  /**
   * Log warnings (always logged)
   */
  warn(...args: any[]): void {
    console.warn(...this.formatMessage(...args));
  }

  /**
   * Log errors (always logged)
   */
  error(...args: any[]): void {
    console.error(...this.formatMessage(...args));
  }

  /**
   * Create a child logger with an additional prefix
   */
  child(childPrefix: string): Logger {
    const newPrefix = this.prefix ? `${this.prefix}:${childPrefix}` : childPrefix;
    return new Logger(newPrefix);
  }
}

/**
 * Create a logger instance with an optional prefix
 *
 * @example
 * const logger = createLogger('MyComponent');
 * logger.log('Component mounted'); // [MyComponent] Component mounted (dev only)
 * logger.error('Failed to load'); // [MyComponent] Failed to load (always)
 */
export function createLogger(prefix?: string): Logger {
  return new Logger(prefix);
}

/**
 * Default logger instance (no prefix)
 */
export const logger = new Logger();

export default logger;
