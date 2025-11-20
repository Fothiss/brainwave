FROM node:18-alpine

WORKDIR /app/fort

ARG NEXT_PUBLIC_BACKEND_URL
ENV NEXT_PUBLIC_BACKEND_URL=$NEXT_PUBLIC_BACKEND_URL

COPY fort/package*.json ./
RUN npm install

COPY fort/ .

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
