import { Injectable } from '@nestjs/common';

@Injectable()
export class ApikeyValidatorService {

  validateApiKey(apikey: string) : boolean { 
    const apikeys = this.getApiKey(); 
     const isFound=  apikeys.includes(apikey);
    return isFound;
  } 

 private getApiKey() : string[]{
    return ['app-909siowurosn901', 'app-3098siowurosn901']
 }
}
