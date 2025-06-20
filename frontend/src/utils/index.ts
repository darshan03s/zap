export const isDev = () => import.meta.env.DEV;

export const devLog = (...args: unknown[]) => {
    if (isDev()) {
        console.log(...args);
    }
};

export const devError = (...args: unknown[]) => {
    if (isDev()) {
        console.error(...args);
    }
};
