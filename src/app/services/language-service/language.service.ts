import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class LanguageService {
  constructor(private translate: TranslateService) {}
  setInitialAppLanguage() {
    let language = this.translate.getBrowserLang();
    this.translate.setDefaultLang(language);
  }

  getLanguages() {
    return [{ text: "English", value: "en" }];
  }

  setLanguage(lng){
    this.translate.use(lng);
  }
}
