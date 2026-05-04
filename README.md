Aquí tienes un archivo README.md diseñado específicamente para tu proyecto DrunkGraph. Está estructurado para que cualquier persona (o tú mismo en el futuro) entienda cómo levantar el entorno y por qué las migraciones funcionan así.

🍺 DrunkGraph - Infraestructura y Migraciones
Este proyecto utiliza Docker para gestionar la base de datos de grafos Neo4j y un sistema de volúmenes para manejar la carga de datos inicial (migraciones) de forma sencilla.

🚀 Requisitos Previos
Docker Desktop (Asegúrate de que el motor esté encendido).

Java 21 (Para ejecutar el backend de Spring Boot).

🐳 Configuración de Docker
El archivo compose.yaml define un contenedor de Neo4j con persistencia de datos y una carpeta de intercambio de archivos.

Estructura de Volúmenes
Para que el sistema funcione, tu carpeta raíz debe verse así:

Plaintext
drunk-graph/
├── import/           # Aquí colocas tus scripts .cypher
│   └── liquidgrapg.cypher
├── data/             # Creada automáticamente (IGNORADA EN GIT)
└── compose.yaml

./import: Se mapea a /var/lib/neo4j/import dentro del contenedor. Es el "puente" para pasar archivos de datos.

./data: Mapeado a /data para que tu base de datos no se borre al apagar Docker.

Levantar el entorno
Desde la terminal en la raíz del proyecto, ejecuta:

PowerShell

docker compose up -d

📑 Migraciones de Datos (Cypher)

En este proyecto, las "migraciones" se manejan mediante archivos .cypher ubicados en la carpeta import/.
Cómo ejecutar una migración
Una vez que el contenedor esté corriendo (estado Running), puedes cargar tu grafo ejecutando el shell de Neo4j directamente en el contenedor:

PowerShell
docker exec -it neo4j cypher-shell -u neo4j -p tu_password -f /var/lib/neo4j/import/liquidgrapg.cypher
¿Qué hace este comando?

docker exec -it neo4j: Entra al contenedor vivo.

cypher-shell: Llama a la herramienta de comandos de Neo4j.

-f: Indica que leerá un archivo en lugar de esperar comandos manuales.

🛠️ Desarrollo con Spring Boot
El backend está configurado en el archivo application.properties para conectarse automáticamente al contenedor:

Protocolo: Bolt (Puerto 7687).

Versión: Spring Boot 4.0.7-SNAPSHOT.

Notas de Seguridad
.gitignore: La carpeta data/ está excluida para evitar subir archivos pesados (>100MB) a GitHub.

JWT: Se utiliza una clave de 256 bits para la firma de tokens en el backend.