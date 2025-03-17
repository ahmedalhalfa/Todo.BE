import { LoggerService } from './logger.service';

export function LogFunction(): MethodDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) => {
    const originalMethod = descriptor.value;
    const className = target.constructor.name;
    const methodName = propertyKey.toString();
    const functionName = `${className}.${methodName}`;

    descriptor.value = async function (...args: any[]) {
      const loggerService = new LoggerService();
      const startTime = Date.now();

      try {
        // Log function input
        loggerService.log(`Function called: ${functionName}`, {
          params: args,
          type: 'Function Input',
        });

        const result = await originalMethod.apply(this, args);
        const executionTime = Date.now() - startTime;

        // Log function output
        loggerService.log(`Function completed: ${functionName}`, {
          result,
          executionTime: `${executionTime}ms`,
          type: 'Function Output',
        });

        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;

        // Log error
        loggerService.error(`Function failed: ${functionName}`, error.stack, {
          params: args,
          error: error.message,
          executionTime: `${executionTime}ms`,
          type: 'Function Error',
        });

        throw error;
      }
    };

    return descriptor;
  };
}
