export const allTrue = (pred: boolean[]) => pred.reduce((st, value) => st && value, true);

export const anyTrue = (pred: boolean[]) => pred.reduce((st, value) => st || value, false);

export const any = <T>(fn: (p: T) => boolean, data: T[]) => anyTrue(data.map(fn));

export const all = <T>(fn: (p: T) => boolean, data: T[]) => allTrue(data.map(fn));
