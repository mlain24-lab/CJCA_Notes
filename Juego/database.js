/* ============================================================
   BASE DE DATOS EXTERNA EXTENDIDA: database.js
   El Códice de las Estrellas — Repositorio Literario y de Objetos
============================================================ */

const GAME_DATABASE = {
    acts: [
        "Acto I: Los Primeros Fragmentos del Despertar",
        "Acto II: El Laberinto de las Sombras Interiores",
        "Acto III: Ecos del Tiempo y la Distancia",
        "Acto IV: La Revelación Definitiva del Códice"
    ],
    
    defeatPhrases: [
        "«La oscuridad no pudo apagar por completo la llama... vuelve a intentarlo en el siguiente sendero estelar.»",
        "«Aun en la derrota, cada paso grabado en el Códice enseña el camino correcto hacia la verdadera luz.»",
        "«El abismo intentó borrar tu nombre, pero las constelaciones guardan celosamente tu memoria y tu esfuerzo.»",
        "«Un tropiezo en el sendero estelar no es el fin del viaje, sino una pausa necesaria en la eternidad.»",
        "«Las sombras son pasajeras y efímeras; levántate con firmeza y reclama tu lugar legítimo en el Códice.»",
        "«Incluso las estrellas más brillantes experimentan eclipses antes de volver a brillar con intensidad.»",
        "«No temas al eco del abismo; tu voluntad es más fuerte que cualquier laberinto temporal.»",
        "«El sendero de la memoria exige paciencia y valor. Sacúdete el polvo estelar y avanza de nuevo.»"
    ],

    lateralVerses: [
        "El amor no mira con los ojos, sino con el alma. — William Shakespeare",
        "Estar contigo convierte el tiempo fugaz en un lugar habitable y eterno.",
        "Tus ojos son una pequeña constelación brillante contra los días más oscuros.",
        "He cruzado océanos enteros de tiempo y espacio para encontrarte. — Mary Shelley",
        "Si sé lo que es el amor verdadero, es gracias a ti. — Hermann Hesse",
        "Andábamos sin buscarnos, pero sabíamos que caminábamos hacia el mismo lugar. — Julio Cortázar",
        "Algunas almas se reconocen y se entrelazan antes de aprender sus nombres.",
        "No hay distancia física capaz de borrar una historia verdaderamente compartida.",
        "La esperanza es una estrella que se vislumbra mejor cuando todo parece oscuro.",
        "El corazón también sabe leer mapas ocultos que los ojos desconocen.",
        "Hay encuentros que parecen casualidad hasta que recordamos lo que cambió después.",
        "Quizá amar consista exactamente en aprender el camino de regreso a la misma persona.",
        "El futuro no está escrito en piedra: se construye activamente con cada paso juntos.",
        "Toda aventura necesita un destino, pero las mejores siempre necesitan compañía.",
        "Bajo este cielo estelar, cada latido del corazón es un verso inmortal.",
        "Incluso en el laberinto más oscuro y profundo, tu recuerdo es la brújula perfecta.",
        "El eco de tus pasos resuena con fuerza en los pasillos infinitos de la eternidad.",
        "No tememos a la sombra porque llevamos la luz inextinguible del Códice dentro.",
        "Dos almas entrelazadas desafían con valentía las leyes del tiempo y el espacio.",
        "Cada fruta recolectada es una chispa brillante de esperanza en la penumbra.",
        "Lo esencial es invisible a los ojos. Solo se ve con el corazón. — Antoine de Saint-Exupéry",
        "Hay libros cuyas portadas y contraportadas son el principio y el fin de todo. — R. M. Rilke",
        "Donde hay amor y sabiduría, no hay temor ni oscuridad posible. — Dante Alighieri"
    ],

    literaryMasterpieces: [
        { work: "La Odisea", author: "Homero", text: "No hay nada más noble ni más digno de alabanza que cuando el hombre y la mujer comparten un hogar con un mismo entendimiento, superando tormentas y designios divinos." },
        { work: "Los Pilares de la Tierra", author: "Ken Follett", text: "El amor era un sentimiento extraño, extraordinariamente poderoso e impredecible que desafiaba cualquier lógica arquitectónica y cualquier cimiento de piedra tallada." },
        { work: "Orgullo y Prejuicio", author: "Jane Austen", text: "Tus esperanzas y tus deseos profundos están fundados firmemente en la razón, pero el afecto verdadero siempre supera cualquier cálculo humano." },
        { work: "Cumbres Borrascosas", author: "Emily Brontë", text: "No importa de qué material estemos hechas las almas, la suya y la mía son exactamente idénticas, unidas por un lazo eterno." },
        { work: "Cien Años de Soledad", author: "Gabriel García Márquez", text: "El secreto de una buena y apacible vejez no es otra cosa que un pacto honrado, sincero y profundo con la soledad compartida." },
        { work: "El Gran Gatsby", author: "F. Scott Fitzgerald", text: "Miraba hacia ella con una intensidad deslumbrante que abarcaba todo el misterio insondable del universo y el flujo inexorable del tiempo." },
        { work: "Veinte poemas de amor", author: "Pablo Neruda", text: "Me gustas cuando callas porque estás como ausente, y me oyes desde la lejanía mientras mi voz intenta rozar tu alma." },
        { work: "Rimas", author: "Gustavo Adolfo Bécquer", text: "Podrá nublarse el sol eternamente; podrá secarse en un instante el mar; podrá romperse el eje frágil de la tierra. Jamás podrá apagarse tu llama." },
        { work: "Romeo y Julieta", author: "William Shakespeare", text: "Mis labios, dos peregrinos ruborizados, están listos para suavizar ese áspero toque con un tierno y eterno beso." },
        { work: "Cartas a un joven poeta", author: "Rainer Maria Rilke", text: "El amor auténtico es elevado: consiste en dos solitarias existencias que se protegen mutuamente, se limitan con respeto y se saludan." },
        { work: "Don Quijote de la Mancha", author: "Miguel de Cervantes", text: "El amor apremia los corazones, quita los temores y hace que los imposibles parezcan fáciles y cercanos en la travesía." },
        { work: "El Principito", author: "Antoine de Saint-Exupéry", text: "Sólo se ve bien con el corazón. Lo esencial es invisible a los ojos de los hombres y de las estrellas." },
        { work: "Crimen y Castigo", author: "Fiódor Dostoyevski", text: "El alma humana se purifica al hallar la compasión y el afecto sincero que disipan las tinieblas del sufrimiento." },
        { work: "La Divina Comedia", author: "Dante Alighieri", text: "El amor es la fuerza infinita que mueve el sol y las demás estrellas en su danza eterna." },
        { work: "Jane Eyre", author: "Charlotte Brontë", text: "No soy un pájaro y ninguna red me atrapa; soy un ser humano libre con una voluntad independiente unida a la tuya." },
        { work: "Drácula", author: "Bram Stoker", text: "Nuestros alientos se entrelazaron en la penumbra, desafiando la inmortalidad misma con la fuerza de un latido." },
        { work: "Rayuela", author: "Julio Cortázar", text: "Andábamos sin buscarnos, sabiendo que andábamos para encontrarnos en cada recodo de este inmenso laberinto." },
        { work: "La Sombra del Viento", author: "Carlos Ruiz Zafón", text: "Cada libro, cada tomo que ves, tiene alma. El alma de quien lo escribió y de quienes lo leyeron soñando." },
        { work: "Frankenstein", author: "Mary Shelley", text: "No hay atadura más fuerte que la comprensión mutua entre dos almas perdidas en la inmensidad del cosmos." },
        { work: "La Metamorfosis", author: "Franz Kafka", text: "Incluso cuando el mundo cambia de forma a nuestro alrededor, el calor de un recuerdo verdadero permanece inalterable." },
        { work: "El Señor de los Anillos", author: "J.R.R. Tolkien", text: "Un camino sigue y sigue, desde la puerta donde comenzó, hasta que el camino se ha ido muy lejos y yo debo seguirlo si puedo con valor." },
        { work: "Fahrenheit 451", author: "Ray Bradbury", text: "No hay que quemar los libros; hay que encender en las mentes la chispa eterna de la curiosidad, el arte y la memoria." },
        { work: "1984", author: "George Orwell", text: "Si hay esperanza de libertad, reside en las masas y en la inquebrantable capacidad de recordar lo que fuimos antes del olvido." },
        { work: "Ulises", author: "James Joyce", text: "Las historias fluyen como ríos subterráneos oscuros que conectan las esquinas del tiempo con nuestros propios pasos en el laberinto." },
        { work: "Los Hermanos Karamazov", author: "Fiódor Dostoyevski", text: "Ama a toda la creación de Dios, tanto su totalidad como cada grano de arena que compone el universo estelar." },
        { work: "Moby Dick", author: "Herman Melville", text: "Es el mar el que nos llama desde el fondo de los siglos con su canto inalterable de misterio y aventura." },
        { work: "El Retrato de Dorian Gray", author: "Oscar Wilde", text: "La belleza es una forma de genio, superior incluso al genio mismo, pues no necesita explicaciones ante el tiempo." },
        { work: "Los Miserables", author: "Victor Hugo", text: "Amar a otra persona es ver el rostro luminoso de la divinidad en medio de la tormenta del mundo." },
        { work: "Guerra y Paz", author: "León Tolstói", text: "No hay más que dos fuentes de los vicios humanos: la ociosidad y la superstición; y no hay más que dos virtudes: la actividad y la inteligencia." },
        { work: "Anna Karenina", author: "León Tolstói", text: "Todas las familias felices se asemejan; cada familia infeliz es infeliz a su manera en los laberintos del tiempo." },
        { work: "Madame Bovary", author: "Gustave Flaubert", text: "El lenguaje humano es como un caldero agrietado en el que tocamos melodías para que bailen los osos, cuando quisiéramos conmover a las estrellas." },
        { work: "El Viejo y el Mar", author: "Ernest Hemingway", text: "El hombre no está hecho para la derrota; un hombre puede ser destruido, pero jamás vencido por las mareas." },
        { work: "Fausto", author: "Johann Wolfgang von Goethe", text: "Quien aspira a luchar y se esfuerza sin descanso, a ese hombre podemos salvarlo de la sombra y llevarlo a la luz." },
        { work: "En busca del tiempo perdido", author: "Marcel Proust", text: "Los verdaderos paraísos son los paraísos que hemos perdido en los pasillos de la memoria y el afecto." },
        { work: "El Nombre de la Rosa", author: "Umberto Eco", text: "Los libros no están hechos para que uno crea en ellos, sino para ser sometidos a indagación y diálogo constante." },
        { work: "La Eneida", author: "Virgilio", text: "Los anhelos divinos conmueven los corazones y guían a los héroes a través de los mares tempestuosos de la historia." },
        { work: "El Silmarillion", author: "J.R.R. Tolkien", text: "Y el cantar de los Ainur tejió la trama del mundo, donde cada nota resuena en la eternidad estelar." },
        { work: "Las Flores del Mal", author: "Charles Baudelaire", text: "El tiempo es un jugador ávido que gana sin hacer trampas, en cada segundo que pasa robando nuestros recuerdos." },
        { work: "Pedro Páramo", author: "Juan Rulfo", text: "Vine a Comala porque me dijeron que acá vivía mi padre, un tal Pedro Páramo, y busqué su voz entre los ecos." },
        { work: "Matar a un ruiseñor", author: "Harper Lee", text: "Nunca de verdad entiendes a una persona hasta que consideras las cosas desde su punto de vista, hasta que caminas en sus zapatos." },
        { work: "La Conjura de los Necios", author: "John Kennedy Toole", text: "Cuando un genio verdadero aparece en el mundo, lo reconocen por esta señal: todos los necios se conjuran contra él." },
        { work: "El idiota", author: "Fiódor Dostoyevski", text: "La belleza salvará al mundo si somos capaces de reconocerla en los actos más sencillos de compasión." },
        { work: "El hobbit", author: "J.R.R. Tolkien", text: "El mundo no está en tus libros y mapas; está ahí fuera, desafiando tus pasos con misterios antiguos." },
        { work: "Las Metamorfosis", author: "Ovidio", text: "Mi ánimo me lleva a decir de las formas mudadas en nuevos cuerpos: oh dioses, favorezcan mis empresas." },
        { work: "Cuentos", author: "Edgar Allan Poe", text: "Aquellos que sueñan de día son conscientes de muchas cosas que escapan a los que sueñan solo de noche." }
    ],

    itemsByTier: {
        tier_1: [
            { id: "fruit_silver", name: "Fruta de Plata", type: "resource", desc: "Restaura vitalidad y otorga +150 puntos." },
            { id: "charm_rose", name: "Amuleto de Zarza", type: "relic", desc: "Reduce el impacto de los peligros en el jardín." }
        ],
        tier_2: [
            { id: "pearl_deep", name: "Perla Abisal", type: "relic", desc: "Permite percibir la posición de las corrientes ocultas." },
            { id: "essence_tide", name: "Esencia de Marea", type: "consumable", desc: "Otorga un escudo temporal protector." }
        ],
        tier_3: [
            { id: "feather_mirror", name: "Pluma de Espejo", type: "relic", desc: "Duplica la resonancia estelar al recolectar recuerdos." }
        ],
        tier_legendary: [
            { id: "codex_shard", name: "Fragmento Vivo del Códice", type: "legendary", desc: "Conecta todas las dimensiones del laberinto de forma permanente." }
        ]
    },

    getPage(n) {
        let masterpiece = this.literaryMasterpieces[(n - 1) % this.literaryMasterpieces.length];
        let actIndex = Math.floor((n - 1) / 125);
        let actTitle = this.acts[Math.min(3, actIndex)];
        
        let expandedReflection = `En esta página ${n} del Códice estelar, perteneciente al ${actTitle}, la tinta brilla con matices profundos que desafían el tiempo lineal. La obra cumbre '${masterpiece.work}' escrita por ${masterpiece.author} resuena profundamente en las paredes del laberinto. Nos transmite la siguiente verdad inmortal: «${masterpiece.text}». Al cruzar este umbral, el Viajero comprende que la literatura no es solo tinta sobre papel antiguo, sino un tejido vivo de experiencias, batallas épicas, romances atemporales y descubrimientos que conectan los grandes mitos de la humanidad con la travesía actual en la ROG Ally. Cada sala superada desbloquea un fragmento de esta memoria cósmica, permitiendo avanzar con paso firme hacia el corazón mismo de la eternidad y consolidando una narrativa rica, pulida y lista para la posteridad técnica.`;

        return {
            title: `${actTitle} — Página ${n} de 500`,
            author: `${masterpiece.author} (${masterpiece.work})`,
            text: expandedReflection
        };
    },

    queryItems(chapterIndex) {
        if (chapterIndex <= 1) return [...this.itemsByTier.tier_1];
        if (chapterIndex <= 3) return [...this.itemsByTier.tier_1, ...this.itemsByTier.tier_2];
        if (chapterIndex <= 6) return [...this.itemsByTier.tier_2, ...this.itemsByTier.tier_3];
        return [...this.itemsByTier.tier_3, ...this.itemsByTier.tier_legendary];
    },

    getRandomDefeatPhrase() {
        return this.defeatPhrases[Math.floor(Math.random() * this.defeatPhrases.length)];
    }
};