# Imagen base
FROM node:20

# Carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar todo el proyecto
COPY . .

# Puerto interno (NO se expone al host)
EXPOSE 3001

# Comando de inicio
CMD ["npm", "start"]