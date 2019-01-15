import { Injectable } from "@angular/core";
import { BaseHttpApiService } from "../../app/common/services/base-http-api.service";

@Injectable()
export class ThemeManager extends BaseHttpApiService {


	getCurrentTheme(){
		let domain = window.location.hostname;
		return this.get('/v2/theme/'+domain)
			.then(r => r.json());
	}


}