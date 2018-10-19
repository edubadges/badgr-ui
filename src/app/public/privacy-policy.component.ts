import {Component} from "@angular/core";
@Component({
  template: `
  
  <style>
  h1 {
    font-size: 29px;
    margin: 0px 0px 30px 0px;
  }
  h2 {
    font-size: 26px;
    margin: 20px 0px 20px 0px;
  }
  h3 {
    font-size: 23px;
    margin: 15px 0px 15px 0px;
  }
  h4 {
    font-size: 20px;
    margin: 15px 0px 15px 0px;
  }
  li {
    list-style-type: square;
    list-style-position: inside;
    padding-left: 30px;
    margin: 5px 0px 5px 0px;
  }
  span, li, table {
    color: #6c6b80;
    font-family: "Open Sans", sans-serif;
    line-height: 130%;
  }
  table {
    width: 100%;
  	border-width: 1px;
  	border-color: #a9c6c9;
  	border-collapse: collapse;
    margin: 10px 0px 10px 0px;
  }
  table th {
    font-size: 20px;
  	border-width: 1px;
  	padding: 8px;
  	border-style: solid;
  	border-color: #a9c6c9;
  }
  table td {
  	border-width: 1px;
  	padding: 8px;
  	border-style: solid;
  	border-color: #a9c6c9;
  }  
  </style>
  
  <div class="wrap wrap-light l-containerhorizontal">
    <br><br><br>
    <h1>
      Privacyverklaring Edubadges
    </h1>
    <span>
    Goed dat je de privacyverklaring voor de Pilot Edubadges bekijkt! Het Team Edubadges van SURFnet heeft veel aandacht besteed aan de bescherming van jouw persoonsgegevens en hier kun je daar alles over lezen. Als er tijdens het lezen van deze privacyverklaring toch nog vragen of zorgen zijn, stuur dan gerust een e-mail naar info@edubadges.nl of neem contact op met je eigen onderwijsinstelling.
    </span>
    <h2>
    1 Introductie Edubadges
    </h2>
    <span>
    Een badge is een digitaal insigne (afbeelding), dat aantoont dat de ontvanger over bepaalde kennis of vaardigheden beschikt. De ontvanger van een badge kan deze delen met anderen, bijvoorbeeld op social media, een digitaal cv of met een (potentiële) werkgever. De Pilot Edubadges faciliteert onderwijsinstellingen, studenten en medewerkers om te experimenteren met deze badges.
    </span>
    <span>
    Meer informatie over Edubadges is te vinden op 
    </span>
      <a href="https://www.surf.nl/innovatieprojecten/onderwijsinnovatie-met-ict/edubadges-en-microcredentialing.html">deze </a>
    <span>
     website.
    </span>
    
    <h2 >
      2 Persoonsgegevens
    </h2 >
    <h3>
      Welke gegevens gebruiken we en waarom?
    </h3>
    <span>
    Onderwijsinstellingen die binnen de doelgroep van SURFnet vallen zijn in 2018 in de gelegenheid gesteld om deel te nemen aan de Pilot Edubadges. De onderwijsinstelling stelt binnen deze pilot eigen doelstellingen vast rond het gebruik van Edubadges en is in het kader van de Algemene verordening gegevensbescherming (AVG) de verwerkingsverantwoordelijke. SURFnet voorziet in de technische infrastructuur rondom Edubadges en treedt in het kader van de AVG op als verwerker.
    Voor de werking van Edubadges en het inschrijven, uitgeven en ontvangen van badges zijn verschillende persoonsgegevens vereist. Omdat de Pilot Edubadges een optioneel karakter heeft, wordt voor bijna alle persoonsgegevens toestemming gevraagd. Alle persoonsgegevens worden uitsluitend gebruikt voor Edubadges.
    Wil je de gegeven toestemming weer intrekken? Dit kun je melden in een e-mail gericht aan info@edubadges.nl. Binnen drie werkdagen zal contact worden opgenomen om de verdere procedure af te stemmen. Na intrekken van de toestemming zullen alle badges en persoonsgegevens van jou verwijderd worden.
    </span>
    <h4>
      Studenten
    </h4>
    <span>
    In de tabel hieronder zijn de verwerkte persoonsgegevens met bijbehorend(e) doel(en) en grondslag opgenomen.
    </span>
    <br>
    <table>
      <tr>
        <th>Persoonsgegeven</th>
        <th>Doel</th>
        <th>Grondslag</th>
      </tr>
      <tr>
        <td>Voornaam</td>
        <td>Identificatie bij Badgeuitgifte</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Achternaam</td>
        <td>Identificatie bij Badgeuitgifte	Toestemming</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>E-mailadres	</td>
        <td>Melding over uitgegeven badges en serviceberichten</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>EduID</td>
        <td>Mogelijk maken uitwisselbaarheid tussen onderwijsinstellingen</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>EntityID</td>
        <td>Technisch noodzakelijk uniek databasenummer	</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Toestemming</td>
        <td>Of er toestemming gegeven is: verplicht bij toestemming als grondslag	Toestemming</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Badgeclass</td>
        <td>Nodig voor inschrijving bij badge</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>IP-adres</td>
        <td>Beschikbaarheid Edubadges en misbruik achterhalen. Belang SURFnet voor beschikbaarheid en beveiliging weegt zwaarder dan belang betrokkene.</td>
        <td>Gerechtvaardigd belang</td>
      </tr>
    </table>
    <h4>
      Medewerkers
    </h4>
    <table>
      <tr>
        <th>Persoonsgegeven</th>
        <th>Doel</th>
        <th>Grondslag</th>
      </tr>
      <tr>
        <td>E-mailadres</td>
        <td>Melding over badges en serviceberichten en extra identifier</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Persistent NameID</td>
        <td>Unieke identifier voor medewerkers</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>EntityID</td>
        <td>Technisch noodzakelijk uniek databasenummer	</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Toestemming</td>
        <td>Of er toestemming gegeven is: verplicht bij toestemming als grondslag</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Organisatie</td>
        <td>Koppelen medewerker aan instelling/faculteit/opleiding/badgeclass</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>Faculteit</td>
        <td>Koppelen medewerker aan faculteit/opleiding/badgeclass</td>
        <td>Toestemming</td>
      </tr>
      <tr>
        <td>IP-adres</td>
        <td>Beschikbaarheid Edubadges en misbruik achterhalen	</td>
        <td>Gerechtvaardigd belang</td>
      </tr>
    </table>
    <h3>
      Hoe lang gebruiken we je gegevens?
    </h3>
    <span>
      De Pilot Edubadges loopt tot en met 31 december 2020. Binnen twee weken na afloop van de Pilot Edubadges zullen alle persoonsgegevens worden verwijderd of wordt er opnieuw om toestemming gevraagd.
    </span>
    <h3>
      Aan wie verstrekken we de gegevens?
    </h3>
    <span>
      Medewerkers van jouw onderwijsinstelling hebben toegang tot voornaam, achternaam en e-mailadres. SURFnet heeft toegang tot alle persoonsgegevens. De persoonsgegevens worden niet aan andere derde partijen verstrekt.
    </span>
    <h2 >
      3 Beveiliging
    </h2 >
    <span>
      Onder andere de volgende veiligheidsmaatregelen zijn getroffen om de persoonsgegevens te beschermen:
    </span>
    <ul>
      <li>
      Communicatie tussen systemen is versleuteld conform moderne standaarden en best practices.
      </li>
      <li>
      De toegang tot servers is beveiligd conform moderne beveiligingsstandaarden en best practices.
      </li>
      <li>
      Alle fysieke en virtuele servers en data bevinden zich in SURFnetdatacentrums in Nederland. Fysieke toegang tot de servers en opslagapparatuur is beperkt tot personeel van SURFnet en diens housingpartners.
      </li>
      <li>
      Alle Edubadgesystemen en -software worden up to date gehouden.
      </li>
      <li>
      Alle data op de pilotomgeving wordt dagelijks gebackupt.
      </li>
      <li>
      Alle servers in de Pilot Edubadges zijn beschermd met een restrictieve firewall in het besturingssysteem of container.
      </li>
      <li>
      Alle handelingen binnen het besturingssysteem worden gelogd.
      </li>
      <li>
      De webserver maakt gebruik van een geharde configuratie en security headers.
      </li>
      <li>
      De rollen in Edubadges voor medewerkers zijn beperkt tot een scope die geen onnodige persoonsgegevens laat zien.
      </li>
    </ul>
    <h2 >
      4 Je rechten met betrekking tot je (persoons)gegevens
    </h2 >
    <span>
      Je hebt de volgende rechten met betrekking tot je persoonsgegevens:
    </span>
    <ul>
      <li>
      Je kunt een verzoek indienen tot wijziging, aanvulling of verwijdering van je gegevens wanneer deze onjuist of niet (meer) relevant zijn.
      </li>
      <li>
      Je kunt een verzoek indienen om inzage te verkrijgen in de gegevens die we van jou verwerken.
      </li>
      <li>
      Je kunt bezwaar maken tegen verwerking van je gegevens, als we je gegevens verwerken op basis van een eigen gerechtvaardigd belang of op basis van de uitvoering van een taak van algemeen belang.
      </li>
      <li>
      Je kunt een verzoek indienen tot beperking van de verwerking van je gegevens ten aanzien van de verwerking van gegevens waartegen je bezwaar hebt gemaakt, die je onrechtmatig acht, waarvan je de juistheid van de persoonsgegevens hebt betwist of wanneer we de persoonsgegevens niet meer nodig hebben, maar je ze nodig hebt in het kader van een rechtsvordering.
      </li>
      <li>
      Je kunt een overzicht, in een gestructureerde en gangbare vorm opvragen van de gegevens die we van jou verwerken en je hebt het recht op overdraagbaarheid van deze gegevens naar een andere dienstverlener.
      </li>
      <li>
      Je kunt de door jou gegeven toestemming voor het verwerken van je persoonsgegevens intrekken. Het intrekken van je toestemming doet echter geen afbreuk aan de rechtmatigheid van de verwerking op basis van je toestemming vóór de intrekking daarvan.
      </li>
      <li>
      Als je van mening bent dat SURF niet goed omgaat met je persoonsgegevens kun je een klacht indienen bij SURF. Als jij en SURF er echter niet samen uitkomen en het antwoord van SURF op je klacht niet leidt tot een acceptabel resultaat, heb je het recht om een klacht over SURF in te dienen bij de Autoriteit Persoonsgegevens. Meer informatie over de Autoriteit Persoonsgegevens en het indienen van klachten vind je op www.autoriteitpersoonsgegevens.nl.
      </li>
    </ul>
    <span>
      Om deze rechten uit te kunnen oefenen, kun je contact opnemen met info@edubadges.nl of je eigen onderwijsinstelling.
    </span>
    <h2 >
      5 Wijziging privacyverklaring
    </h2 >
    <span>
    Er kunnen wijzigingen worden aangebracht in deze privacyverklaring. We raden je daarom aan om deze privacyverklaring geregeld te raadplegen.
    </span>
    <br><br><br>
  </div>
  `
})
export class PublicPrivacyPolicyComponent{}