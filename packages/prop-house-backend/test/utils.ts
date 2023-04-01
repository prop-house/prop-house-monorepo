import { Response } from 'supertest';

export const sleep = async (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const waitUntil = async (time: Date) =>
  new Promise((resolve) =>
    setTimeout(resolve, time.getTime() - new Date().getTime()),
  );

export const parsedBodyTest =
  <T>(test: (r: T) => boolean) =>
  (r: Response) =>
    test(JSON.parse(r.text) as T) || new Error(`Test ${test} failed`);
