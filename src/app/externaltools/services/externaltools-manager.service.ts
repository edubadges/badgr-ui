import { Injectable, forwardRef, Inject } from "@angular/core";
import {StandaloneEntitySet} from "../../common/model/managed-entity-set";
import {CommonEntityManager} from "../../entity-manager/common-entity-manager.service";
import {ApiExternalTool, ExternalToolLaunchpointName, ApiExternalToolLaunchpoint, ApiExternalToolLaunchInfo} from "../models/externaltools-api.model";
import {ExternalTool} from "../models/externaltools.model";
import {ExternalToolsApiService} from "./externaltools-api.service";
import { Observable } from "rxjs/Observable";

@Injectable()
export class ExternalToolsManager {
	externaltoolsList = new StandaloneEntitySet<ExternalTool, ApiExternalTool>(
		apiModel => new ExternalTool(this.commonEntityManager),
		apiModel => apiModel.slug,
		() => this.externalToolsApiService.listTools()
	);

	constructor(
		public externalToolsApiService: ExternalToolsApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) { }

	get allExternalTools$(): Observable<ExternalTool[]> {
		return this.externaltoolsList.loaded$.map(l => l.entities);
	}

	getToolLaunchpoints(launchpointName: ExternalToolLaunchpointName): Promise<ApiExternalToolLaunchpoint[]> {
		return this.allExternalTools$.first().toPromise().then(externaltools =>
			externaltools.map(tool => tool.launchpoints[launchpointName] as ApiExternalToolLaunchpoint)
		)
	}

	getLaunchInfo(launchpoint: ApiExternalToolLaunchpoint): Promise<ApiExternalToolLaunchInfo> {
		return this.externalToolsApiService.getLaunchToolInfo(launchpoint);
	}
}
