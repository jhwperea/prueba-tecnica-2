import cron from 'node-cron';

const registeredTasks = [];
const cronJobs = [

];

const wrapHandler = (job) => async () => {
  try {
    await job.handler();
  } catch (error) {
    console.error(`[cron:${job.name}]`, error);
  }
};

export const startCronJobs = () => {
  if (process.env.NODE_ENV === 'development') {
    console.info('[cron] Los jobs están deshabilitados en el entorno de desarrollo.');
    return;
  }

  if (!cronJobs.length) {
    console.info('[cron] No hay jobs registrados.');
    return;
  }

  cronJobs.forEach((job) => {
    const task = cron.schedule(
      job.schedule,
      wrapHandler(job),
      {
        timezone: 'UTC',
        ...job.options,
      }
    );

    registeredTasks.push(task);
    console.log(`[cron] Programado ${job.name} (${job.schedule}).`);

    if (job.runOnInit) {
      void job.handler();
    }
  });
};

export const stopCronJobs = () => {
  registeredTasks.forEach((task) => task.stop());
  registeredTasks.length = 0;
  console.log('[cron] Todos los jobs se detuvieron.');
};
