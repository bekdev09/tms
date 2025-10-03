
import cron, { ScheduledTask } from "node-cron";

type JobConfig = {
  schedule: string;
  task: () => Promise<void>;
};

class JobManager {
  private jobs: Map<string, ScheduledTask> = new Map();

  startJob(name: string, config: JobConfig) {
    if (this.jobs.has(name)) {
      console.warn(`Job "${name}" already running`);
      return;
    }

    const scheduledTask = cron.schedule(config.schedule, async () => {
      try {
        await config.task();
      } catch (err) {
        console.error(`Job "${name}" failed:`, err);
      }
    });

    this.jobs.set(name, scheduledTask);
    console.log(`✅ Job "${name}" started with schedule "${config.schedule}"`);
  }

  stopJob(name: string) {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      console.log(`🛑 Job "${name}" stopped`);
    }
  }

  restartJob(name: string, config: JobConfig) {
    this.stopJob(name);
    this.startJob(name, config);
    console.log(`🔄 Job "${name}" restarted`);
  }
}

export const jobManager = new JobManager();
