import type { Core } from '@strapi/strapi';

const clientOrigins = [
  'http://localhost:5173', // 로컬 개발
];

// 프로덕션 클라이언트 URL (환경변수로 설정)
if (process.env.CLIENT_URL) {
  clientOrigins.push(process.env.CLIENT_URL);
}

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  {
    name: 'strapi::cors',
    config: {
      origin: clientOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
