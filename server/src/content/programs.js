// Canonical standard programs — verbatim EN/UK/ES from the original artifact.
// World ids in this repo: pirates | space | dollhouse
// (the content file calls the "space" world "computer").
// Computer/Dollhouse share the SAME price and effect as Pirates per level;
// only names differ.
// Format per program: P(price, enName, ukName, esName, enEffect, ukEffect, esEffect)
const P = (price, en, uk, es, effEn, effUk, effEs) => ({
  price,
  name: { en, uk, es },
  effect: { en: effEn, uk: effUk, es: effEs },
});

export const PROGRAMS = {
  pirates: {
    1: [
      P(45, "Elixir of Quiet Harbor", "Еліксир тихої гавані", "Elixir del puerto tranquilo", "Parents put their phones away for 30 minutes.", "Батьки відкладають телефони на 30 хвилин.", "Los padres guardan sus teléfonos durante 30 minutos."),
      P(35, "Invisibility Potion", "Зілля невидимості", "Poción de invisibilidad", "Thirty minutes with no nagging or corrections.", "Тридцять хвилин без нагадувань і зауважень.", "Treinta minutos sin regaños ni correcciones."),
      P(55, "Captain's Supper", "Вечеря капітана", "Cena del capitán", "You choose what the family has for dinner.", "Ти обираєш, що сім'я їстиме на вечерю.", "Tú eliges qué cena la familia."),
      P(60, "Owl Potion", "Совине зілля", "Poción del búho", "Stay up 30 minutes later.", "Лягай спати на 30 хвилин пізніше.", "Quédate despierto 30 minutos más."),
      P(50, "Blanket Fort", "Фортеця з ковдр", "Fuerte de mantas", "Build a fort or hideout; parents choose the place.", "Побудуй фортецю або схованку; місце обирають батьки.", "Construye un fuerte o escondite; los padres eligen el lugar."),
    ],
    2: [
      P(90, "Golden Arches Voyage", "Подорож до золотих арок", "Viaje a los arcos dorados", "Take a surprise family trip to McDonald's, when parents approve the timing.", "Вирушай із сім'єю в несподівану поїздку до McDonald's, коли батьки погодять час.", "Haz una salida familiar sorpresa a McDonald's cuando tus padres aprueben el momento."),
      P(55, "Powder of Fun", "Порошок веселощів", "Polvo de diversión", "Get 30 extra minutes of game time.", "Отримай 30 додаткових хвилин для ігор.", "Obtén 30 minutos extra de juego."),
      P(50, "Captain's Game", "Гра капітана", "Juego del capitán", "Parents play a game you invent for 30 minutes.", "Батьки 30 хвилин грають у гру, яку ти вигадаєш.", "Los padres juegan durante 30 minutos a un juego que tú inventes."),
      P(70, "Tasty Treasure Run", "Похід по смачний скарб", "Salida por un tesoro delicioso", "Go to the store together right now and buy something tasty.", "Прямо зараз їдемо разом у магазин і купуємо щось смачненьке.", "Vamos juntos a la tienda ahora mismo y compramos algo rico."),
      P(40, "Walking Map", "Карта прогулянок", "Mapa de paseo", "You choose where the family walks today or tomorrow.", "Ти обираєш, де сім'я гулятиме сьогодні або завтра.", "Tú eliges dónde pasea la familia hoy o mañana."),
    ],
    3: [
      P(40, "Breakfast Compass", "Компас сніданку", "Brújula del desayuno", "Choose the family breakfast from two parent-approved options.", "Обери сімейний сніданок із двох варіантів, схвалених батьками.", "Elige el desayuno familiar entre dos opciones aprobadas por tus padres."),
      P(45, "Shanty Bottle", "Пляшка морських пісень", "Botella de canciones marineras", "Choose the music during the next family cleanup.", "Обери музику для наступного сімейного прибирання.", "Elige la música durante la próxima limpieza familiar."),
      P(55, "Sweet-Tooth Tonic", "Тонік для ласунів", "Tónico goloso", "Choose a dessert for the family to share this week.", "Обери десерт, яким сім'я поділиться цього тижня.", "Elige un postre para compartir en familia esta semana."),
      P(60, "First Mate's Favor", "Послуга першого помічника", "Favor del primer oficial", "Get 30 minutes of help from a parent on your own project.", "Отримай 30 хвилин допомоги від когось із батьків для власного проєкту.", "Recibe 30 minutos de ayuda de uno de tus padres para tu proyecto."),
      P(50, "Deck of Destiny", "Колода долі", "Baraja del destino", "Choose the next family board or card game.", "Обери наступну сімейну настільну або карткову гру.", "Elige el próximo juego familiar de mesa o cartas."),
    ],
    4: [
      P(70, "Stormglass Boost", "Сила штормового скла", "Impulso del cristal de tormenta", "Get 45 extra minutes of screen or game time.", "Отримай 45 додаткових хвилин екранного часу або гри.", "Obtén 45 minutos extra de pantalla o juego."),
      P(60, "Crew Swap Scroll", "Сувій обміну команди", "Pergamino de intercambio de tripulación", "Trade one task with a sibling if a parent approves.", "Обміняйся одним завданням із братом чи сестрою, якщо батьки дозволять.", "Intercambia una tarea con un hermano si tus padres lo aprueban."),
      P(55, "Galley Captain", "Капітан камбуза", "Capitán de la cocina", "Choose the family's weekend breakfast.", "Обери сімейний сніданок на вихідних.", "Elige el desayuno familiar del fin de semana."),
      P(50, "Pathfinder Potion", "Зілля слідопита", "Poción del explorador", "Choose the route for the next family walk.", "Обери маршрут наступної сімейної прогулянки.", "Elige la ruta del próximo paseo familiar."),
      P(75, "Midnight Tide", "Опівнічний приплив", "Marea de medianoche", "Stay up 45 minutes later on a parent-approved night.", "Лягай спати на 45 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 45 minutos más en una noche aprobada por tus padres."),
    ],
    5: [
      P(80, "Captain's Hour", "Година капітана", "Hora del capitán", "Choose a 45-minute one-on-one activity with a parent.", "Обери 45-хвилинне заняття вдвох із кимось із батьків.", "Elige una actividad de 45 minutos a solas con uno de tus padres."),
      P(45, "Songbird Sail", "Вітрило співочої пташки", "Vela del pájaro cantor", "Control the family playlist for one evening.", "Керуй сімейним плейлистом один вечір.", "Controla la lista de música familiar durante una noche."),
      P(65, "Island Camp Kit", "Набір для табору на острові", "Equipo de campamento isleño", "Turn the living room into a family camp for one evening.", "Перетвори вітальню на сімейний табір на один вечір.", "Convierte la sala en un campamento familiar por una noche."),
      P(60, "Baker's Treasure", "Скарб пекаря", "Tesoro del pastelero", "Choose a dessert-making activity to do with a parent.", "Обери десерт, який приготуєш разом із кимось із батьків.", "Elige un postre para preparar con uno de tus padres."),
      P(55, "Captain's Breakfast", "Сніданок капітана", "Desayuno del capitán", "Have breakfast served in your favorite spot at home.", "Отримай сніданок у своєму улюбленому місці вдома.", "Recibe el desayuno en tu lugar favorito de casa."),
    ],
    6: [
      P(65, "Crew Commander", "Командир команди", "Comandante de la tripulación", "Lead a 30-minute family challenge of your own design.", "Проведи 30-хвилинний сімейний виклик за власними правилами.", "Dirige un reto familiar de 30 minutos creado por ti."),
      P(85, "Takeout Treasure Map", "Карта скарбів із доставкою", "Mapa del tesoro para pedir comida", "Choose a takeout meal from the options your parents set.", "Обери їжу на замовлення з варіантів, які запропонували батьки.", "Elige comida para llevar entre las opciones de tus padres."),
      P(90, "Golden Game Flask", "Золота фляга гри", "Frasco dorado de juego", "Get 60 extra minutes of screen or game time.", "Отримай 60 додаткових хвилин екранного часу або гри.", "Obtén 60 minutos extra de pantalla o juego."),
      P(80, "Adventure Compass", "Компас пригод", "Brújula de aventuras", "Choose the next weekend outing from parent-approved options.", "Обери наступну прогулянку на вихідних із варіантів батьків.", "Elige la próxima salida del fin de semana entre opciones aprobadas."),
      P(60, "Deckhand Summon", "Виклик матроса", "Llamada al marinero", "Ask a parent to help with one regular task.", "Попроси когось із батьків допомогти з одним звичайним завданням.", "Pide a uno de tus padres ayuda con una tarea habitual."),
    ],
    7: [
      P(95, "Sweet Cargo Voyage", "Подорож по солодкий вантаж", "Viaje por un cargamento dulce", "Choose a special family treat from the store to enjoy together today.", "Обери в магазині особливу смакоту, щоб сьогодні поласувати нею всією сім'єю.", "Elige en la tienda un antojo especial para disfrutarlo hoy en familia."),
      P(80, "Silent Seas Elixir", "Еліксир тихих морів", "Elixir de los mares tranquilos", "Parents put their phones away for a full hour.", "Батьки відкладають телефони на цілу годину.", "Los padres guardan sus teléfonos durante una hora completa."),
      P(75, "Game Night Map", "Карта сімейної гри", "Mapa de noche de juegos", "Choose a family game and the snack everyone shares.", "Обери сімейну гру та перекус для всіх.", "Elige un juego familiar y el aperitivo para compartir."),
      P(95, "Moon Captain Potion", "Зілля місячного капітана", "Poción del capitán lunar", "Stay up 60 minutes later on a parent-approved night.", "Лягай спати на 60 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 60 minutos más en una noche aprobada."),
      P(70, "Game Master's Flag", "Прапор майстра гри", "Bandera del maestro de juegos", "Host a 45-minute family game you create.", "Проведи 45-хвилинну сімейну гру, яку сам/сама вигадаєш.", "Organiza un juego familiar de 45 minutos creado por ti."),
    ],
    8: [
      P(85, "Saturday Spyglass", "Суботня підзорна труба", "Catalejo del sábado", "Choose the plan for a Saturday morning from approved options.", "Обери план на суботній ранок із дозволених варіантів.", "Elige el plan del sábado por la mañana entre opciones aprobadas."),
      P(100, "Captain's Command", "Наказ капітана", "Orden del capitán", "A parent completes one small regular task for you.", "Хтось із батьків виконує за тебе одне невелике звичайне завдання.", "Uno de tus padres hace por ti una pequeña tarea habitual."),
      P(75, "Fortress Picnic", "Пікнік у фортеці", "Pícnic en la fortaleza", "Build a pillow fort and have a snack picnic inside.", "Побудуй фортецю з подушок і влаштуй усередині пікнік із перекусом.", "Construye un fuerte de almohadas y haz un pícnic dentro."),
      P(90, "Galley Master", "Майстер камбуза", "Maestro de la cocina", "Choose dinner and help a parent cook it.", "Обери вечерю й допоможи комусь із батьків її приготувати.", "Elige la cena y ayuda a uno de tus padres a cocinarla."),
      P(95, "Master Builder's Bottle", "Пляшка майстра-будівничого", "Botella del maestro constructor", "Get 90 minutes with a parent for a creative project.", "Отримай 90 хвилин із кимось із батьків для творчого проєкту.", "Disfruta de 90 minutos con uno de tus padres para un proyecto creativo."),
    ],
    9: [
      P(110, "Grand Voyage Chart", "Карта великої подорожі", "Carta del gran viaje", "Plan a mini family adventure from parent-approved choices.", "Сплануй маленьку сімейну пригоду з варіантів, схвалених батьками.", "Planea una miniaventura familiar entre opciones aprobadas."),
      P(95, "Crew Together Tonic", "Тонік єдності команди", "Tónico de unión de la tripulación", "Choose a device-free family hour and what everyone does.", "Обери сімейну годину без пристроїв і заняття для всіх.", "Elige una hora familiar sin dispositivos y qué hará cada uno."),
      P(100, "Feast of Nine Seas", "Бенкет дев'яти морів", "Banquete de los nueve mares", "Choose a special celebration meal for the family.", "Обери особливу святкову страву для сім'ї.", "Elige una comida especial de celebración para la familia."),
      P(115, "Starlit Watch Potion", "Зілля зоряної варти", "Poción de guardia estrellada", "Stay up 75 minutes later on a parent-approved night.", "Лягай спати на 75 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 75 minutos más en una noche aprobada."),
      P(90, "Tournament Flag", "Прапор турніру", "Bandera del torneo", "Run a family tournament and choose the events.", "Проведи сімейний турнір і обери змагання.", "Organiza un torneo familiar y elige las pruebas."),
    ],
    10: [
      P(120, "Legend's Day Elixir", "Еліксир дня легенди", "Elixir del día legendario", "Choose a theme for one special family day.", "Обери тему для одного особливого сімейного дня.", "Elige un tema para un día familiar especial."),
      P(140, "Two-Hour Treasure Voyage", "Двогодинна подорож за скарбами", "Viaje del tesoro de dos horas", "Choose a two-hour adventure with one parent.", "Обери двогодинну пригоду з кимось із батьків.", "Elige una aventura de dos horas con uno de tus padres."),
      P(130, "Captain's Camp", "Табір капітана", "Campamento del capitán", "Camp in a parent-approved room for one night.", "Влаштуй табір на одну ніч у кімнаті, яку схвалили батьки.", "Acampa una noche en una habitación aprobada por tus padres."),
      P(150, "Legend's Triple Choice", "Потрійний вибір легенди", "Triple elección de la leyenda", "Choose dinner, a family activity, and dessert for one special evening.", "Обери вечерю, сімейне заняття й десерт для одного особливого вечора.", "Elige la cena, una actividad familiar y el postre para una noche especial."),
      P(135, "Legend's Treat Voyage", "Легендарна подорож по смаколики", "Viaje legendario por antojos", "Plan a surprise family treat run and choose something tasty for everyone.", "Заплануй несподівану сімейну поїздку по смаколики й обери щось смачне для всіх.", "Planea una salida familiar sorpresa por antojos y elige algo rico para todos."),
    ],
  },

  space: {
  1: [
    P(45, "Quiet Mode", "Тихий режим", "Modo silencioso", "Parents put their phones away for 30 minutes.", "Батьки відкладають телефони на 30 хвилин.", "Los padres guardan sus teléfonos durante 30 minutos."),
    P(35, "Invisible.exe", "Невидимість.exe", "Invisible.exe", "Thirty minutes with no nagging or corrections.", "Тридцять хвилин без нагадувань і зауважень.", "Treinta minutos sin regaños ni correcciones."),
    P(55, "Chef Program", "Програма шеф-кухаря", "Programa chef", "You choose what the family has for dinner.", "Ти обираєш, що сім'я їстиме на вечерю.", "Tú eliges qué cena la familia."),
    P(60, "Owl Mode", "Совиний режим", "Modo búho", "Stay up 30 minutes later.", "Лягай спати на 30 хвилин пізніше.", "Quédate despierto 30 minutos más."),
    P(50, "Base Builder", "Будівничий бази", "Constructor de base", "Build a fort or hideout; parents choose the place.", "Побудуй фортецю або схованку; місце обирають батьки.", "Construye un fuerte o escondite; los padres eligen el lugar."),
  ],
  2: [
    P(90, "McDonald's Side Quest", "Побічний квест McDonald's", "Misión secundaria de McDonald's", "Take a surprise family trip to McDonald's, when parents approve the timing.", "Вирушай із сім'єю в несподівану поїздку до McDonald's, коли батьки погодять час.", "Haz una salida familiar sorpresa a McDonald's cuando tus padres aprueben el momento."),
    P(55, "Turbo Mode", "Турборежим", "Modo turbo", "Get 30 extra minutes of game time.", "Отримай 30 додаткових хвилин для ігор.", "Obtén 30 minutos extra de juego."),
    P(50, "Co-op Program", "Кооперативна програма", "Programa cooperativo", "Parents play a game you invent for 30 minutes.", "Батьки 30 хвилин грають у гру, яку ти вигадаєш.", "Los padres juegan durante 30 minutos a un juego que tú inventes."),
    P(70, "Snack Run", "Поїздка по смаколики", "Salida por antojos", "Go to the store together right now and buy something tasty.", "Прямо зараз їдемо разом у магазин і купуємо щось смачненьке.", "Vamos juntos a la tienda ahora mismo y compramos algo rico."),
    P(40, "Navigator", "Навігатор", "Navegador", "You choose where the family walks today or tomorrow.", "Ти обираєш, де сім'я гулятиме сьогодні або завтра.", "Tú eliges dónde pasea la familia hoy o mañana."),
  ],
  3: [
    P(40, "Morning Menu", "Ранкове меню", "Menú matutino", "Choose the family breakfast from two parent-approved options.", "Обери сімейний сніданок із двох варіантів, схвалених батьками.", "Elige el desayuno familiar entre dos opciones aprobadas por tus padres."),
    P(45, "Playlist Patch", "Патч плейлиста", "Parche de música", "Choose the music during the next family cleanup.", "Обери музику для наступного сімейного прибирання.", "Elige la música durante la próxima limpieza familiar."),
    P(55, "Dessert Download", "Завантаження десерту", "Descarga de postre", "Choose a dessert for the family to share this week.", "Обери десерт, яким сім'я поділиться цього тижня.", "Elige un postre para compartir en familia esta semana."),
    P(60, "Helper Bot", "Бот-помічник", "Robot ayudante", "Get 30 minutes of help from a parent on your own project.", "Отримай 30 хвилин допомоги від когось із батьків для власного проєкту.", "Recibe 30 minutos de ayuda de uno de tus padres para tu proyecto."),
    P(50, "Game Selector", "Вибір гри", "Selector de juego", "Choose the next family board or card game.", "Обери наступну сімейну настільну або карткову гру.", "Elige el próximo juego familiar de mesa o cartas."),
  ],
  4: [
    P(70, "Overclock 45", "Розгін 45", "Aceleración 45", "Get 45 extra minutes of screen or game time.", "Отримай 45 додаткових хвилин екранного часу або гри.", "Obtén 45 minutos extra de pantalla o juego."),
    P(60, "Task Transfer", "Передача завдання", "Transferencia de tarea", "Trade one task with a sibling if a parent approves.", "Обміняйся одним завданням із братом чи сестрою, якщо батьки дозволять.", "Intercambia una tarea con un hermano si tus padres lo aprueban."),
    P(55, "Weekend Menu App", "Меню вихідного дня", "Menú de fin de semana", "Choose the family's weekend breakfast.", "Обери сімейний сніданок на вихідних.", "Elige el desayuno familiar del fin de semana."),
    P(50, "Route Planner", "Планувальник маршруту", "Planificador de ruta", "Choose the route for the next family walk.", "Обери маршрут наступної сімейної прогулянки.", "Elige la ruta del próximo paseo familiar."),
    P(75, "Night Mode 45", "Нічний режим 45", "Modo nocturno 45", "Stay up 45 minutes later on a parent-approved night.", "Лягай спати на 45 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 45 minutos más en una noche aprobada por tus padres."),
  ],
  5: [
    P(80, "One-on-One Channel", "Канал один-на-один", "Canal uno a uno", "Choose a 45-minute one-on-one activity with a parent.", "Обери 45-хвилинне заняття вдвох із кимось із батьків.", "Elige una actividad de 45 minutos a solas con uno de tus padres."),
    P(45, "DJ Console", "DJ-пульт", "Consola de DJ", "Control the family playlist for one evening.", "Керуй сімейним плейлистом один вечір.", "Controla la lista de música familiar durante una noche."),
    P(65, "Habitat Builder", "Будівничий табору", "Constructor de hábitat", "Turn the living room into a family camp for one evening.", "Перетвори вітальню на сімейний табір на один вечір.", "Convierte la sala en un campamento familiar por una noche."),
    P(60, "Recipe Compiler", "Компілятор рецептів", "Compilador de recetas", "Choose a dessert-making activity to do with a parent.", "Обери десерт, який приготуєш разом із кимось із батьків.", "Elige un postre para preparar con uno de tus padres."),
    P(55, "Breakfast Delivery", "Доставка сніданку", "Desayuno a domicilio", "Have breakfast served in your favorite spot at home.", "Отримай сніданок у своєму улюбленому місці вдома.", "Recibe el desayuno en tu lugar favorito de casa."),
  ],
  6: [
    P(65, "Challenge Host", "Ведучий виклику", "Anfitrión del reto", "Lead a 30-minute family challenge of your own design.", "Проведи 30-хвилинний сімейний виклик за власними правилами.", "Dirige un reto familiar de 30 minutos creado por ti."),
    P(85, "Delivery Portal", "Портал доставки", "Portal de entrega", "Choose a takeout meal from the options your parents set.", "Обери їжу на замовлення з варіантів, які запропонували батьки.", "Elige comida para llevar entre las opciones de tus padres."),
    P(90, "Turbo Mode 60", "Турборежим 60", "Modo turbo 60", "Get 60 extra minutes of screen or game time.", "Отримай 60 додаткових хвилин екранного часу або гри.", "Obtén 60 minutos extra de pantalla o juego."),
    P(80, "Weekend Navigator", "Навігатор вихідного дня", "Navegador de fin de semana", "Choose the next weekend outing from parent-approved options.", "Обери наступну прогулянку на вихідних із варіантів батьків.", "Elige la próxima salida del fin de semana entre opciones aprobadas."),
    P(60, "Support Ticket", "Запит підтримки", "Solicitud de ayuda", "Ask a parent to help with one regular task.", "Попроси когось із батьків допомогти з одним звичайним завданням.", "Pide a uno de tus padres ayuda con una tarea habitual."),
  ],
  7: [
    P(95, "Treat Mission", "Місія за смаколиками", "Misión de antojos", "Choose a special family treat from the store to enjoy together today.", "Обери в магазині особливу смакоту, щоб сьогодні поласувати нею всією сім'єю.", "Elige en la tienda un antojo especial para disfrutarlo hoy en familia."),
    P(80, "Offline Hour", "Година офлайн", "Hora sin conexión", "Parents put their phones away for a full hour.", "Батьки відкладають телефони на цілу годину.", "Los padres guardan sus teléfonos durante una hora completa."),
    P(75, "Game Night Combo", "Комбо сімейної гри", "Combo de noche de juegos", "Choose a family game and the snack everyone shares.", "Обери сімейну гру та перекус для всіх.", "Elige un juego familiar y el aperitivo para compartir."),
    P(95, "Night Mode 60", "Нічний режим 60", "Modo nocturno 60", "Stay up 60 minutes later on a parent-approved night.", "Лягай спати на 60 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 60 minutos más en una noche aprobada."),
    P(70, "Game Master Program", "Програма майстра гри", "Programa maestro de juegos", "Host a 45-minute family game you create.", "Проведи 45-хвилинну сімейну гру, яку сам/сама вигадаєш.", "Organiza un juego familiar de 45 minutos creado por ti."),
  ],
  8: [
    P(85, "Saturday Scheduler", "Планувальник суботи", "Planificador del sábado", "Choose the plan for a Saturday morning from approved options.", "Обери план на суботній ранок із дозволених варіантів.", "Elige el plan del sábado por la mañana entre opciones aprobadas."),
    P(100, "Parent Task Bot", "Батьківський бот завдань", "Robot de tareas para padres", "A parent completes one small regular task for you.", "Хтось із батьків виконує за тебе одне невелике звичайне завдання.", "Uno de tus padres hace por ti una pequeña tarea habitual."),
    P(75, "Pillow Base", "База з подушок", "Base de almohadas", "Build a pillow fort and have a snack picnic inside.", "Побудуй фортецю з подушок і влаштуй усередині пікнік із перекусом.", "Construye un fuerte de almohadas y haz un pícnic dentro."),
    P(90, "Co-Chef Program", "Програма співкухаря", "Programa cocinero en equipo", "Choose dinner and help a parent cook it.", "Обери вечерю й допоможи комусь із батьків її приготувати.", "Elige la cena y ayuda a uno de tus padres a cocinarla."),
    P(60, "Creator Session", "Творча сесія", "Sesión creativa", "Get 90 minutes with a parent for a creative project.", "Отримай 90 хвилин із кимось із батьків для творчого проєкту.", "Disfruta de 90 minutos con uno de tus padres para un proyecto creativo."),
  ],
  9: [
    P(110, "Adventure Simulator", "Симулятор пригод", "Simulador de aventuras", "Plan a mini family adventure from parent-approved choices.", "Сплануй маленьку сімейну пригоду з варіантів, схвалених батьками.", "Planea una miniaventura familiar entre opciones aprobadas."),
    P(95, "Family Offline Protocol", "Сімейний офлайн-протокол", "Protocolo familiar sin conexión", "Choose a device-free family hour and what everyone does.", "Обери сімейну годину без пристроїв і заняття для всіх.", "Elige una hora familiar sin dispositivos y qué hará cada uno."),
    P(100, "Celebration Menu", "Святкове меню", "Menú de celebración", "Choose a special celebration meal for the family.", "Обери особливу святкову страву для сім'ї.", "Elige una comida especial de celebración para la familia."),
    P(115, "Night Mode 75", "Нічний режим 75", "Modo nocturno 75", "Stay up 75 minutes later on a parent-approved night.", "Лягай спати на 75 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 75 minutos más en una noche aprobada."),
    P(90, "Tournament Engine", "Турнірний рушій", "Motor de torneos", "Run a family tournament and choose the events.", "Проведи сімейний турнір і обери змагання.", "Organiza un torneo familiar y elige las pruebas."),
  ],
  10: [
    P(120, "Theme-Day System", "Система тематичного дня", "Sistema de día temático", "Choose a theme for one special family day.", "Обери тему для одного особливого сімейного дня.", "Elige un tema para un día familiar especial."),
    P(140, "Deep-Space Session", "Сеанс далекого космосу", "Sesión de espacio profundo", "Choose a two-hour adventure with one parent.", "Обери двогодинну пригоду з кимось із батьків.", "Elige una aventura de dos horas con uno de tus padres."),
    P(130, "Indoor Space Camp", "Домашній космічний табір", "Campamento espacial interior", "Camp in a parent-approved room for one night.", "Влаштуй табір на одну ніч у кімнаті, яку схвалили батьки.", "Acampa una noche en una habitación aprobada por tus padres."),
    P(150, "Triple Choice Console", "Пульт потрійного вибору", "Consola de triple elección", "Choose dinner, a family activity, and dessert for one special evening.", "Обери вечерю, сімейне заняття й десерт для одного особливого вечора.", "Elige la cena, una actividad familiar y el postre para una noche especial."),
    P(135, "Legendary Snack Run", "Легендарна поїздка по смаколики", "Salida legendaria por antojos", "Plan a surprise family treat run and choose something tasty for everyone.", "Заплануй несподівану сімейну поїздку по смаколики й обери щось смачне для всіх.", "Planea una salida familiar sorpresa por antojos y elige algo rico para todos."),
  ],
  },

  dollhouse: {
  1: [
    P(45, "Quiet Chair", "Крісло тиші", "Sillón tranquilo", "Parents put their phones away for 30 minutes.", "Батьки відкладають телефони на 30 хвилин.", "Los padres guardan sus teléfonos durante 30 minutos."),
    P(35, "Invisible Cloak Rack", "Вішак із плащем-невидимкою", "Perchero de capa invisible", "Thirty minutes with no nagging or corrections.", "Тридцять хвилин без нагадувань і зауважень.", "Treinta minutos sin regaños ni correcciones."),
    P(55, "Magic Stove", "Чарівна плита", "Cocina mágica", "You choose what the family has for dinner.", "Ти обираєш, що сім'я їстиме на вечерю.", "Tú eliges qué cena la familia."),
    P(60, "Night Light", "Нічник", "Luz nocturna", "Stay up 30 minutes later.", "Лягай спати на 30 хвилин пізніше.", "Quédate despierto 30 minutos más."),
    P(50, "Blanket Castle", "Замок із ковдр", "Castillo de mantas", "Build a fort or hideout; parents choose the place.", "Побудуй фортецю або схованку; місце обирають батьки.", "Construye un fuerte o escondite; los padres eligen el lugar."),
  ],
  2: [
    P(90, "Golden Arches Outing", "Поїздка до золотих арок", "Salida a los arcos dorados", "Take a surprise family trip to McDonald's, when parents approve the timing.", "Вирушай із сім'єю в несподівану поїздку до McDonald's, коли батьки погодять час.", "Haz una salida familiar sorpresa a McDonald's cuando tus padres aprueben el momento."),
    P(55, "Play Corner", "Ігровий куточок", "Rincón de juegos", "Get 30 extra minutes of game time.", "Отримай 30 додаткових хвилин для ігор.", "Obtén 30 minutos extra de juego."),
    P(50, "Game Table", "Ігровий стіл", "Mesa de juegos", "Parents play a game you invent for 30 minutes.", "Батьки 30 хвилин грають у гру, яку ти вигадаєш.", "Los padres juegan durante 30 minutos a un juego que tú inventes."),
    P(70, "Treat-Shop Door", "Двері до магазину смаколиків", "Puerta de la tienda de antojos", "Go to the store together right now and buy something tasty.", "Прямо зараз їдемо разом у магазин і купуємо щось смачненьке.", "Vamos juntos a la tienda ahora mismo y compramos algo rico."),
    P(40, "View Window", "Вікно з краєвидом", "Ventana panorámica", "You choose where the family walks today or tomorrow.", "Ти обираєш, де сім'я гулятиме сьогодні або завтра.", "Tú eliges dónde pasea la familia hoy o mañana."),
  ],
  3: [
    P(40, "Breakfast Nook", "Куточок для сніданку", "Rincón del desayuno", "Choose the family breakfast from two parent-approved options.", "Обери сімейний сніданок із двох варіантів, схвалених батьками.", "Elige el desayuno familiar entre dos opciones aprobadas por tus padres."),
    P(45, "Singing Radio", "Співуче радіо", "Radio cantante", "Choose the music during the next family cleanup.", "Обери музику для наступного сімейного прибирання.", "Elige la música durante la próxima limpieza familiar."),
    P(55, "Cupcake Cabinet", "Шафка з кексами", "Armario de pastelitos", "Choose a dessert for the family to share this week.", "Обери десерт, яким сім'я поділиться цього тижня.", "Elige un postre para compartir en familia esta semana."),
    P(60, "Helping Hands Clock", "Годинник допомоги", "Reloj de ayuda", "Get 30 minutes of help from a parent on your own project.", "Отримай 30 хвилин допомоги від когось із батьків для власного проєкту.", "Recibe 30 minutos de ayuda de uno de tus padres para tu proyecto."),
    P(50, "Game-Night Table", "Стіл для ігрового вечора", "Mesa para la noche de juegos", "Choose the next family board or card game.", "Обери наступну сімейну настільну або карткову гру.", "Elige el próximo juego familiar de mesa o cartas."),
  ],
  4: [
    P(70, "Extra-Hour Lamp", "Лампа додаткового часу", "Lámpara de tiempo extra", "Get 45 extra minutes of screen or game time.", "Отримай 45 додаткових хвилин екранного часу або гри.", "Obtén 45 minutos extra de pantalla o juego."),
    P(60, "Chore-Swap Door", "Двері обміну справами", "Puerta de intercambio de tareas", "Trade one task with a sibling if a parent approves.", "Обміняйся одним завданням із братом чи сестрою, якщо батьки дозволять.", "Intercambia una tarea con un hermano si tus padres lo aprueban."),
    P(55, "Brunch Bell", "Дзвінок для пізнього сніданку", "Campana del brunch", "Choose the family's weekend breakfast.", "Обери сімейний сніданок на вихідних.", "Elige el desayuno familiar del fin de semana."),
    P(50, "Garden Path Key", "Ключ від садової стежки", "Llave del sendero del jardín", "Choose the route for the next family walk.", "Обери маршрут наступної сімейної прогулянки.", "Elige la ruta del próximo paseo familiar."),
    P(75, "Moonlight Bed", "Ліжко місячного сяйва", "Cama de luz de luna", "Stay up 45 minutes later on a parent-approved night.", "Лягай спати на 45 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 45 minutos más en una noche aprobada por tus padres."),
  ],
  5: [
    P(80, "Together-Time Sofa", "Диван спільного часу", "Sofá para estar juntos", "Choose a 45-minute one-on-one activity with a parent.", "Обери 45-хвилинне заняття вдвох із кимось із батьків.", "Elige una actividad de 45 minutos a solas con uno de tus padres."),
    P(45, "Melody Piano", "Мелодійне піаніно", "Piano de melodías", "Control the family playlist for one evening.", "Керуй сімейним плейлистом один вечір.", "Controla la lista de música familiar durante una noche."),
    P(65, "Living-Room Camp", "Табір у вітальні", "Campamento en la sala", "Turn the living room into a family camp for one evening.", "Перетвори вітальню на сімейний табір на один вечір.", "Convierte la sala en un campamento familiar por una noche."),
    P(60, "Baking Counter", "Стіл для випічки", "Encimera de repostería", "Choose a dessert-making activity to do with a parent.", "Обери десерт, який приготуєш разом із кимось із батьків.", "Elige un postre para preparar con uno de tus padres."),
    P(55, "Breakfast Tray", "Таця для сніданку", "Bandeja de desayuno", "Have breakfast served in your favorite spot at home.", "Отримай сніданок у своєму улюбленому місці вдома.", "Recibe el desayuno en tu lugar favorito de casa."),
  ],
  6: [
    P(65, "Family Stage", "Сімейна сцена", "Escenario familiar", "Lead a 30-minute family challenge of your own design.", "Проведи 30-хвилинний сімейний виклик за власними правилами.", "Dirige un reto familiar de 30 minutos creado por ti."),
    P(85, "Takeout Window", "Віконце доставки", "Ventanilla de comida para llevar", "Choose a takeout meal from the options your parents set.", "Обери їжу на замовлення з варіантів, які запропонували батьки.", "Elige comida para llevar entre las opciones de tus padres."),
    P(90, "Playroom Pass", "Перепустка до ігрової кімнати", "Pase para la sala de juegos", "Get 60 extra minutes of screen or game time.", "Отримай 60 додаткових хвилин екранного часу або гри.", "Obtén 60 minutos extra de pantalla o juego."),
    P(80, "Outing Door", "Двері до прогулянки", "Puerta de salida", "Choose the next weekend outing from parent-approved options.", "Обери наступну прогулянку на вихідних із варіантів батьків.", "Elige la próxima salida del fin de semana entre opciones aprobadas."),
    P(60, "Helper Bell", "Дзвіночок помічника", "Campana de ayuda", "Ask a parent to help with one regular task.", "Попроси когось із батьків допомогти з одним звичайним завданням.", "Pide a uno de tus padres ayuda con una tarea habitual."),
  ],
  7: [
    P(95, "Sweet-Shop Door", "Двері до крамниці солодощів", "Puerta de la tienda dulce", "Choose a special family treat from the store to enjoy together today.", "Обери в магазині особливу смакоту, щоб сьогодні поласувати нею всією сім'єю.", "Elige en la tienda un antojo especial para disfrutarlo hoy en familia."),
    P(80, "Phone-Sleeping Drawer", "Шухляда для відпочинку телефонів", "Cajón para que descansen los teléfonos", "Parents put their phones away for a full hour.", "Батьки відкладають телефони на цілу годину.", "Los padres guardan sus teléfonos durante una hora completa."),
    P(75, "Game-Night Sofa", "Диван для сімейної гри", "Sofá para la noche de juegos", "Choose a family game and the snack everyone shares.", "Обери сімейну гру та перекус для всіх.", "Elige un juego familiar y el aperitivo para compartir."),
    P(95, "Starlight Bedroom", "Спальня зоряного сяйва", "Dormitorio de luz estelar", "Stay up 60 minutes later on a parent-approved night.", "Лягай спати на 60 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 60 minutos más en una noche aprobada."),
    P(70, "Game Host Table", "Стіл ведучого гри", "Mesa del anfitrión de juegos", "Host a 45-minute family game you create.", "Проведи 45-хвилинну сімейну гру, яку сам/сама вигадаєш.", "Organiza un juego familiar de 45 minutos creado por ti."),
  ],
  8: [
    P(85, "Saturday Window", "Суботнє вікно", "Ventana del sábado", "Choose the plan for a Saturday morning from approved options.", "Обери план на суботній ранок із дозволених варіантів.", "Elige el plan del sábado por la mañana entre opciones aprobadas."),
    P(100, "Magic Helping Broom", "Чарівна мітла-помічниця", "Escoba mágica ayudante", "A parent completes one small regular task for you.", "Хтось із батьків виконує за тебе одне невелике звичайне завдання.", "Uno de tus padres hace por ti una pequeña tarea habitual."),
    P(75, "Pillow Palace", "Палац із подушок", "Palacio de almohadas", "Build a pillow fort and have a snack picnic inside.", "Побудуй фортецю з подушок і влаштуй усередині пікнік із перекусом.", "Construye un fuerte de almohadas y haz un pícnic dentro."),
    P(90, "Chef's Kitchen", "Кухня шеф-кухаря", "Cocina del chef", "Choose dinner and help a parent cook it.", "Обери вечерю й допоможи комусь із батьків її приготувати.", "Elige la cena y ayuda a uno de tus padres a cocinarla."),
    P(60, "Craft-Room Clock", "Годинник творчої кімнати", "Reloj del taller creativo", "Get 90 minutes with a parent for a creative project.", "Отримай 90 хвилин із кимось із батьків для творчого проєкту.", "Disfruta de 90 minutos con uno de tus padres para un proyecto creativo."),
  ],
  9: [
    P(110, "Adventure Attic", "Горище пригод", "Ático de aventuras", "Plan a mini family adventure from parent-approved choices.", "Сплануй маленьку сімейну пригоду з варіантів, схвалених батьками.", "Planea una miniaventura familiar entre opciones aprobadas."),
    P(95, "Together Room", "Кімната єдності", "Sala para estar juntos", "Choose a device-free family hour and what everyone does.", "Обери сімейну годину без пристроїв і заняття для всіх.", "Elige una hora familiar sin dispositivos y qué hará cada uno."),
    P(100, "Celebration Dining Room", "Святкова їдальня", "Comedor de celebración", "Choose a special celebration meal for the family.", "Обери особливу святкову страву для сім'ї.", "Elige una comida especial de celebración para la familia."),
    P(115, "Constellation Bed", "Ліжко сузір'їв", "Cama de constelaciones", "Stay up 75 minutes later on a parent-approved night.", "Лягай спати на 75 хвилин пізніше у вечір, схвалений батьками.", "Quédate despierto 75 minutos más en una noche aprobada."),
    P(90, "Tournament Hall", "Турнірна зала", "Salón de torneos", "Run a family tournament and choose the events.", "Проведи сімейний турнір і обери змагання.", "Organiza un torneo familiar y elige las pruebas."),
  ],
  10: [
    P(120, "Festival Room", "Святкова кімната", "Sala de festival", "Choose a theme for one special family day.", "Обери тему для одного особливого сімейного дня.", "Elige un tema para un día familiar especial."),
    P(140, "Grand Adventure Door", "Двері великої пригоди", "Puerta de la gran aventura", "Choose a two-hour adventure with one parent.", "Обери двогодинну пригоду з кимось із батьків.", "Elige una aventura de dos horas con uno de tus padres."),
    P(130, "Bedroom Camp Castle", "Замок-табор у спальні", "Castillo de campamento en el dormitorio", "Camp in a parent-approved room for one night.", "Влаштуй табір на одну ніч у кімнаті, яку схвалили батьки.", "Acampa una noche en una habitación aprobada por tus padres."),
    P(150, "Perfect Evening House", "Будинок ідеального вечора", "Casa de la noche perfecta", "Choose dinner, a family activity, and dessert for one special evening.", "Обери вечерю, сімейне заняття й десерт для одного особливого вечора.", "Elige la cena, una actividad familiar y el postre para una noche especial."),
    P(135, "Grand Treat Door", "Великі двері до смаколиків", "Gran puerta de los antojos", "Plan a surprise family treat run and choose something tasty for everyone.", "Заплануй несподівану сімейну поїздку по смаколики й обери щось смачне для всіх.", "Planea una salida familiar sorpresa por antojos y elige algo rico para todos."),
  ],
  },
};

// Canonical modules — REPLACE the old module seed names/prices.
// name per world (pirates | space | dollhouse); bonus templates use {v}.
const M = (key, bonusValue, price, names, bonus) => ({ key, bonusValue, price, names, bonus });
const N = (en, uk, es) => ({ en, uk, es });

export const MODULES = [
  M("coins_10", 10, 250, {
    pirates: N("Golden Sails", "Золоті вітрила", "Velas doradas"),
    space: N("Quantum Engine", "Квантовий двигун", "Motor cuántico"),
    dollhouse: N("Treasure Armchair", "Скарбове крісло", "Sillón del tesoro"),
  }, N("+{v}% coins from tasks", "+{v}% монет за завдання", "+{v}% monedas por tareas")),
  M("deadline_1day", 1, 220, {
    pirates: N("Storm Shield", "Штормовий щит", "Escudo de tormenta"),
    space: N("Time Shield", "Щит часу", "Escudo del tiempo"),
    dollhouse: N("Guardian Wardrobe", "Шафа-охоронець", "Armario guardián"),
  }, N("+{v} day on timed tasks", "+{v} день до завдань із терміном", "+{v} día para tareas con límite")),
  M("bedtime_30", 30, 200, {
    pirates: N("Weekend Night Watch", "Вихідна нічна вахта", "Guardia nocturna de fin de semana"),
    space: N("Weekend Night Mode", "Нічний режим вихідних", "Modo nocturno de fin de semana"),
    dollhouse: N("Weekend Moonlight Bed", "Ліжко вихідного місячного сяйва", "Cama de luna de fin de semana"),
  }, N("Stay up {v} minutes later on Friday and Saturday", "Лягай спати на {v} хвилин пізніше у п'ятницю та суботу", "Acuéstate {v} minutos más tarde los viernes y sábados")),
  M("exp_10", 10, 240, {
    pirates: N("Explorer's Compass", "Компас дослідника", "Brújula del explorador"),
    space: N("Learning Core", "Навчальне ядро", "Núcleo de aprendizaje"),
    dollhouse: N("Scholar's Desk", "Стіл знавця", "Escritorio del estudioso"),
  }, N("+{v}% EXP from tasks", "+{v}% EXP за завдання", "+{v}% EXP por tareas")),
  M("chest_discount_20", 20, 280, {
    pirates: N("Master Key", "Майстер-ключ", "Llave maestra"),
    space: N("Supply Scanner", "Сканер припасів", "Escáner de suministros"),
    dollhouse: N("Lucky Toy Chest", "Щаслива скриня іграшок", "Cofre de juguetes de la suerte"),
  }, N("−{v}% chest price", "−{v}% ціни скринь", "−{v}% del precio de cofres")),
];

export function moduleBonusText(mod, lang) {
  const tpl = (mod.bonus[lang] || mod.bonus.en);
  return tpl.replaceAll("{v}", String(mod.bonusValue));
}
