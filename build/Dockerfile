
FROM node:20

RUN chmod 777 /home

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workspace

CMD ["/entrypoint.sh"]
