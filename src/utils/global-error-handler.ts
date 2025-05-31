export function terminateProcess(message, code = 1) {
  console.error(message);
  process.exit(code);
}
