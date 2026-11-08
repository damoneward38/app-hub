FROM node:22-alpine
ENV NODE_ENV=production PORT=8780
WORKDIR /app
COPY --chown=node:node package.json server.js ./
COPY --chown=node:node public ./public
USER node
EXPOSE 8780
HEALTHCHECK --interval=20s --timeout=3s --start-period=5s --retries=3 CMD node -e "fetch('http://127.0.0.1:8780/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "server.js"]
