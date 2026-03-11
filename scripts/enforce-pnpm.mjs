const MIN_PNPM_MAJOR = 10;

function fail(message) {
  console.error(message);
  process.exit(1);
}

const userAgent = process.env.npm_config_user_agent;

if (!userAgent) {
  fail('Unable to detect package manager. Use pnpm >= 10.0.0.');
}

const match = userAgent.match(/^(\w+)\/(\d+)\.(\d+)\.(\d+)/);

if (!match) {
  fail(`Unsupported package manager metadata: ${userAgent}`);
}

const [, manager, major] = match;

if (manager !== 'pnpm') {
  fail('This repository only supports pnpm >= 10.0.0.');
}

if (Number(major) < MIN_PNPM_MAJOR) {
  fail(`Detected ${manager} ${major}.x. Use pnpm >= 10.0.0.`);
}