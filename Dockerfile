FROM alpine:3.22

# Install pinned versions for reproducibility
RUN apk add --no-cache \
      bash=5.2.37-r0 \
      nodejs=22.16.0-r2 \
      npm=11.3.0-r0
      # yarn=1.22.22-r1

# Workdir
RUN mkdir -p /app
WORKDIR /app

# Node.js dependencies
COPY .yarnrc.yml /app/
COPY package.json /app/
COPY yarn.lock /app/
RUN corepack enable
RUN yarn install

# Scripts
COPY server.js /app/
COPY lodash.js /app/
COPY USAGE.md /app/

# Run the main script by default
CMD ["node", "/app/server.js"]
