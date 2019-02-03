import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
function normalizePort(val) {
  const p = parseInt(val, 10);

  if (isNaN(p)) {
    // named pipe
    return val;
  }

  if (p >= 0) {
    // port number
    return p;
  }

  return false;
}

const port = normalizePort(process.env.PORT || '3000');
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(port);
}
bootstrap();
