// vitepress.d.ts
import 'vitepress';

declare module 'vitepress' {
  interface PageData {
    versions?: {
      hash: string;
      timestamp: string;
    }[];
  }
}
