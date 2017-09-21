#
# DonKult/dotPageMod
#
# VERSION       :0.1.0
# BUILD         :docker build -t donkult/dotpagemod .
# RUN           :docker run --rm -it -v /mnt:/mnt donkult/dotpagemod
# RESULT        :/mnt/dotPageMod/dotpagemod.xpi

FROM debian:stretch

ENV LC_ALL C
ENV DEBIAN_FRONTEND noninteractive

RUN apt-get update \
    && apt-get upgrade -qq \
    && apt-get install -qq git zip pandoc make

RUN apt-get --purge -y autoremove \
    && apt-get clean \
    && find /var/lib/apt/lists -type f -delete

CMD cd /mnt \
    && git clone https://github.com/DonKult/dotPageMod.git \
    && cd dotPageMod/ \
    && make
