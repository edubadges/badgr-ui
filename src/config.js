const queryParams = location.search.substr(1).split("&")
    .filter(function(p) { return p.length > 0 })
    .map(function(p) { return p.split('=').map(decodeURIComponent) })
    .reduce(function(o, p) { o[p[0]]=p[1]; return o; }, {});

window.config = {
    api: {
        baseUrl: "http://localhost:8000",
        integrationEndpoints: ['/v1/badgebook/integrations']
    },
    help: {
        email: "info@edubadges.nl"
    },
    features: {
        pathwayGraph: true,
        alternateLandingRedirect: false,
        socialAccountProviders: ["surf_conext", "edu_id"],
        socialAccountProviderUrls: {"edu_id": "https://pilot.eduid.nl"}
    },
};
