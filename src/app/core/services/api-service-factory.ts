import { Service } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EndpointConfig {
    url: string;
}   

@Service()
export class ApiServiceFactory {

    private readonly baseUrl = environment.apiUrl;

    create(apiPath: string): EndpointConfig {
        return {
            url: `${this.baseUrl}${apiPath}`
        };
    }
}
