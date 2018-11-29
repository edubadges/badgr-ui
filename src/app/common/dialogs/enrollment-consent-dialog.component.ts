import { Component, ElementRef, Renderer2 } from "@angular/core";

import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';

@Component({
	selector: 'enrollment-consent-dialog',
	template: `
    <dialog class="dialog dialog-large dialog-confirm">
        <header class="heading heading-small l-container">
					<div class="heading-x-text">
						<markdown-display value="{{options.dialogBody}}">  </markdown-display>
					</div>
        </header>
        <div class="l-childrenhorizontal l-childrenhorizontal-right l-container">
            <button class="button button-primaryghost" 
                    (click)="closeDialog(false)">{{ options.rejectButtonLabel }}</button>
            <button class="button" (click)="closeDialog(true)">{{ options.resolveButtonLabel }}</button>
        </div>
    </dialog>
    `,
})
export class EnrollmentConsentDialog extends BaseDialog {
		
	static defaultOptions = {
		rejectButtonLabel: "Ik geef geen toestemming",
		resolveButtonLabel: "Ik geef toestemming",
		showCloseBox: true,
		showRejectButton: true
	}

	options = EnrollmentConsentDialog.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: () => void;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private configService: SystemConfigService,
		componentElem: ElementRef,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
	}

	openConsentDialog(): Promise<void> {

	let options = {dialogBody:"## Toestemmingsverklaring aanvragen badge\n" +  
														"Om deze badge aan te vragen worden enkele persoonsgegevens verwerkt. In deze toestemmingsverklaring kun je hier alles over lezen en kun je toestemming geven voor de verwerking van deze persoonsgegevens.\n" +
														"#### Aanvragen badge\n" +
														"Zodra je deze badge aanvraagt en akkoord gaat met deze toestemmingsverklaring worden het eduID als identifier, jouw voornaam, achternaam en e-mailadres opgeslagen en gekoppeld aan de inschrijving. De aanvraag bestaat verder uit het tijdstip van de aanvraag en of je akkoord bent gegaan met deze toestemmingsverklaring.\n" +
														"#### Toekennen en aanmaken badge\n" +
														"Als je hebt voldaan aan de vereisten van deze badge dan kan de onderwijsinstelling de badge aan jou toekennen. Bij toekenning wordt een persoonsgebonden badge aangemaakt. In deze badge worden jouw voornaam, achternaam, e-mailadres en het eduID als identifier opgeslagen.\n" +
														"Tot slot kan de onderwijsinstelling aanvullend bewijs toevoegen aan de badge. Bijvoorbeeld een link naar een publicatie of een korte tekst.\n" +
														"#### Toestemming intrekken\n" +
														"Wil je de gegeven toestemming weer intrekken? Dit kun je melden in een e-mail gericht aan info@edubadges.nl. Binnen drie werkdagen zal contact worden opgenomen om de verdere procedure af te stemmen.\n" +
														"#### Meer informatie\n" +
														"Wil je meer weten over de verwerking van je persoonsgegevens, hoe we deze beschermen en welke rechten je hebt? Kijk dan in de [Privacyverklaring]("+this.currentTheme.privacyPolicyLink+").\n\n" +
														"###Toestemming###\n" +
														"Ik geef hierbij toestemming om mijn persoonsgegevens te verwerken voor het  aanvragen en toekennen van deze badge."
													}
	this.options = Object.assign(this.options, options)

		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open."));
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog(result: boolean) {
		this.closeModal();

		if (result) {
			this.resolveFunc();
		} else {
			this.rejectFunc();
		}
	}

}
