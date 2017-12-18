import { Injectable, forwardRef, Inject } from "@angular/core";
import { IssuerApiService } from "./issuer-api.service";
import { Issuer } from "../models/issuer.model";
import { ApiIssuerForCreation, ApiIssuerForEditing, IssuerSlug, ApiIssuer } from "../models/issuer-api.model";
import { Observable } from "rxjs/Observable";
import { StandaloneEntitySet } from "../../common/model/managed-entity-set";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";

@Injectable()
export class IssuerManager {
	issuersList = new StandaloneEntitySet<Issuer, ApiIssuer>(
		apiModel => new Issuer(this.commonEntityManager),
		apiModel => apiModel.json.id,
		() => this.issuerApiService.listIssuers()
	);

	constructor(
		public issuerApiService: IssuerApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) { }
	
	createIssuer(
		initialIssuer: ApiIssuerForCreation
	): Promise<Issuer> {
		return this.issuerApiService.createIssuer(initialIssuer)
			.then(newIssuer => this.issuersList.addOrUpdate(newIssuer))
	}

	get allIssuers$(): Observable<Issuer[]> {
		return this.issuersList.loaded$.map(l => l.entities);
	}

	editIssuer(
		issuerSlug: IssuerSlug,
		initialIssuer: ApiIssuerForEditing
	): Promise<Issuer> {
		return this.issuerApiService.editIssuer(issuerSlug, initialIssuer)
			.then(newIssuer => this.issuersList.addOrUpdate(newIssuer))
	}

	issuerBySlug(issuerSlug: IssuerSlug): Promise<Issuer> {
		return this.allIssuers$.first().toPromise().then(issuers =>
			issuers.find(i => i.slug == issuerSlug)
			|| this.throwError(`Issuer Slug '${issuerSlug}' not found`)
		);
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}