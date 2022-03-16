import {MissingTranslationHandler, MissingTranslationHandlerParams} from '@ngx-translate/core';
import {environment} from '../environments/environment';

export class TranslateHandler implements MissingTranslationHandler {
  private response = '';
  handle(params: MissingTranslationHandlerParams) {
    if (!environment.production) {
      console.error(`No Translation! Key: ${params.key}, Lang: ${params.translateService.currentLang}`);
    }
    return this.response;
  }
}