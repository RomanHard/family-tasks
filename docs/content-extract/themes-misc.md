# Themes — canonical CSS values (verbatim from original theme.css)
Rule: [data-world] blocks come AFTER [data-theme] and override the same variables — inside a world the world palette wins over the child profile theme.

## Parent themes (data-theme on parent root; switcher: Bright/Warm/Ocean/Night)
- label: Family theme | Тема сім'ї | Tema familiar
- hint: Choose a comfortable look for the parent space. | Оберіть зручний вигляд батьківського простору. | Elige un aspecto cómodo para el espacio de padres.
- options: Bright | Світла | Clara ; Warm | Тепла | Cálida ; Ocean | Океан | Océano ; Night | Нічна | Noche

light (:root):
--bg #f3f7fc; --surface #ffffff; --surface-2 #eaf0f8; --text #172238; --dim #607089; --border #cbd7e6; --accent #2457e6; --accent-2 #f5b82e; --success #25a877; --danger #d9574a; --radius 18px; --shadow 0 18px 44px rgba(23,34,56,.10); color-scheme light.

warm:
--bg #fff8ee; --surface #fffdf9; --surface-2 #f8ead7; --text #35271f; --dim #786356; --border #ead3bc; --accent #c65332; --accent-2 #f2bd4f

ocean:
--bg #eef8fb; --surface #ffffff; --surface-2 #dff0f5; --text #15313b; --dim #56717b; --border #bfdae2; --accent #147a9b; --accent-2 #f5bd48

dark:
color-scheme dark; --bg #0e1626; --surface #172238; --surface-2 #202e46; --text #f4f7fc; --dim #aab7ca; --border #344663; --accent #7da2ff; --accent-2 #ffd166; --success #57c69d; --danger #ff887d; --shadow 0 18px 44px rgba(0,0,0,.28)

## Kid world palettes (data-world on child root; "Story worlds own the entire child-space palette. Parent themes remain unchanged.")

pirates:
--bg #f2e8cf; --surface #fffaf0; --surface-2 #ead9b5; --text #2d271d; --dim #6f6048; --border #cbb37e; --accent #0f5b55; --accent-2 #dfa82e; --success #28765d; --danger #b74f3d; --shadow 0 14px 32px rgba(76,52,23,.13); page background: dotted pattern.

computer (space):
--bg #e9eff4; --surface #f9fbfc; --surface-2 #dfe8ee; --text #152331; --dim #566a79; --border #b8c8d2; --accent #176d91; --accent-2 #68d2dc; --success #177f70; --danger #b84d51; --shadow 0 14px 30px rgba(23,47,66,.13); page background: grid; cards/character/inventory border-radius 10px/14px/6px (techno style); dark hero #172f42.

dollhouse:
--bg #fff0f1; --surface #fffafb; --surface-2 #f8dfe3; --text #482b35; --dim #80606a; --border #e7c0c8; --accent #ad4c67; --accent-2 #f0b64d; --success #3b866c; --danger #c14f55; --shadow 0 14px 32px rgba(121,58,76,.12); page background: large dots.

World select cards: .world-pirates #124c51; .world-computer linear-gradient(135deg,#142b3d,#1b536b); .world-dollhouse #a64f61.
Inventory/shop per world — pirates: frame #6d421f / panel #a96731 / slot gradient #7d4828→#b86d39 / ink #fff6dc; computer: #163e69 / #25699a / #173f68→#245d86 / #e8fbff; dollhouse: #783e50 / #b85b74 / #793e50→#a75067 / #fff2f4.
Chests: pirates brown (#a76523, border #6d4217, gold lock); computer dark blue (#243858, neon #59d9f6, ">_"); dollhouse pink (#f39a91, bow #a64f61).
Currency icons: pirates gold square; computer blue #59d9f6 border #147a9b; dollhouse pink #f39a91 border #b74c43.

## Kid profile theme (data-theme on child root; "Child theme" | "Тема дитини" | "Tema infantil"; options hardcoded EN: Sky/Mint/Coral/Sunshine)
- sky: same block as ocean (shares values)
- mint: --bg #effaf4; --surface #ffffff; --surface-2 #dff3e8; --text #17362a; --dim #597467; --border #c1dfcf; --accent #23845d; --accent-2 #f2bd4f
- coral: --bg #fff3f1; --surface #ffffff; --surface-2 #fbe3df; --text #3a2523; --dim #7b625f; --border #eccbc5; --accent #d95f50; --accent-2 #f4bd45
- sunshine: --bg #fffbea; --surface #ffffff; --surface-2 #f8efc8; --text #352e19; --dim #756b48; --border #e7d99b; --accent #c97916; --accent-2 #f0b824
NOTE: inside a world, [data-world] overrides these — profile theme only visible outside a world (e.g. world select).

## Task categories (7)
- dishes: Dishes | Посуд | Platos
- vacuum: Vacuuming | Пилососіння | Aspirar
- tidying: Tidying | Прибирання | Ordenar
- laundry: Laundry | Прання | Lavandería
- homework: Homework | Домашнє завдання | Tarea escolar
- kindness: Kindness | Добра справа | Amabilidad
- other: Other | Інше | Otro
- label: Category | Категорія | Categoría

## Family rewards — "Ask for one" flow
Shop:
- Family reward counter | Сімейні винагороди | Recompensas familiares
- More things to earn | Більше нагород | Más cosas por ganar
- Ask for one | Запропонувати | Pedir una
- card: Request reward | Запросити винагороду | Solicitar recompensa (affordable) ; Waiting for parent | Очікує батьків | Esperando a un padre (pending) ; Keep earning | Заробляй далі | Sigue ganando (can't afford)
- empty: No family rewards yet | Сімейних винагород ще немає | Aún no hay recompensas familiares

Modal "Ask for a reward" | "Запропонувати винагороду" | "Pedir una recompensa":
- Dream it up. Your parent decides whether to add it and how many coins it costs. (hardcoded EN — keep)
- Reward idea | Ідея винагороди | Idea de recompensa
- Why would this be great? (optional) | Чому це буде чудово? (необов'язково) | ¿Por qué sería genial? (opcional)
- Ask my parent | Запитати батьків | Preguntar a mis padres

Parent queue:
- Reward idea | Ідея винагороди | Idea de recompensa
- {childName} would love "{title}" (+ note)
- Decline | Відхилити | Rechazar ; Set coin price | Встановити ціну | Fijar precio

Modal "Approve reward idea" | "Схвалити ідею винагороди" | "Aprobar idea de recompensa":
- Reward | Винагорода | Recompensa ; Coin cost | Ціна в монетах | Costo en monedas
- Add to reward menu | Додати до меню винагород | Añadir al menú de recompensas
