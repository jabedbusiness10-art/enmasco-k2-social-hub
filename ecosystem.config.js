// TASK-59.4 — PM2 process definition (no-Docker alternative).
//   pm2 start ecosystem.config.js
// Boots web + worker + scheduler as managed processes with log rotation.
module.exports = {
  apps: [
    {
      name: "k2kai-web",
      script: "node_modules/next/dist/bin/next",
      args: "start -p 3000",
      instances: "max",
      exec_mode: "cluster",
      env: { NODE_ENV: "production" },
      node_args: "-r dotenv/config",
      max_memory_restart: "1G",
      exp_backoff_restart_delay: 100,
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "k2kai-worker",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "server/queue-worker.ts",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", ROLE: "worker" },
      node_args: "-r dotenv/config",
      max_memory_restart: "1G",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
    {
      name: "k2kai-scheduler",
      script: "node_modules/tsx/dist/cli.mjs",
      args: "server/scheduler.ts",
      instances: 1,
      exec_mode: "fork",
      env: { NODE_ENV: "production", ROLE: "scheduler" },
      node_args: "-r dotenv/config",
      max_memory_restart: "512M",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
