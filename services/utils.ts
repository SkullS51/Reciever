
/**
 * AZRAEL // UTILITY_SUITE
 * PROTOCOL: DATA_INTEGRITY_ASSURANCE
 */

export const safeStringify = (obj: any, maxDepth: number = 5): string => {
  const cache = new WeakSet();
  
  const serializer = (key: string, value: any, depth: number) => {
    if (depth > maxDepth) return '[MAX_DEPTH_REACHED]';
    
    try {
      if (typeof value === 'object' && value !== null) {
        if (cache.has(value)) {
          return '[Circular]';
        }
        
        // Check for DOM elements and global objects
        if (value.nodeType || value.nodeName || value.constructor?.name === 'HTMLElement' || value.constructor?.name?.includes('Element')) {
          return `[HTMLElement: ${value.nodeName || value.constructor?.name || 'Unknown'}]`;
        }
        if (value === window) return '[Window]';
        if (value === document) return '[Document]';

        // React internals check
        if (key.startsWith('__react') || key.startsWith('__fiber') || key.includes('Fiber')) {
          return '[ReactInternal]';
        }
        
        // FiberNode check (heuristic)
        if (value.stateNode && (value.return || value.child || value.sibling)) {
          return '[FiberNode]';
        }

        cache.add(value);

        // Handle Error objects specifically
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
            cause: value.cause
          };
        }
      }
      return value;
    } catch (e) {
      return '[UNSERIALIZABLE_PROPERTY]';
    }
  };

  try {
    return JSON.stringify(obj, (key, value) => serializer(key, value, 0));
  } catch (e) {
    try {
      return String(obj);
    } catch (finalError) {
      return '[ABSOLUTE_SERIALIZATION_FAILURE]';
    }
  }
};

export const safeString = (val: any): string => {
  if (typeof val === 'string') return val;
  if (val === null || val === undefined) return '';
  try {
    return String(val);
  } catch (e) {
    return '[UNSTRINGIFIABLE_DATA]';
  }
};
