FROM node:18-alpine

WORKDIR /app/fort

COPY fort/package*.json ./

RUN npm install
COPY fort/ .

ENV NEXT_PUBLIC_BACKEND_URL=http://95.215.56.225:8000

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
