export async function logCpu<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  console.time(label)
  try {
    const result = await fn()
    return result
  } finally {
    console.timeEnd(label)
  }
}

export function generateRequestId(): string {
  return Date.now().toString()
}
