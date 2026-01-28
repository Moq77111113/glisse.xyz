type Task<T> = () => Promise<T>;

export function createTaskQueue() {
  let currentTask: Promise<unknown> = Promise.resolve();
  let queueSize = 0;

  const enqueue = <T>(task: Task<T>): Promise<T> => {
    queueSize++;
    const result = currentTask
      .then(() => task())
      .finally(() => {
        queueSize--;
      });
    currentTask = result.catch(() => {});
    return result;
  };

  const size = () => queueSize;

  const clear = () => {
    currentTask = Promise.resolve();
    queueSize = 0;
  };

  return { enqueue, size, clear };
}
