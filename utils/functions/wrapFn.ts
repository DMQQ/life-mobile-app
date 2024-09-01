export default function wrapWithFunction(originalFn: (...rest: any) => any, additionalFn: (...rest: any) => any) {
  return function (...args: any[]) {
    additionalFn(...args);
    return originalFn(...args);
  };
}
