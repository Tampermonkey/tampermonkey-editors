
# package.json has: "node": ">=18 <19",
FROM node:18

RUN chmod 777 /home

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

WORKDIR /workspace

CMD ["/entrypoint.sh"]
