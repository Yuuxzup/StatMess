import { enableProdMode } from '@angular/core';

import { environment } from './environments/environment.prod';

if (environment.production) {
  enableProdMode();
}

export { AppServerModule } from './app/app.server.module';
