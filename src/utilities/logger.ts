/**
 * Minimal leveled logger for test-lifecycle visibility.
 *
 * - Level is controlled via LOG_LEVEL (silent | error | warn | info | debug),
 *   default "info". Step-by-step detail lives at "debug".
 * - Writes to stderr so output never corrupts Cucumber's progress bar or any
 *   formatter writing to stdout.
 * - In parallel runs each entry is prefixed with the Cucumber worker id so
 *   interleaved lines remain attributable.
 */

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
};

export function parseLogLevel(value: string | undefined): LogLevel {
  const level = (value ?? 'info').toLowerCase();
  if (level in LEVEL_WEIGHT) return level as LogLevel;
  throw new Error(`Unsupported LOG_LEVEL "${value}". Use silent, error, warn, info or debug.`);
}

const useColor = process.stderr.isTTY && !process.env.NO_COLOR;

const ANSI = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
} as const;

export function colorize(color: keyof typeof ANSI, text: string): string {
  return useColor ? `${ANSI[color]}${text}${ANSI.reset}` : text;
}

const LEVEL_TAG: Record<Exclude<LogLevel, 'silent'>, string> = {
  error: 'ERROR',
  warn: 'WARN ',
  info: 'INFO ',
  debug: 'DEBUG',
};

const LEVEL_COLOR: Record<Exclude<LogLevel, 'silent'>, keyof typeof ANSI> = {
  error: 'red',
  warn: 'yellow',
  info: 'cyan',
  debug: 'dim',
};

function timestamp(): string {
  return new Date().toISOString().slice(11, 23); // HH:mm:ss.mmm
}

function workerTag(): string {
  const id = process.env.CUCUMBER_WORKER_ID;
  return id === undefined ? '' : `[w${id}] `;
}

export class Logger {
  constructor(
    private readonly level: LogLevel,
    private readonly scope = '',
  ) {}

  /** Returns a logger whose entries are prefixed with the given scope. */
  child(scope: string): Logger {
    return new Logger(this.level, scope);
  }

  error(message: string): void {
    this.write('error', message);
  }

  warn(message: string): void {
    this.write('warn', message);
  }

  info(message: string): void {
    this.write('info', message);
  }

  debug(message: string): void {
    this.write('debug', message);
  }

  private write(level: Exclude<LogLevel, 'silent'>, message: string): void {
    if (LEVEL_WEIGHT[level] > LEVEL_WEIGHT[this.level]) return;
    const scope = this.scope ? `(${this.scope}) ` : '';
    const line =
      `${colorize('dim', timestamp())} ` +
      `${colorize(LEVEL_COLOR[level], LEVEL_TAG[level])} ` +
      `${workerTag()}${scope}${message}\n`;
    process.stderr.write(line);
  }
}
