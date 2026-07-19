import { loadEnvConfig } from "@next/env";
import { logEnvReport, validateEnv } from "../lib/env/validate";

loadEnvConfig(process.cwd());

logEnvReport();
if (!validateEnv().ok) process.exitCode = 1;
