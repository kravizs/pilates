import { knex, Knex } from 'knex';
import { logger } from '@/utils/logger';

// Pull credentials from environment (avoid hard-coding so .env changes take effect)
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
const dbUser = process.env.DB_USER || 'postgres';
const dbPassword = process.env.DB_PASSWORD || '';
const dbName = process.env.DB_NAME || 'postgres';

const config: Knex.Config = {
  client: 'postgresql',
  connection: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    ssl: false,
    connectionTimeout: 60000,
  },
  migrations: {
    directory: './migrations',
    extension: 'ts',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds',
    extension: 'ts'
  },
  pool: {
    min: 0,  // Start with 0, create connections as needed
    max: 5,  // Reduce max connections
    acquireTimeoutMillis: 30000,  // Reduced timeout
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 300000,  // 5 minutes
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200,
    propagateCreateError: true  // Change to true to see errors
  },
  acquireConnectionTimeout: 30000,  // Reduced timeout
  debug: process.env.NODE_ENV === 'development'
};

export let db = knex(config);

export async function connectDatabase(): Promise<void> {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      logger.info(`🔗 Database connection attempt ${attempt}/${maxRetries}`);
  logger.info(`   Host: ${dbHost}`);
  logger.info(`   Database: ${dbName}`);
  logger.info(`   User: ${dbUser}`);
  logger.info(`   Password set: ${dbPassword ? 'yes' : 'NO'}`);
      
      const start = Date.now();
      
      // Test the connection
  await db.raw('SELECT 1 as connected');

  // Diagnostics: fetch version & current user
  const diag = await db.raw("SELECT current_database() as db, current_user as user, version() as version");
  const row = (diag as any).rows ? (diag as any).rows[0] : (diag as any)[0];
  logger.info(`   Connected DB: ${row?.db} | user: ${row?.user}`);
      
      const ms = Date.now() - start;
      logger.info(`✅ Database connected successfully in ${ms}ms`);
      return;
      
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt} failed:`, {
        error: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        host: dbHost,
        port: dbPort,
        database: dbName
      });

      if (attempt === maxRetries) {
        // Last attempt - try localhost fallback if applicable
    if ((dbHost === 'postgres' || dbHost === 'db') 
            && process.env.NODE_ENV !== 'production') {
          
          logger.warn('🔄 Trying localhost fallback...');
          
          // Destroy existing connection
          await db.destroy();
          
          // Create new connection with localhost
          const fallbackConfig = {
            ...config,
            connection: {
              ...(config.connection as any),
              host: '127.0.0.1'
            }
          };
          
          db = knex(fallbackConfig);
          
          try {
            await db.raw('SELECT 1 as connected');
            logger.info('✅ Database connected via localhost fallback');
            return;
          } catch (fallbackError) {
            logger.error(
              '❌ Localhost fallback failed:',
              fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
            );
            throw new Error(`Database connection failed after ${maxRetries} attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          throw new Error(`Database connection failed after ${maxRetries} attempts. Last error: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        logger.info(`⏳ Waiting ${retryDelay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('🔄 Closing database connection...');
  await db.destroy();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('🔄 Closing database connection...');
  await db.destroy();
  process.exit(0);
});

export default config;