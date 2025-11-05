module.exports = {
  apps: [
    {
      script: "index.js",
      node_args: '--openssl-legacy-provider',
      watch: ".",
      instances: "max",
      exec_mode: "cluster",
      cron_restart: "0 0 * * *",
      out_file: "logs/pm2_logs",
      error_file: "logs/pm2_error",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
