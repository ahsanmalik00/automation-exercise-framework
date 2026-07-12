import { env } from './env';
import { Logger } from './logger';

// Shared logger, level comes from LOG_LEVEL (default info).
export const log = new Logger(env.logLevel);
