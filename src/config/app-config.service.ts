import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  get(key: string, fallback?: string): string {
    return process.env[key] ?? fallback ?? '';
  }
}
