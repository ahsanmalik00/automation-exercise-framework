// Small leveled logger. Writes to stderr so it never corrupts Cucumber's
// progress bar on stdout. In parallel runs each line gets a worker id prefix.
// Level comes from LOG_LEVEL; per-step detail lives at debug.

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

  // same logger, but entries get a scope prefix
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
