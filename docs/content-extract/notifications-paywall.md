# Notifications — canonical events (verbatim EN/UK/ES)
Original stores bodies in English; UK/ES via exact-match dictionary + regex templates. Keep punctuation/quotes «» EXACT — translation matching depends on it.
Known untranslated (show English in UK/ES — keep as-is for parity): "Mystery drop collected", "{name} bought a Level {n} mystery drop and saved it in inventory.", "Permanent module unlocked", and 3 levelUpMessage suffixes (marked below).

Format: event → recipient → title EN/UK/ES → body EN/UK/ES

1. chest opened → parents
- Mystery drop opened | Таємний подарунок відкрито | Premio misterioso abierto
- {name} unlocked "{program}". | {name} відкрив/відкрила "{program}" у безкоштовному таємному подарунку. | {name} desbloqueó "{program}" en un premio misterioso gratis.
- NOTE: code sends body WITHOUT "free", translation adds "безкоштовному" — keep discrepancy as-is.

2. child password reset request → parents
- Password reset requested | Запит на скидання пароля | Solicitud para restablecer la contraseña
- {name} needs a new password. | {name} потрібен новий пароль. | {name} necesita una nueva contraseña.

3. parent password reset request → same parent account
- Password reset requested | Запит на скидання пароля | Solicitud para restablecer la contraseña
- A password reset was requested for this parent account. | Для цього батьківського облікового запису надійшов запит на скидання пароля. | Se solicitó restablecer la contraseña de esta cuenta de padres.

4. parent changed child password → child
- Password updated | Пароль оновлено | Contraseña actualizada
- Your parent set a new sign-in password. | Батьки встановили новий пароль для входу. | Tus padres establecieron una nueva contraseña de acceso.

5. new task → child
- New task | Нове завдання | Nueva tarea
- {title} · {coins} coins | {title} · {coins} монет | {title} · {coins} monedas

6. task submitted → parents
- Task ready to review | Завдання готове до перевірки | Tarea lista para revisar
- {name} finished "{title}". | {name} завершив/завершила "{title}". | {name} terminó "{title}".
- optional suffix: " Note: {note}" | " Примітка: {note}" | " Nota: {note}"

7. level-up on approve → parents (up to 4 separate)
- Plus chapter ready | Розділ Plus готовий | Capítulo Plus listo
  {name} earned enough EXP for Level {n}. Turn on Plus access to open the chapter and its rewards. | {name} заробив/заробила достатньо EXP для рівня {n}. Увімкніть Plus, щоб відкрити розділ і його винагороди. | {name} consiguió suficiente EXP para el nivel {n}. Activa Plus para abrir el capítulo y sus recompensas.
- Mission completed | Місію завершено | Misión completada
  {name} reached Level {n} and unlocked "{program}" from a free mystery drop. | {name} досяг/досягла рівня {n} й відкрив/відкрила "{program}" у безкоштовному таємному подарунку. | {name} alcanzó el nivel {n} y desbloqueó "{program}" en un premio misterioso gratis.
- Mission reward needs setup | Винагороду за місію треба налаштувати | Hay que configurar la recompensa de misión
  {name} reached Level {n}, but no unlocked mystery-drop programs are active in Game setup. | {name} досяг/досягла рівня {n}, але в налаштуваннях гри немає активних програм для таємного подарунка. | {name} alcanzó el nivel {n}, pero no hay programas activos para premios misteriosos en la configuración.
- Check Level {n} rewards | Перевірте винагороди рівня {n} | Revisa las recompensas del nivel {n}
  {name} has reached Level {n}. Review the reward names, effects, prices, and mystery-drop choices for this level in Game setup. | {name} досяг/досягла рівня {n}. Перевірте в налаштуваннях гри назви, ефекти, ціни й участь у таємних подарунках для цього рівня. | {name} alcanzó el nivel {n}. Revisa en la configuración los nombres, efectos, precios y opciones de premios misteriosos de este nivel.

8. badge → child
- Badge unlocked | Відзнаку відкрито | Insignia desbloqueada
- You earned the {badge} badge. | Ти здобув/здобула відзнаку "{badge}". | Conseguiste la insignia "{badge}".

9. task approved → child
- Level up! | Новий рівень! | ¡Subiste de nivel!   (on level-up)  OR  Task approved | Завдання схвалено | Tarea aprobada
- {coins} coins and {xp} EXP were added for "{title}". | За "{title}" додано {coins} монет і {xp} EXP. | Se añadieron {coins} monedas y {xp} EXP por "{title}".
- levelUpMessage suffixes (UNTRANSLATED — keep English): " Level {n} is ready, but Chapters 4–10 need Family Tasks Plus. Your EXP is safely saved." | " Level {n} reached — your free mystery drop contained "{program}" and is now in your inventory." | " Level {n} reached. Ask a parent to activate an unlocked mystery-drop power in Game setup."

10. task rejected → child
- Try again | Спробувати ще раз | Intentar de nuevo
- "{title}" needs another try. | "{title}" треба спробувати ще раз. | Hay que volver a intentar "{title}".

11. task suggestion → parents
- Task idea | Ідея завдання | Idea de tarea
- {name} suggested "{title}". | {name} запропонував/запропонувала "{title}". | {name} sugirió "{title}".

12. suggestion decision → child
- Task idea accepted | Ідею завдання схвалено | Idea de tarea aceptada
  A parent accepted your idea and can now turn it into a task. | Батьки схвалили твою ідею й тепер можуть перетворити її на завдання. | Tus padres aceptaron tu idea y ahora pueden convertirla en una tarea.
- Task idea declined | Ідею завдання відхилено | Idea de tarea rechazada
  Your idea "{title}" was declined. | Твою ідею "{title}" відхилено. | Tu idea "{title}" fue rechazada.

13. reward suggestion → parents
- New reward idea | Нова ідея винагороди | Nueva idea de recompensa
- {name} would love "{title}". | {name} хотів би/хотіла б "{title}". | {name} quiere "{title}".

14. reward suggestion declined → child
- Reward idea declined | Ідею винагороди відхилено | Idea de recompensa rechazada
- Your idea "{title}" was not added this time. | Цього разу твою ідею "{title}" не додано. | Esta vez no se añadió tu idea "{title}".

15. reward suggestion accepted → child
- Reward idea accepted | Ідею винагороди схвалено | Idea de recompensa aceptada
- "{title}" was added for {coins} coins. | "{title}" додано за {coins} монет. | Se añadió "{title}" por {coins} monedas.

16. reward request → parents
- Reward request | Запит на винагороду | Solicitud de recompensa
- {name} wants "{title}" for {coins} coins. | {name} хоче "{title}" за {coins} монет. | {name} quiere "{title}" por {coins} monedas.

17. reward decision → child
- Reward approved | Винагороду схвалено | Recompensa aprobada
  {coins} coins were redeemed for "{title}". | {coins} монет витрачено на "{title}". | Se canjearon {coins} monedas por "{title}".
- Reward declined | Винагороду відхилено | Recompensa rechazada
  Your request for "{title}" was declined. | Твій запит на "{title}" відхилено. | Tu solicitud de "{title}" fue rechazada.

18. chest bought (stored) → parents — UNTRANSLATED, keep English
- Mystery drop collected
- {name} bought a Level {n} mystery drop and saved it in inventory.

19. module bought → parents
- Permanent module unlocked   (UNTRANSLATED title — keep English)
- {name} bought "{module}". | {name} придбав/придбала "{module}". | {name} compró "{module}".

20. program bought → parents
- Program unlocked | Програму відкрито | Programa desbloqueado
- {name} bought the program "{program}". | {name} придбав/придбала програму "{program}". | {name} compró el programa "{program}".

21. program run → parents
- Program run | Програму запущено | Programa ejecutado
- {name} ran the program "{program}": {effect} | {name} запустив/запустила програму "{program}": {effect} | {name} ejecutó el programa "{program}": {effect}

22. Plus request → parents
- Plus access requested | Запит на доступ Plus | Acceso Plus solicitado
- {name} reached the end of the free adventure and wants to continue with Chapters 4–10. | {name} завершив/завершила безкоштовну пригоду й хоче продовжити з розділами 4–10. | {name} terminó la aventura gratuita y quiere continuar con los capítulos 4–10.

23. plan change → children
- All chapters unlocked | Усі розділи відкрито | Todos los capítulos desbloqueados
  Family Tasks Plus preview is on. Chapters 4–10 are now open when you reach them. | Попередній доступ Family Tasks Plus увімкнено. Розділи 4–10 відкриватимуться, коли ти до них дійдеш. | La vista previa de Family Tasks Plus está activa. Los capítulos 4–10 se abrirán cuando llegues a ellos.
- Free plan active | Безкоштовний план активний | Plan gratuito activo
  Chapters 1–3 stay open. Chapters 4–10 need Family Tasks Plus. | Розділи 1–3 залишаються відкритими. Для розділів 4–10 потрібен Family Tasks Plus. | Los capítulos 1–3 siguen abiertos. Los capítulos 4–10 requieren Family Tasks Plus.

## Notification modal chrome
- Notifications | Сповіщення | Notificaciones
- empty: All quiet | Усе спокійно | Todo tranquilo
- empty hint: New task, approval, and reward updates will appear here. | Тут з'являтимуться нові завдання, схвалення й оновлення винагород. | Aquí aparecerán nuevas tareas, aprobaciones y novedades de recompensas.
- time: just now | щойно | ahora mismo ; {n}m ago | {n} хв тому | hace {n} min ; {n}h ago | {n} год тому | hace {n} h

## Paywall texts
Parent panel (Family settings):
- badge: FREE | БЕЗКОШТОВНО | GRATIS  /  PLUS PREVIEW (hardcoded EN — keep)
- 3 chapters free. The full story has 10. | 3 розділи безкоштовно. Повна історія має 10. | 3 capítulos gratis. La historia completa tiene 10.
- Every world includes Levels 1–3. Family Tasks Plus opens Levels 4–10, their story chapters, level programs, and mystery rewards. | У кожному світі рівні 1–3 безкоштовні. Family Tasks Plus відкриває рівні 4–10, їхні розділи, програми й таємні винагороди. | Cada mundo incluye los niveles 1–3. Family Tasks Plus abre los niveles 4–10, sus capítulos, programas y recompensas misteriosas.
- Billing will be connected for the public release. Use preview access here to test the complete paid experience. | Оплату буде підключено для публічного запуску. Тут можна ввімкнути попередній доступ, щоб перевірити повну платну версію. | Los pagos se conectarán en el lanzamiento público. Usa aquí el acceso de prueba para probar la experiencia completa.
- Preview Plus access | Увімкнути Plus для перевірки | Probar acceso Plus  ↔  Return to free preview | Повернути безкоштовний режим | Volver al modo gratuito
- Updating… | Оновлення… | Actualizando…

Locked modal (child):
- tag: FAMILY TASKS PLUS (hardcoded — keep)
- The story continues here. | Історія продовжується тут. | La historia continúa aquí.
- Levels 1–3 are included free. Plus opens Chapters 4–10 in every world, along with their level programs and mystery rewards. | Рівні 1–3 доступні безкоштовно. Plus відкриває розділи 4–10 у кожному світі, а також програми цих рівнів і таємні винагороди. | Los niveles 1–3 están incluidos gratis. Plus abre los capítulos 4–10 en todos los mundos, junto con sus programas de nivel y recompensas misteriosas.
- preview: Chapter {N}: {title} | Розділ {N}: {title} | Capítulo {N}: {title}  (+ scene + Mission: {mission} | Місія: {mission} | Misión: {mission})
- Ask a parent to unlock Plus | Попросити батьків відкрити Plus | Pedir a tus padres que abran Plus → Sending… | Надсилання… | Enviando… → Parent notified | Батьків сповіщено | Padres avisados
- Keep playing free | Продовжити безкоштовну гру | Seguir jugando gratis

Level map tags: PLUS / FREE (hardcoded — keep). Locked levels show ⌁.
Free-limit rank row: "Free journey complete · EXP keeps saving for Plus" (hardcoded EN — keep).
