export async function gatherLimited<T>(
  calls: (() => Promise<T>)[],
  options: { limit?: number; returnExceptions?: boolean } = {}
): Promise<(T | Error)[]> {
  const { limit = 5, returnExceptions = false } = options
  const semaphore = new Semaphore(limit)

  async function run(call: () => Promise<T>): Promise<T | Error> {
    await semaphore.acquire()
    try {
      return await call()
    } catch (error) {
      if (returnExceptions) {
        return error instanceof Error ? error : new Error(String(error))
      }
      throw error
    } finally {
      semaphore.release()
    }
  }

  const promises = calls.map(run)
  return Promise.all(promises)
}

class Semaphore {
  private permits: number
  private waitQueue: (() => void)[] = []

  constructor(permits: number) {
    this.permits = permits
  }

  async acquire(): Promise<void> {
    if (this.permits > 0) {
      this.permits--
      return
    }

    return new Promise((resolve) => {
      this.waitQueue.push(resolve)
    })
  }

  release(): void {
    this.permits++
    if (this.waitQueue.length > 0) {
      this.permits--
      const next = this.waitQueue.shift()
      if (next) next()
    }
  }
}