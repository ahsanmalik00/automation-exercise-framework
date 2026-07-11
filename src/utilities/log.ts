import { env } from './env';
import { Logger } from './logger';

/** Project-wide logger instance, configured from LOG_LEVEL (default "info"). */
export const log = new Logger(env.logLevel);
