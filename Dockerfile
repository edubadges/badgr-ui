FROM centos:7
LABEL image="edubadges-ui"
LABEL versie="0.1"
LABEL datum="2019 10 09"

RUN yum install -y sudo curl

# Extras for nodejs (not always needed)
RUN yum install -y gcc-c++ make deltarpm
RUN curl --silent --location https://rpm.nodesource.com/setup_9.x | sudo bash -
RUN sudo yum -y install nodejs

# Set correct timezone - Modify accordingly
RUN ln -sf /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime

# Install extra packages
RUN yum install -y bzip2 fontconfig freetype freetype-devel fontconfig-devel libstdc++
RUN sudo yum -y install epel-release
RUN sudo yum -y install libffi-devel openssl-devel python-pip libjpeg-turbo libjpeg-turbo-devel zlib-devel libpng12 wget
RUN sudo yum -y install supervisor git

# Setup proxyserver
RUN yum -y update && \
    yum -y install epel-release &&\
    yum -y install nginx

ADD config/nginx/nginx.conf /etc/nginx/nginx.conf
RUN touch /var/log/nginx/error.log && \
    touch /var/log/nginx/access.log
COPY config/nginx/certs/ /opt/cert

# Setup config
ADD edubadges/badgr-ui /var/badgr/badgr-ui
ADD config/edubadges/config.local.js /var/badgr/badgr-ui/src/config.js

RUN cd /var/badgr/badgr-ui \
&& npm install \
&& npm run build:prod \
&& cp src/config.js dist \
&& mkdir /opt/site

RUN cd /var/badgr/badgr-ui/dist \
&& cp -r * /opt/site \
&& chown nginx:nginx /opt/site

ADD entrypoint/supervisord.conf /etc/supervisord.conf
EXPOSE 80 443
CMD ["/usr/bin/supervisord"]
