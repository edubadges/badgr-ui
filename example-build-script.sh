#!/bin/bash

#############################################################################
# EXAMPLE BUILD SCRIPT
# COLOURS AND MARKUP
#############################################################################

red='\033[0;31m'            # Red
green='\033[0;49;92m'       # Green
yellow='\033[0;49;93m'      # Yellow
white='\033[1;37m'          # White
grey='\033[1;49;30m'        # Grey
nc='\033[0m'                # No color

clear
cd /var/docker/edubadges-ui/edubadges/

echo -e "${yellow}
# Copying badgr-ui directory to badgr-ui-old
#############################################################################${n
c}"
rm -rf badgr-ui-old/
mv badgr-ui badgr-ui-old
echo -e "${green}Done....${nc}"
sleep 3

echo -e "${yellow}
# Cloning badgr-ui code (branch master)
#############################################################################${n
c}"
git clone --single-branch -b master https://github.com/edubadges/badgr-ui
cd /var/docker/edubadges-ui/edubadges/badgr-ui
git status
echo -e "${green}Done....${nc}"
sleep 5

echo -e "${yellow}
# Copying the config file config.js
#############################################################################${n
c}"
cp /var/docker/edubadges-ui/config/edubadges/config.local.js /var/docker/edubadg
es-ui/edubadges/badgr-ui/src/config.js
echo -e "${green}Done....${nc}"
sleep 3

echo -e "${yellow}
# Build the docker image
#############################################################################${n
c}"
cd /var/docker/edubadges-ui
docker-compose build
echo -e "${green}Done....${nc}"
sleep 3

echo -e "${yellow}
# Bring the docker container up
#############################################################################${n
c}"
docker-compose up -d
docker ps -a
echo -e "${green}Ready!${nc}"