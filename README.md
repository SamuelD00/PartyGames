# Impostor

Una app de juegos de fiesta pensada para un solo dispositivo que se pasa entre los jugadores. Todos se reúnen alrededor de un teléfono — sin cuentas, sin servidor, sin más configuración que agregar los nombres de los jugadores. Disponible en español e inglés.

Incluye dos juegos de deducción social:

- **Impostor** — todos reciben una palabra secreta excepto el/los impostor(es), que deben disimular durante el debate. Incluye el rol opcional Señor Blanco (sin palabra ni pista) y una pista para el impostor que facilita el disimulo.
- **La Mafia** (The Mob) — un jugador asume el rol de **Dios**, el narrador que dirige la partida sin jugar: lee el guion en voz alta, lleva la cuenta de quién sigue con vida y modera las rondas de día y noche. Incluye los roles de Detective y Doctor además de la Mafia.

## Stack técnico

- React 19 + TypeScript
- Vite
- Sin backend — todo el estado de la partida vive en memoria en el dispositivo anfitrión mientras dura la sesión

## Cómo empezar

```bash
npm install
npm run dev
```

Otros scripts:

```bash
npm run build    # verifica los tipos y compila para producción
npm run preview  # previsualiza la build de producción localmente
npm run lint      # ejecuta oxlint
```

## Estructura del proyecto

- `src/ImpostorApp.tsx` / `src/MobApp.tsx` — pantallas principales de cada juego
- `src/screens/` — pantallas individuales de cada juego (configuración, revelación, debate, resultados, etc.)
- `src/state/` — reducers que manejan la máquina de estados de cada juego
- `src/i18n/` — textos de traducción en español e inglés
- `src/data/games.ts` — registro de los juegos disponibles en el selector de juegos
