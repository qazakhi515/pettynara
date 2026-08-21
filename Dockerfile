# ---------- 1-bosqich: TypeScript'ni kompilyatsiya qilish ----------
FROM node:20-alpine AS build
WORKDIR /app

# package fayllarini alohida ko'chiramiz: kod o'zgarganda ham
# npm ci qayta ishlamaydi, Docker keshdan oladi (build ancha tez)
COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npx tsc

# tsc FAQAT .ts fayllarni kompilyatsiya qiladi. EJS view'lar va admin
# panelning css/js/img fayllari dist ga o'zi ko'chmaydi, app.ts esa
# ularni __dirname (ya'ni dist) ichidan qidiradi — qo'lda ko'chiramiz.
RUN cp -r src/views dist/views && cp -r src/public dist/public

# ---------- 2-bosqich: faqat ishga tushirish uchun kerakli qism ----------
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# devDependencies (typescript, nodemon, @types/*) kerak emas —
# tayyor image kichikroq va xavfsizroq bo'ladi
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

# uploads shu yerga volume sifatida ulanadi.
# app.ts da express.static("./uploads") — NISBIY yo'l, ya'ni WORKDIR ga
# bog'liq. WORKDIR /app bo'lgani uchun volume /app/uploads ga ulanadi.
EXPOSE 3003
CMD ["node", "dist/server.js"]
