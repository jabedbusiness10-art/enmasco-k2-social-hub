// TASK-59.4 / TASK-67 — PM2 process definition (no-Docker alternative).
//   pm2 start ecosystem.config.js
// Boots web + worker + scheduler as managed processes with auto-restart,
// memory limits, and log rotation. All config is read from environment
// (.env.local via `node_args: -r dotenv/config`) — nothing hardcoded.
//
// Log rotation: PM2 writes timestamped logs; pair with `pm2-logrotate`:
//   pm2 install pm2-logrotate
//   pm2 set pm2-logrotate:max_size 10M
//   pm2 set pm2-logrotate:retain 7
// (The `error_file`/`out_file`/`log_rotate` fields below enable built-in
//  rotation too.)
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
      out_file: "logs/k2kai-web-out.log",
      error_file: "logs/k2kai-web-error.log",
      log_rotate: true,
      max_log_size: 10485760, // 10 MB
      retain: 7,
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
      out_file: "logs/k2kai-worker-out.log",
      error_file: "logs/k2kai-worker-error.log",
      log_rotate: true,
      max_log_size: 10485760,
      retain: 7,
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
      out_file: "logs/k2kai-scheduler-out.log",
      error_file: "logs/k2kai-scheduler-error.log",
      log_rotate: true,
      max_log_size: 10485760,
      retain: 7,
    },
  ],
};
