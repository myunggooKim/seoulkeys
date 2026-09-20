import type { Locale } from "./locale-detection";

const lines = (value: string): string[] => value.trim().split("\n").map((line) => line.trim());

export const proverbMeaningTranslations: Partial<Record<Locale, string[]>> = {
  es: lines(`
Las palabras amables atraen palabras amables.
Los pequeños cambios se acumulan sin que lo notes.
No olvides tus orígenes humildes.
Los débiles pueden sufrir cuando luchan los poderosos.
La alegría llega después de las dificultades.
El esfuerzo cuidadoso produce resultados duraderos.
El potencial adquiere valor mediante la acción.
Algo deseable pero inalcanzable.
Hasta un buen paisaje se disfruta más después de comer.
Cuanto más urgente sea, más cuidado debes tener.
Ten cuidado, porque otros pueden oír las palabras privadas.
Mis propios problemas requieren atención primero.
Es extremadamente fácil.
Todo decae después de alcanzar su punto máximo.
Es una comparación entre personas casi iguales.
Comprueba incluso lo que parece seguro antes de actuar.
Lo más cercano puede ser lo más difícil de notar.
Una palabra considerada puede resolver una gran deuda.
Distintos caminos pueden llevar a la misma meta.
La traición suele venir de donde depositamos la confianza.
Hasta el trabajo ligero es más fácil entre todos.
Una buena presentación mejora un buen contenido.
Las dificultades pueden fortalecer las cosas.
Los recipientes vacíos hacen más ruido.
La exposición prolongada conduce naturalmente al aprendizaje.
Los hábitos tempranos duran toda la vida.
Arreglar las cosas después de que el daño ya está hecho.
Un buen comienzo es la mitad del trabajo.
Pregunta y comprueba incluso en un camino conocido.
No hay humo sin una causa.
La perseverancia puede superar una tarea difícil.
La ropa puede transformar una impresión.
Una visión estrecha confunde sus límites con el mundo.
Hasta los expertos cometen errores.
Un buen liderazgo marca el tono para los demás.
Un tamaño pequeño puede ocultar una gran fuerza.
No descargues tu ira sobre la persona equivocada.
Hasta los mansos se resisten si los presionan demasiado.
Un largo viaje comienza con un paso.
Las pequeñas ganancias se acumulan hasta formar algo grande.
Es casi imposiblemente difícil.
La inexperiencia puede impedir reconocer el peligro.
Habla de alguien y quizá aparezca.
Un pequeño problema descuidado se convierte en uno grande.
Es difícil responder a la bondad con crueldad.
Llegas justo cuando ocurre algo inesperado.
Usa la segunda mejor opción si la ideal no está disponible.
Lo de los demás suele parecer mejor.
Una oportunidad perdida suele parecer mayor después.
Las primeras señales suelen revelar una promesa futura.
Es una tarea fácil y segura.
El coste adicional supera el valor principal.
Alguien causa daño y luego finge ayudar.
Demasiados líderes pueden desviar el trabajo.
Una dificultad sigue a otra.
Es solo una fracción diminuta del total.
Los resultados se derivan de sus causas.
Una gran obra no se completa en un solo intento.
El afecto ofrecido invita a recibir afecto.
Una pequeña mala acción puede crecer hasta ser mayor.
Las palabras viajan muy lejos y muy rápido.
Cosechas lo que siembras.
El fracaso inicia el aprendizaje, no termina el esfuerzo.
La constancia puede volverse más fuerte que el talento.
El pequeño paso de hoy crea el camino de mañana.
La velocidad llega cuando la precisión se convierte en hábito.
Crecer empieza por preguntar lo que no sabes.
Descansar no es lo mismo que rendirse.
Registra las pequeñas victorias para mantener la motivación.
Mide tu progreso comparándote con tu yo del pasado.
Empieza en vez de esperar el momento perfecto.
Un ritmo constante en la dirección correcta también llega.
Diez minutos de concentración superan una hora distraída.
El conocimiento se vuelve tuyo cuando lo usas.
Una buena pregunta puede durar más que una buena respuesta.
Un registro dura más que la memoria.
Corregir los errores construye una memoria más clara.
Incluso en un día difícil puedes escribir una línea.
Cada persona aprende a un ritmo diferente.
Una breve palabra amable puede dejar una huella duradera.
Escucha, repite y escríbelo tú mismo.
La práctica diaria convierte letras desconocidas en amigas.
`),
  "pt-BR": lines(`
Palavras gentis atraem palavras gentis.
Pequenas mudanças se acumulam antes que você perceba.
Não esqueça suas origens humildes.
Os fracos podem sofrer quando os poderosos brigam.
A alegria vem depois das dificuldades.
O esforço cuidadoso produz resultados duradouros.
O potencial ganha valor por meio da ação.
Algo desejável, mas inalcançável.
Até uma bela paisagem fica melhor depois de uma refeição.
Quanto mais urgente, mais cuidado você deve ter.
Tenha cuidado, pois palavras privadas podem ser ouvidas.
Meus próprios problemas precisam de atenção primeiro.
É extremamente fácil.
Tudo diminui depois de atingir o auge.
É uma comparação entre pessoas quase iguais.
Confira até o que parece certo antes de agir.
O que está mais perto pode ser mais difícil de notar.
Uma palavra atenciosa pode resolver uma grande dívida.
Caminhos diferentes podem chegar ao mesmo objetivo.
A traição costuma vir de onde depositamos confiança.
Até o trabalho leve fica mais fácil em conjunto.
Uma boa apresentação valoriza um bom conteúdo.
As dificuldades podem tornar as coisas mais fortes.
Recipientes vazios fazem mais barulho.
A convivência prolongada leva naturalmente ao aprendizado.
Hábitos adquiridos cedo duram a vida inteira.
Consertar as coisas depois que o dano já aconteceu.
Um bom começo é metade do trabalho.
Pergunte e confira até em um caminho conhecido.
Não há fumaça sem causa.
A persistência pode superar uma tarefa difícil.
As roupas podem transformar uma impressão.
Uma visão estreita confunde seus limites com o mundo.
Até especialistas cometem erros.
Uma boa liderança define o tom para os demais.
Um tamanho pequeno pode esconder uma grande força.
Não desconte sua raiva na pessoa errada.
Até os mansos resistem quando pressionados demais.
Uma longa jornada começa com um passo.
Pequenos ganhos se acumulam e viram algo grande.
É quase impossivelmente difícil.
A inexperiência pode não reconhecer o perigo.
Fale de alguém e essa pessoa pode aparecer.
Um pequeno problema ignorado se torna um grande problema.
É difícil responder à gentileza com crueldade.
Você chega justamente quando acontece algo inesperado.
Use a segunda melhor opção quando a ideal não estiver disponível.
O que os outros têm costuma parecer melhor.
Uma oportunidade perdida parece maior depois.
Os primeiros sinais costumam revelar uma promessa futura.
É uma tarefa fácil e certa.
O custo adicional supera o valor principal.
Alguém causa dano e depois finge ajudar.
Líderes demais podem desviar o trabalho.
Uma dificuldade vem depois da outra.
É apenas uma fração minúscula do todo.
Os resultados seguem suas causas.
Um grande trabalho não termina em uma única tentativa.
O carinho oferecido convida o carinho de volta.
Um pequeno erro pode crescer e virar um erro maior.
As palavras viajam muito longe e muito rápido.
Você colhe o que planta.
O fracasso inicia o aprendizado, não encerra o esforço.
A constância pode se tornar mais forte que o talento.
O pequeno passo de hoje cria o caminho de amanhã.
A velocidade vem quando a precisão vira hábito.
O crescimento começa ao perguntar o que você não sabe.
Descansar não é o mesmo que desistir.
Registre pequenas vitórias para manter a motivação.
Meça seu progresso em relação ao seu eu do passado.
Comece em vez de esperar o momento perfeito.
Um ritmo constante na direção certa também chega ao destino.
Dez minutos focados podem superar uma hora distraída.
O conhecimento se torna seu quando você o usa.
Uma boa pergunta pode durar mais que uma boa resposta.
Um registro dura mais que a memória.
Erros corrigidos constroem uma memória mais clara.
Mesmo em um dia difícil, você pode escrever uma linha.
Cada pessoa aprende em um ritmo diferente.
Uma breve palavra gentil pode deixar uma marca duradoura.
Ouça, repita e escreva você mesmo.
A prática diária transforma letras desconhecidas em amigas.
`),
  fr: lines(`
Les paroles aimables appellent des paroles aimables.
Les petits changements s'accumulent avant qu'on ne s'en aperçoive.
N'oubliez pas vos modestes débuts.
Les faibles peuvent souffrir lorsque les puissants se battent.
La joie vient après les épreuves.
Un effort attentif produit des résultats durables.
Le potentiel prend de la valeur par l'action.
Quelque chose de désirable mais d'inaccessible.
Même un beau paysage s'apprécie mieux après un repas.
Plus c'est urgent, plus il faut avancer prudemment.
Soyez prudent, car des paroles privées peuvent être entendues.
Mes propres problèmes exigent d'abord mon attention.
C'est extrêmement facile.
Tout décline après avoir atteint son sommet.
C'est une comparaison entre presque égaux.
Vérifiez même ce qui paraît certain avant d'agir.
Ce qui est le plus proche peut être le plus difficile à remarquer.
Une parole réfléchie peut régler une grande dette.
Des chemins différents peuvent mener au même but.
La trahison vient souvent de là où l'on avait confiance.
Même un travail léger est plus facile à plusieurs.
Une bonne présentation valorise un bon contenu.
Les épreuves peuvent rendre les choses plus solides.
Les récipients vides font le plus de bruit.
Une longue exposition mène naturellement à l'apprentissage.
Les habitudes précoces durent toute une vie.
Réparer après que le mal est fait.
Un bon début représente la moitié du travail.
Demandez et vérifiez même sur une route familière.
Il n'y a pas de fumée sans cause.
La persévérance peut vaincre une tâche difficile.
Les vêtements peuvent transformer une impression.
Une vision étroite prend ses limites pour le monde.
Même les experts font des erreurs.
Un bon leadership donne le ton à tous.
Une petite taille peut cacher une grande force.
Ne reportez pas votre colère sur la mauvaise personne.
Même les plus doux résistent quand on les pousse trop loin.
Un long voyage commence par un pas.
Les petits gains s'accumulent pour devenir grands.
C'est presque impossible.
Le manque d'expérience peut empêcher de voir le danger.
Parlez de quelqu'un et il peut apparaître.
Un petit problème négligé en devient un grand.
Il est difficile de répondre à la bonté par la cruauté.
Vous arrivez au moment même où survient un imprévu.
Choisissez la meilleure solution de rechange si l'idéale manque.
Ce que possèdent les autres paraît souvent meilleur.
Une occasion manquée semble souvent plus grande après coup.
Les premiers signes révèlent souvent les promesses futures.
C'est une tâche facile et sûre.
Le coût annexe dépasse la valeur principale.
Quelqu'un fait du mal puis prétend aider.
Trop de chefs peuvent égarer le travail.
Une difficulté en suit une autre.
Ce n'est qu'une infime partie de l'ensemble.
Les résultats découlent de leurs causes.
Un grand travail ne s'accomplit pas en une seule tentative.
La chaleur donnée appelle la chaleur en retour.
Une petite faute peut devenir une faute plus grave.
Les paroles voyagent très loin et très vite.
On récolte ce que l'on sème.
L'échec commence l'apprentissage au lieu d'arrêter l'effort.
La régularité peut devenir plus forte que le talent.
Le petit pas d'aujourd'hui crée le chemin de demain.
La vitesse vient lorsque la précision devient une habitude.
Grandir commence par demander ce que l'on ignore.
Se reposer n'est pas abandonner.
Notez les petites victoires pour entretenir la motivation.
Mesurez vos progrès par rapport à votre ancien vous.
Commencez au lieu d'attendre le moment parfait.
Un rythme régulier dans la bonne direction mène aussi au but.
Dix minutes concentrées valent mieux qu'une heure distraite.
La connaissance devient vôtre lorsque vous l'utilisez.
Une bonne question peut durer plus qu'une bonne réponse.
Une trace écrite dure plus longtemps que la mémoire.
Corriger ses erreurs construit une mémoire plus nette.
Même un jour difficile, vous pouvez écrire une ligne.
Chacun apprend à son propre rythme.
Un bref mot aimable peut laisser une marque durable.
Écoutez, répétez et écrivez vous-même.
La pratique quotidienne transforme les lettres inconnues en amies.
`),
  it: lines(`
Le parole gentili invitano parole gentili.
I piccoli cambiamenti si accumulano prima che tu te ne accorga.
Non dimenticare le tue umili origini.
I deboli possono soffrire quando i potenti litigano.
La gioia arriva dopo le difficoltà.
Un impegno accurato crea risultati duraturi.
Il potenziale acquista valore attraverso l'azione.
Qualcosa di desiderabile ma irraggiungibile.
Anche un bel panorama è migliore dopo un pasto.
Più è urgente, più bisogna procedere con attenzione.
Fai attenzione, perché le parole private possono essere ascoltate.
I miei problemi richiedono prima attenzione.
È estremamente facile.
Tutto cala dopo aver raggiunto il culmine.
È un confronto tra persone quasi uguali.
Controlla anche ciò che sembra certo prima di agire.
Ciò che è più vicino può essere più difficile da notare.
Una parola premurosa può saldare un grande debito.
Strade diverse possono portare allo stesso obiettivo.
Il tradimento spesso viene da chi godeva della nostra fiducia.
Anche un lavoro leggero è più facile insieme.
Una buona presentazione valorizza un buon contenuto.
Le difficoltà possono rendere le cose più forti.
I recipienti vuoti fanno più rumore.
Una lunga esposizione porta naturalmente all'apprendimento.
Le abitudini precoci durano tutta la vita.
Riparare le cose dopo che il danno è fatto.
Un buon inizio è metà del lavoro.
Chiedi e controlla anche su una strada conosciuta.
Non c'è fumo senza una causa.
La perseveranza può superare un compito difficile.
I vestiti possono trasformare un'impressione.
Una visione ristretta scambia i propri limiti per il mondo.
Anche gli esperti commettono errori.
Una buona guida dà il tono a chi segue.
Una piccola statura può nascondere una grande forza.
Non sfogare la rabbia sulla persona sbagliata.
Anche i miti resistono quando sono spinti troppo oltre.
Un lungo viaggio comincia con un passo.
Piccoli guadagni si accumulano fino a diventare grandi.
È quasi impossibilmente difficile.
L'inesperienza può impedire di riconoscere il pericolo.
Parla di qualcuno e potrebbe apparire.
Un piccolo problema trascurato diventa grande.
È difficile rispondere alla gentilezza con crudeltà.
Arrivi proprio quando accade qualcosa di inatteso.
Usa la seconda scelta migliore quando l'ideale non è disponibile.
Ciò che hanno gli altri spesso sembra migliore.
Un'occasione persa sembra più grande col senno di poi.
I primi segnali spesso rivelano una promessa futura.
È un compito facile e sicuro.
Il costo aggiuntivo supera il valore principale.
Qualcuno fa del male e poi finge di aiutare.
Troppi capi possono mandare il lavoro fuori strada.
Una difficoltà ne segue un'altra.
È solo una piccolissima parte del tutto.
I risultati seguono le loro cause.
Un grande lavoro non si completa in un solo tentativo.
Il calore donato invita calore in cambio.
Una piccola cattiva azione può diventare più grave.
Le parole viaggiano molto lontano e velocemente.
Raccogli ciò che semini.
Il fallimento dà inizio all'apprendimento, non pone fine allo sforzo.
La costanza può diventare più forte del talento.
Il piccolo passo di oggi crea il cammino di domani.
La velocità arriva quando la precisione diventa un'abitudine.
La crescita inizia chiedendo ciò che non sai.
Riposare non significa arrendersi.
Registra le piccole vittorie per mantenere la motivazione.
Misura i progressi rispetto al tuo io passato.
Inizia invece di aspettare il momento perfetto.
Un passo costante nella direzione giusta arriva comunque.
Dieci minuti concentrati battono un'ora distratta.
La conoscenza diventa tua quando la usi.
Una buona domanda può durare più di una buona risposta.
Una registrazione dura più della memoria.
Gli errori corretti costruiscono una memoria più chiara.
Anche in un giorno difficile puoi scrivere una riga.
Ognuno impara a un ritmo diverso.
Una breve parola gentile può lasciare un segno duraturo.
Ascolta, ripeti e scrivilo tu stesso.
La pratica quotidiana trasforma lettere sconosciute in amiche.
`),
  ja: lines(`
優しい言葉は優しい言葉を呼びます。
小さな変化も気づかないうちに積み重なります。
苦しかった初心を忘れてはいけません。
強い者同士の争いで弱い者が傷つくことがあります。
苦労のあとには喜びが訪れます。
丁寧な努力は長く続く成果を生みます。
可能性は行動してこそ価値になります。
欲しくても実際には手に入らないものです。
どんな絶景も食事のあとならより楽しめます。
急ぐときほど慎重に進むべきです。
内緒話も誰かに聞かれることがあるので注意しましょう。
まず自分の差し迫った問題に対処する必要があります。
とても簡単なことです。
すべては頂点に達したあと衰えていきます。
ほとんど差のない者同士を比べることです。
確実に見えることも行動前に確認しましょう。
身近なものほど気づきにくいことがあります。
思いやりのある一言が大きな問題を解決できます。
違う道でも同じ目的地に着けます。
裏切りは信頼していた相手から起こりがちです。
軽い仕事でも一緒にすればもっと楽になります。
よい中身は見せ方がよいとさらに伝わります。
苦難を経ることで物事はより強くなります。
中身のない人ほど大きな声を出しがちです。
長く見聞きすれば自然に学べます。
幼い頃の習慣は一生続きます。
被害が出てから遅れて直すことです。
よい始まりは仕事の半分を終えたのと同じです。
慣れた道でも尋ねて確認しましょう。
原因なしに結果は生まれません。
粘り強さは難しい課題にも打ち勝てます。
服装は人の印象を大きく変えます。
狭い見方では自分の限界を世界のすべてだと思ってしまいます。
達人でも失敗することがあります。
上に立つ人の姿勢が周りの基準になります。
小さな体にも大きな力が隠れていることがあります。
関係のない人に怒りをぶつけてはいけません。
おとなしい人でも追い詰められれば抵抗します。
長い旅も最初の一歩から始まります。
小さな積み重ねが大きな成果になります。
ほとんど不可能なほど難しいことです。
経験が少ないと危険に気づけないことがあります。
人の話をしているとその人が現れることがあります。
小さな問題も放置すると大きくなります。
親切に対して冷酷に応じるのは難しいものです。
思いがけない出来事のちょうどその時に出会うことです。
理想のものがなければ次に近いもので代えます。
他人のものは自分のものよりよく見えがちです。
逃した機会はあとになるほど大きく見えます。
将来性は早い段階の兆しに表れることがあります。
簡単で確実な仕事です。
付随する費用が本体の価値を上回っています。
害を与えたあとで助けるふりをすることです。
指図する人が多すぎると仕事は迷走します。
一つの困難を越えると次の困難が現れます。
全体から見ればごくわずかな量です。
結果は原因に応じて生まれます。
大きな仕事は一度の努力では完成しません。
温かさを与えれば温かさが返ってきます。
小さな悪事もやがて大きな過ちになり得ます。
言葉はとても遠くへ速く広がります。
自分の行いに応じた結果を得ます。
失敗は努力の終わりではなく学びの始まりです。
継続する力は才能より強くなることがあります。
今日の小さな一歩が明日の道をつくります。
正確さが習慣になれば速さはあとからついてきます。
知らないことを尋ねるところから成長が始まります。
休むことは諦めることではありません。
小さな成功を記録して意欲を保ちましょう。
過去の自分を基準に成長を測りましょう。
完璧な時を待たずに始めましょう。
正しい方向ならゆっくりでも目的地に着きます。
集中した10分は散漫な1時間に勝ります。
知識は使うことで自分のものになります。
よい質問はよい答えより長く残ることがあります。
記録は記憶より長く残ります。
間違いを直すことでより確かな記憶が育ちます。
つらい日でも一行なら書けます。
学ぶ速さは人それぞれです。
短い優しい言葉も長く心に残ります。
聞いて、繰り返して、自分で書いてみましょう。
毎日の練習が見慣れない文字を友達に変えます。
`),
  "zh-Hans": lines(`
友善的话会换来友善的话。
细小的变化会在不知不觉中积累。
不要忘记自己艰难的起点。
强者争斗时，弱者可能受到伤害。
艰苦过后会迎来喜悦。
用心的努力会带来持久的成果。
潜力要通过行动才会变得有价值。
指看起来很想要却无法得到的事物。
再美的景色也要吃饱后才能更好地欣赏。
事情越紧急，越要谨慎处理。
私下说的话也可能被听见，所以要小心。
我自己的急事需要优先处理。
这件事非常容易。
万事到达顶峰后都会逐渐衰退。
这是在差不多的人之间作比较。
行动前，即使看似确定也要再次确认。
越在身边的事物，有时越难察觉。
一句体贴的话可以化解很大的问题。
不同的道路也能到达同一个目标。
背叛往往来自曾经信任的地方。
再轻的工作，一起做也会更容易。
好的外在呈现能让好内容更加出色。
经历困难后，事物可能变得更坚固。
没有内涵的人往往声音最大。
长期耳濡目染，自然就会学会。
小时候养成的习惯会延续一生。
指损失发生后才亡羊补牢。
好的开始等于完成了一半。
即使是熟悉的路，也要询问和确认。
没有原因就不会产生结果。
坚持可以战胜困难的任务。
衣着能大大改变给人的印象。
狭窄的眼界会把自身的界限误当成整个世界。
即使是专家也会犯错。
好的领导会为下面的人树立基调。
小小的身躯也可能蕴藏巨大的力量。
不要把怒气发泄在无关的人身上。
再温顺的人被逼得太过也会反抗。
漫长的旅程始于第一步。
微小的积累最终会成就大事。
这件事难到几乎不可能完成。
经验不足时可能意识不到危险。
谈到某个人时，那个人可能正好出现。
小问题若被忽视，就会变成大问题。
面对善意，人很难以残酷回应。
恰好遇上了意料之外的事情。
理想选择不可用时，就用最接近的替代品。
别人的东西往往看起来更好。
错过的机会事后常显得更加可贵。
早期的迹象往往能显示未来的潜力。
这是一件既容易又有把握的事。
附加成本超过了主要事物的价值。
有人先造成伤害，随后又假装帮忙。
发号施令的人太多，会让工作偏离方向。
一个困难之后又出现另一个困难。
与整体相比，这只是极小的一部分。
结果会按照原因产生。
伟大的工作无法一次完成。
付出温情，才会收获温情。
小小的恶习可能发展成更大的错误。
话语传播得又快又远。
种什么因，就收什么果。
失败不是努力的终点，而是学习的起点。
坚持的力量可以超过天赋。
今天的一小步会铺成明天的道路。
当准确成为习惯，速度自然会跟上。
成长始于询问自己不知道的事情。
休息并不等于放弃。
记录小小的成功，才能保持动力。
用过去的自己来衡量进步。
不要等待完美时机，先开始行动。
方向正确，即使缓慢也能到达。
专注的十分钟胜过分心的一小时。
知识要用起来才真正属于你。
好问题有时比好答案留存得更久。
记录比记忆保存得更长久。
纠正错误会形成更清晰的记忆。
即使在艰难的一天，也可以写下一行。
每个人学习的速度都不同。
一句简短的善意话语也能留下长久印象。
倾听、跟读，然后亲手写下来。
每天练习会让陌生的文字成为朋友。
`),
  "zh-Hant": lines(`
友善的話會換來友善的話。
細小的變化會在不知不覺中累積。
不要忘記自己艱難的起點。
強者爭鬥時，弱者可能受到傷害。
艱苦過後會迎來喜悅。
用心的努力會帶來持久的成果。
潛力要透過行動才會變得有價值。
指看起來很想要卻無法得到的事物。
再美的景色也要吃飽後才能更好地欣賞。
事情越緊急，越要謹慎處理。
私下說的話也可能被聽見，所以要小心。
我自己的急事需要優先處理。
這件事非常容易。
萬事到達頂峰後都會逐漸衰退。
這是在差不多的人之間作比較。
行動前，即使看似確定也要再次確認。
越在身邊的事物，有時越難察覺。
一句體貼的話可以化解很大的問題。
不同的道路也能到達同一個目標。
背叛往往來自曾經信任的地方。
再輕的工作，一起做也會更容易。
好的外在呈現能讓好內容更加出色。
經歷困難後，事物可能變得更堅固。
沒有內涵的人往往聲音最大。
長期耳濡目染，自然就會學會。
小時候養成的習慣會延續一生。
指損失發生後才亡羊補牢。
好的開始等於完成了一半。
即使是熟悉的路，也要詢問和確認。
沒有原因就不會產生結果。
堅持可以戰勝困難的任務。
衣著能大大改變給人的印象。
狹窄的眼界會把自身的界限誤當成整個世界。
即使是專家也會犯錯。
好的領導會為下面的人樹立基調。
小小的身軀也可能蘊藏巨大的力量。
不要把怒氣發洩在無關的人身上。
再溫順的人被逼得太過也會反抗。
漫長的旅程始於第一步。
微小的累積最終會成就大事。
這件事難到幾乎不可能完成。
經驗不足時可能意識不到危險。
談到某個人時，那個人可能正好出現。
小問題若被忽視，就會變成大問題。
面對善意，人很難以殘酷回應。
恰好遇上了意料之外的事情。
理想選擇無法取得時，就用最接近的替代品。
別人的東西往往看起來更好。
錯過的機會事後常顯得更加可貴。
早期的跡象往往能顯示未來的潛力。
這是一件既容易又有把握的事。
附加成本超過了主要事物的價值。
有人先造成傷害，隨後又假裝幫忙。
發號施令的人太多，會讓工作偏離方向。
一個困難之後又出現另一個困難。
與整體相比，這只是極小的一部分。
結果會按照原因產生。
偉大的工作無法一次完成。
付出溫情，才會收穫溫情。
小小的惡習可能發展成更大的錯誤。
話語傳播得又快又遠。
種什麼因，就收什麼果。
失敗不是努力的終點，而是學習的起點。
堅持的力量可以超過天賦。
今天的一小步會鋪成明天的道路。
當準確成為習慣，速度自然會跟上。
成長始於詢問自己不知道的事情。
休息並不等於放棄。
記錄小小的成功，才能保持動力。
用過去的自己來衡量進步。
不要等待完美時機，先開始行動。
方向正確，即使緩慢也能到達。
專注的十分鐘勝過分心的一小時。
知識要用起來才真正屬於你。
好問題有時比好答案留存得更久。
記錄比記憶保存得更長久。
糾正錯誤會形成更清晰的記憶。
即使在艱難的一天，也可以寫下一行。
每個人學習的速度都不同。
一句簡短的善意話語也能留下長久印象。
傾聽、跟讀，然後親手寫下來。
每天練習會讓陌生的文字成為朋友。
`),
  de: lines(`
Freundliche Worte laden zu freundlichen Worten ein.
Kleine Veränderungen sammeln sich unbemerkt an.
Vergiss deine bescheidenen Anfänge nicht.
Die Schwachen können leiden, wenn die Mächtigen kämpfen.
Nach schwierigen Zeiten kommt Freude.
Sorgfältige Arbeit schafft dauerhafte Ergebnisse.
Potenzial wird durch Handeln wertvoll.
Etwas Wünschenswertes, das unerreichbar ist.
Selbst schöne Aussichten sind nach einer Mahlzeit besser.
Je dringender es ist, desto vorsichtiger sollte man vorgehen.
Sei vorsichtig, denn private Worte können mitgehört werden.
Meine eigenen Sorgen brauchen zuerst Aufmerksamkeit.
Es ist äußerst einfach.
Alles nimmt ab, nachdem es seinen Höhepunkt erreicht hat.
Es ist ein Vergleich unter nahezu Gleichen.
Prüfe vor dem Handeln auch, was sicher erscheint.
Was am nächsten ist, lässt sich oft am schwersten bemerken.
Ein bedachtes Wort kann eine große Schuld begleichen.
Verschiedene Wege können zum selben Ziel führen.
Verrat kommt oft von dort, wo Vertrauen lag.
Auch leichte Arbeit ist gemeinsam einfacher.
Gute Präsentation ergänzt guten Inhalt.
Schwierigkeiten können Dinge stärker machen.
Leere Gefäße machen den meisten Lärm.
Lange Beschäftigung führt auf natürliche Weise zum Lernen.
Frühe Gewohnheiten halten ein Leben lang.
Etwas erst reparieren, nachdem der Schaden entstanden ist.
Ein guter Anfang ist die halbe Arbeit.
Frage und prüfe auch auf einem vertrauten Weg.
Es gibt keinen Rauch ohne Ursache.
Ausdauer kann eine schwere Aufgabe überwinden.
Kleidung kann einen Eindruck völlig verändern.
Ein enger Blick hält seine Grenzen für die ganze Welt.
Auch Experten machen Fehler.
Gute Führung gibt den Ton für alle anderen an.
Kleine Größe kann große Stärke verbergen.
Lass Ärger nicht an der falschen Person aus.
Auch Sanftmütige wehren sich, wenn man sie zu weit drängt.
Eine lange Reise beginnt mit einem Schritt.
Kleine Gewinne sammeln sich zu etwas Großem.
Es ist nahezu unmöglich schwierig.
Unerfahrenheit kann verhindern, dass man Gefahr erkennt.
Spricht man von jemandem, kann die Person erscheinen.
Ein kleines vernachlässigtes Problem wird zu einem großen.
Es ist schwer, Freundlichkeit mit Grausamkeit zu beantworten.
Man kommt genau dann an, wenn etwas Unerwartetes geschieht.
Nimm die nächstbeste Lösung, wenn die ideale fehlt.
Was andere haben, sieht oft besser aus.
Eine verpasste Chance erscheint später oft größer.
Frühe Zeichen zeigen häufig künftiges Potenzial.
Es ist eine einfache und sichere Aufgabe.
Die Nebenkosten übersteigen den eigentlichen Wert.
Jemand richtet Schaden an und gibt dann vor zu helfen.
Zu viele Anführer können die Arbeit vom Weg abbringen.
Eine Schwierigkeit folgt auf die nächste.
Es ist nur ein winziger Teil des Ganzen.
Ergebnisse folgen ihren Ursachen.
Große Arbeit gelingt nicht in einem einzigen Versuch.
Wer Wärme gibt, lädt Wärme als Antwort ein.
Kleines Fehlverhalten kann zu größerem Unrecht wachsen.
Worte reisen sehr weit und schnell.
Du erntest, was du säst.
Scheitern beginnt das Lernen, statt die Mühe zu beenden.
Beständigkeit kann stärker werden als Talent.
Der kleine Schritt von heute schafft den Weg von morgen.
Tempo folgt, sobald Genauigkeit zur Gewohnheit wird.
Wachstum beginnt mit Fragen nach dem Unbekannten.
Ausruhen ist nicht dasselbe wie Aufgeben.
Halte kleine Erfolge fest, um motiviert zu bleiben.
Miss deinen Fortschritt an deinem früheren Ich.
Beginne, statt auf den perfekten Moment zu warten.
Ein stetiges Tempo in die richtige Richtung erreicht das Ziel.
Zehn konzentrierte Minuten schlagen eine abgelenkte Stunde.
Wissen wird deins, wenn du es anwendest.
Eine gute Frage kann länger bleiben als eine gute Antwort.
Eine Aufzeichnung hält länger als die Erinnerung.
Korrigierte Fehler schaffen eine klarere Erinnerung.
Auch an einem schweren Tag kannst du eine Zeile schreiben.
Jeder Mensch lernt in einem anderen Tempo.
Ein kurzes freundliches Wort kann lange nachwirken.
Höre zu, wiederhole und schreibe es selbst.
Tägliche Übung macht fremde Buchstaben zu Freunden.
`),
  nl: lines(`
Vriendelijke woorden lokken vriendelijke woorden uit.
Kleine veranderingen stapelen zich ongemerkt op.
Vergeet je eenvoudige begin niet.
De zwakken kunnen lijden wanneer de machtigen vechten.
Na tegenspoed komt vreugde.
Zorgvuldige inzet levert blijvende resultaten.
Potentieel krijgt waarde door actie.
Iets wenselijks maar onbereikbaars.
Zelfs een mooi uitzicht is beter na een maaltijd.
Hoe dringender het is, hoe zorgvuldiger je moet handelen.
Wees voorzichtig, want privéwoorden kunnen worden gehoord.
Mijn eigen problemen vragen eerst aandacht.
Het is buitengewoon gemakkelijk.
Alles neemt af na het bereiken van de top.
Het is een vergelijking tussen bijna gelijken.
Controleer zelfs wat zeker lijkt voordat je handelt.
Wat het dichtst bij is, valt soms het minst op.
Een bedachtzaam woord kan een grote schuld oplossen.
Verschillende routes kunnen hetzelfde doel bereiken.
Verraad komt vaak van waar vertrouwen werd gelegd.
Zelfs licht werk is samen gemakkelijker.
Een goede presentatie versterkt een goede inhoud.
Tegenspoed kan dingen sterker maken.
Lege vaten maken het meeste lawaai.
Langdurige blootstelling leidt vanzelf tot leren.
Vroege gewoonten gaan een leven lang mee.
Dingen herstellen nadat de schade al is ontstaan.
Een goed begin is het halve werk.
Vraag en controleer zelfs op een bekende weg.
Er is geen rook zonder oorzaak.
Volharding kan een moeilijke taak overwinnen.
Kleding kan een indruk veranderen.
Een beperkte blik ziet zijn grenzen als de hele wereld.
Zelfs deskundigen maken fouten.
Goed leiderschap zet de toon voor anderen.
Een klein formaat kan grote kracht verbergen.
Koel je woede niet op de verkeerde persoon.
Zelfs zachtmoedigen verzetten zich als ze te ver worden geduwd.
Een lange reis begint met één stap.
Kleine winsten groeien samen tot iets groots.
Het is bijna onmogelijk moeilijk.
Onervarenheid kan gevaar onzichtbaar maken.
Noem iemand en die persoon kan verschijnen.
Een klein verwaarloosd probleem wordt een groot probleem.
Vriendelijkheid is moeilijk met wreedheid te beantwoorden.
Je komt precies aan wanneer iets onverwachts gebeurt.
Gebruik het beste alternatief wanneer het ideale ontbreekt.
Wat anderen hebben, lijkt vaak beter.
Een gemiste kans lijkt achteraf vaak groter.
Vroege tekenen tonen vaak toekomstige belofte.
Het is een gemakkelijke en zekere taak.
De bijkomende kosten zijn groter dan de hoofdwaarde.
Iemand veroorzaakt schade en doet daarna alsof hij helpt.
Te veel leiders kunnen het werk laten ontsporen.
De ene moeilijkheid volgt op de andere.
Het is slechts een heel klein deel van het geheel.
Resultaten volgen uit hun oorzaken.
Groot werk is niet in één poging klaar.
Gegeven warmte nodigt warmte terug uit.
Klein wangedrag kan uitgroeien tot groter kwaad.
Woorden reizen heel ver en snel.
Je oogst wat je zaait.
Mislukking begint het leren en beëindigt de inzet niet.
Volharding kan sterker worden dan talent.
De kleine stap van vandaag maakt het pad van morgen.
Snelheid volgt zodra nauwkeurigheid een gewoonte wordt.
Groei begint met vragen wat je niet weet.
Rusten is niet hetzelfde als opgeven.
Noteer kleine overwinningen om gemotiveerd te blijven.
Meet vooruitgang aan je vroegere zelf.
Begin in plaats van op het perfecte moment te wachten.
Een rustig tempo in de juiste richting komt ook aan.
Tien gerichte minuten verslaan een afgeleid uur.
Kennis wordt van jou wanneer je haar gebruikt.
Een goede vraag kan langer blijven dan een goed antwoord.
Een verslag duurt langer dan een herinnering.
Gecorrigeerde fouten bouwen een helderder geheugen.
Zelfs op een moeilijke dag kun je één regel schrijven.
Iedereen leert in een ander tempo.
Een kort vriendelijk woord kan lang blijven hangen.
Luister, herhaal en schrijf het zelf.
Dagelijkse oefening maakt onbekende letters tot vrienden.
`),
  pl: lines(`
Życzliwe słowa wywołują życzliwe słowa.
Małe zmiany gromadzą się, zanim je zauważysz.
Nie zapominaj o swoich skromnych początkach.
Słabi mogą cierpieć, gdy walczą potężni.
Po trudach przychodzi radość.
Staranny wysiłek daje trwałe rezultaty.
Potencjał nabiera wartości poprzez działanie.
Coś pożądanego, ale nieosiągalnego.
Nawet piękne widoki są lepsze po posiłku.
Im pilniejsza sprawa, tym ostrożniej trzeba działać.
Uważaj, bo prywatne słowa mogą zostać podsłuchane.
Najpierw muszę zająć się własnymi problemami.
To jest wyjątkowo łatwe.
Wszystko słabnie po osiągnięciu szczytu.
To porównanie niemal równych sobie osób.
Przed działaniem sprawdź nawet to, co wydaje się pewne.
To, co najbliżej, bywa najtrudniejsze do zauważenia.
Przemyślane słowo może rozwiązać wielki problem.
Różne drogi mogą prowadzić do tego samego celu.
Zdrada często przychodzi stamtąd, gdzie pokładaliśmy zaufanie.
Nawet lekka praca jest łatwiejsza wspólnie.
Dobra prezentacja wzmacnia dobrą treść.
Trudności mogą uczynić rzeczy mocniejszymi.
Puste naczynia robią najwięcej hałasu.
Długi kontakt naturalnie prowadzi do nauki.
Wczesne nawyki pozostają na całe życie.
Naprawianie dopiero po powstaniu szkody.
Dobry początek to połowa pracy.
Pytaj i sprawdzaj nawet na znanej drodze.
Nie ma dymu bez przyczyny.
Wytrwałość może pokonać trudne zadanie.
Ubranie może całkowicie zmienić wrażenie.
Wąskie spojrzenie bierze własne granice za cały świat.
Nawet eksperci popełniają błędy.
Dobre przywództwo nadaje ton pozostałym.
Mały rozmiar może skrywać wielką siłę.
Nie wyładowuj złości na niewłaściwej osobie.
Nawet łagodni stawiają opór, gdy naciska się za mocno.
Długa podróż zaczyna się od jednego kroku.
Małe zyski składają się na coś wielkiego.
To jest niemal niemożliwie trudne.
Brak doświadczenia może utrudniać dostrzeżenie zagrożenia.
Wspomnij o kimś, a ta osoba może się pojawić.
Mały zaniedbany problem staje się dużym.
Trudno odpowiedzieć okrucieństwem na życzliwość.
Przychodzisz akurat wtedy, gdy dzieje się coś niespodziewanego.
Gdy brak ideału, wybierz najlepszy dostępny zamiennik.
To, co mają inni, często wygląda lepiej.
Stracona szansa wydaje się później większa.
Wczesne oznaki często ujawniają przyszłe możliwości.
To łatwe i pewne zadanie.
Dodatkowy koszt przewyższa główną wartość.
Ktoś wyrządza krzywdę, a potem udaje pomoc.
Zbyt wielu przywódców może sprowadzić pracę na manowce.
Po jednej trudności przychodzi następna.
To tylko maleńka część całości.
Wyniki wynikają ze swoich przyczyn.
Wielkiej pracy nie kończy się jedną próbą.
Okazane ciepło zaprasza ciepło w odpowiedzi.
Małe przewinienie może urosnąć do większego zła.
Słowa podróżują bardzo daleko i szybko.
Zbierasz to, co zasiejesz.
Porażka rozpoczyna naukę, a nie kończy wysiłek.
Systematyczność może stać się silniejsza od talentu.
Dzisiejszy mały krok tworzy jutrzejszą drogę.
Szybkość przychodzi, gdy dokładność staje się nawykiem.
Rozwój zaczyna się od pytania o to, czego nie wiesz.
Odpoczynek to nie to samo co rezygnacja.
Zapisuj małe sukcesy, aby podtrzymać motywację.
Mierz postęp względem dawnego siebie.
Zacznij, zamiast czekać na idealny moment.
Stałe tempo we właściwym kierunku też prowadzi do celu.
Dziesięć minut skupienia pokonuje godzinę rozproszenia.
Wiedza staje się twoja, gdy jej używasz.
Dobre pytanie może przetrwać dłużej niż dobra odpowiedź.
Zapis trwa dłużej niż pamięć.
Poprawione błędy budują wyraźniejszą pamięć.
Nawet w trudny dzień możesz napisać jedną linijkę.
Każdy uczy się w innym tempie.
Krótkie życzliwe słowo może pozostawić trwały ślad.
Słuchaj, powtarzaj i zapisuj samodzielnie.
Codzienna praktyka zmienia obce litery w przyjaciół.
`),
  ru: lines(`
Добрые слова вызывают добрые слова.
Маленькие изменения накапливаются незаметно.
Не забывайте о своих скромных начинаниях.
Слабые могут пострадать, когда сражаются сильные.
После трудностей приходит радость.
Тщательные усилия дают долговечный результат.
Потенциал обретает ценность через действие.
Нечто желанное, но недостижимое.
Даже прекрасные виды лучше после еды.
Чем срочнее дело, тем осторожнее нужно действовать.
Будьте осторожны: тайные слова могут услышать.
Сначала внимания требуют мои собственные проблемы.
Это чрезвычайно легко.
Всё ослабевает после достижения вершины.
Это сравнение почти равных.
Перед действием проверяйте даже то, что кажется очевидным.
Ближайшее бывает труднее всего заметить.
Продуманное слово может решить большую проблему.
Разные пути могут привести к одной цели.
Предательство часто приходит от тех, кому доверяли.
Даже лёгкая работа проще вместе.
Хорошая подача дополняет хорошее содержание.
Трудности могут сделать многое прочнее.
Пустые сосуды шумят громче всего.
Долгое знакомство естественно приводит к обучению.
Ранние привычки остаются на всю жизнь.
Исправлять что-либо уже после нанесённого ущерба.
Хорошее начало — половина работы.
Спрашивайте и проверяйте даже знакомую дорогу.
Дыма без причины не бывает.
Настойчивость помогает преодолеть трудную задачу.
Одежда может полностью изменить впечатление.
Узкий взгляд принимает свои границы за весь мир.
Даже эксперты ошибаются.
Хорошее руководство задаёт тон всем остальным.
За малым размером может скрываться большая сила.
Не вымещайте гнев на непричастном человеке.
Даже кроткие сопротивляются, если давить слишком сильно.
Долгий путь начинается с одного шага.
Малые достижения складываются в большое.
Это почти невыполнимо трудно.
Неопытность может помешать распознать опасность.
Заговорите о человеке — и он может появиться.
Маленькая запущенная проблема становится большой.
На доброту трудно ответить жестокостью.
Вы приходите именно тогда, когда случается неожиданное.
Если идеал недоступен, используйте лучший заменитель.
Чужое часто кажется лучше своего.
Упущенная возможность потом кажется больше.
Ранние признаки часто показывают будущие способности.
Это лёгкая и надёжная задача.
Дополнительные расходы превышают основную ценность.
Кто-то вредит, а затем притворяется помощником.
Слишком много руководителей могут сбить работу с пути.
За одной трудностью следует другая.
Это лишь крошечная часть целого.
Результаты следуют из своих причин.
Большое дело нельзя завершить одной попыткой.
Отданное тепло приглашает тепло в ответ.
Малый проступок может вырасти в большой.
Слова распространяются очень далеко и быстро.
Что посеешь, то и пожнёшь.
Неудача начинает обучение, а не прекращает усилия.
Постоянство может стать сильнее таланта.
Маленький шаг сегодня создаёт дорогу завтра.
Скорость приходит, когда точность становится привычкой.
Рост начинается с вопросов о неизвестном.
Отдыхать — не значит сдаваться.
Записывайте небольшие победы, чтобы сохранять мотивацию.
Сравнивайте свой прогресс с собой прежним.
Начните, не дожидаясь идеального момента.
Ровный темп в верном направлении тоже приводит к цели.
Десять минут сосредоточения лучше часа рассеянности.
Знание становится вашим, когда вы его применяете.
Хороший вопрос может жить дольше хорошего ответа.
Запись хранится дольше памяти.
Исправленные ошибки создают более ясную память.
Даже в трудный день можно написать одну строку.
Каждый учится в своём темпе.
Короткое доброе слово может оставить долгий след.
Слушайте, повторяйте и записывайте сами.
Ежедневная практика превращает незнакомые буквы в друзей.
`),
  tr: lines(`
Nazik sözler nazik sözleri çağırır.
Küçük değişiklikler fark etmeden birikir.
Mütevazı başlangıçlarını unutma.
Güçlüler savaşırken zayıflar zarar görebilir.
Zorluktan sonra sevinç gelir.
Özenli çaba kalıcı sonuçlar oluşturur.
Potansiyel eylemle değer kazanır.
İstenen ama ulaşılamayan bir şey.
Güzel manzaralar bile yemekten sonra daha güzeldir.
İş ne kadar acilse o kadar dikkatli ilerlemelisin.
Özel sözler duyulabileceği için dikkatli ol.
Önce kendi sıkıntılarımla ilgilenmem gerekir.
Son derece kolaydır.
Her şey zirveye ulaştıktan sonra azalır.
Neredeyse eşit olanların karşılaştırılmasıdır.
Harekete geçmeden önce kesin görüneni bile kontrol et.
En yakındaki şeyi fark etmek en zor olabilir.
Düşünceli bir söz büyük bir borcu çözebilir.
Farklı yollar aynı hedefe ulaşabilir.
İhanet çoğu zaman güvenilen yerden gelir.
Hafif iş bile birlikte daha kolaydır.
İyi sunum iyi içeriği güçlendirir.
Zorluklar işleri daha sağlam kılabilir.
Boş kaplar en çok sesi çıkarır.
Uzun süre maruz kalmak doğal olarak öğrenmeye götürür.
Erken edinilen alışkanlıklar ömür boyu sürer.
Hasar olduktan sonra onarmaya çalışmaktır.
İyi bir başlangıç işin yarısıdır.
Bildik yolda bile sor ve kontrol et.
Sebepsiz duman olmaz.
Azim zor bir görevi aşabilir.
Giysiler bir izlenimi değiştirebilir.
Dar bir bakış kendi sınırlarını dünya sanır.
Uzmanlar bile hata yapar.
İyi liderlik aşağıdakilere yön verir.
Küçük beden büyük güç saklayabilir.
Öfkeni yanlış kişiden çıkarma.
Uysal olan bile fazla zorlanınca direnir.
Uzun bir yolculuk tek adımla başlar.
Küçük kazançlar birikerek büyür.
Neredeyse imkânsız derecede zordur.
Deneyimsizlik tehlikeyi görmeyi engelleyebilir.
Birinden söz edince o kişi çıkıp gelebilir.
İhmal edilen küçük sorun büyür.
İyiliğe kötülükle karşılık vermek zordur.
Beklenmedik bir olayın tam zamanında gelirsin.
İdeal yoksa en yakın seçeneği kullan.
Başkalarının sahip olduğu genellikle daha iyi görünür.
Kaçırılan fırsat sonradan daha büyük görünür.
İlk işaretler gelecekteki umudu gösterebilir.
Kolay ve kesin bir iştir.
Ek maliyet asıl değeri aşar.
Biri zarar verir, sonra yardım ediyormuş gibi yapar.
Fazla lider işi yolundan çıkarabilir.
Bir zorluğu başka bir zorluk izler.
Bütünün yalnızca çok küçük bir parçasıdır.
Sonuçlar nedenlerinden doğar.
Büyük iş tek denemede bitmez.
Verilen sıcaklık karşılığında sıcaklık çağırır.
Küçük yanlışlar daha büyük kötülüklere dönüşebilir.
Sözler çok uzağa ve hızla yayılır.
Ne ekersen onu biçersin.
Başarısızlık çabayı bitirmez, öğrenmeyi başlatır.
Süreklilik yetenekten daha güçlü olabilir.
Bugünün küçük adımı yarının yolunu açar.
Doğruluk alışkanlık olunca hız ardından gelir.
Büyüme bilmediğini sormakla başlar.
Dinlenmek vazgeçmek değildir.
Motivasyonu korumak için küçük başarıları kaydet.
İlerlemeni geçmişteki kendinle ölç.
Kusursuz anı beklemek yerine başla.
Doğru yöndeki düzenli tempo hedefe ulaştırır.
On dakikalık odaklanma dağınık bir saatten iyidir.
Bilgi kullandığında senin olur.
İyi bir soru iyi bir cevaptan uzun yaşayabilir.
Kayıt hafızadan daha uzun sürer.
Düzeltilen hatalar daha net bir hafıza kurar.
Zor bir günde bile bir satır yazabilirsin.
Herkes farklı bir hızda öğrenir.
Kısa ve nazik bir söz kalıcı iz bırakabilir.
Dinle, tekrarla ve kendin yaz.
Günlük pratik yabancı harfleri dosta dönüştürür.
`),
  id: lines(`
Kata-kata baik mengundang kata-kata baik.
Perubahan kecil menumpuk sebelum kita menyadarinya.
Jangan lupakan awalmu yang sederhana.
Yang lemah dapat menderita ketika yang kuat bertarung.
Kebahagiaan datang setelah kesulitan.
Usaha yang cermat membangun hasil yang tahan lama.
Potensi menjadi bernilai melalui tindakan.
Sesuatu yang diinginkan tetapi tidak dapat diraih.
Pemandangan indah pun lebih nikmat setelah makan.
Semakin mendesak, semakin hati-hati kita harus melangkah.
Berhati-hatilah karena ucapan pribadi dapat terdengar.
Masalahku sendiri perlu diperhatikan lebih dahulu.
Ini sangat mudah.
Segala sesuatu menurun setelah mencapai puncak.
Ini perbandingan antara orang yang hampir setara.
Periksa juga hal yang tampak pasti sebelum bertindak.
Hal terdekat terkadang paling sulit disadari.
Satu ucapan bijak dapat menyelesaikan utang besar.
Jalan berbeda dapat mencapai tujuan yang sama.
Pengkhianatan sering datang dari tempat kita menaruh percaya.
Pekerjaan ringan pun lebih mudah jika dikerjakan bersama.
Penyajian yang baik menambah nilai isi yang baik.
Kesulitan dapat membuat sesuatu lebih kuat.
Wadah kosong menghasilkan bunyi paling keras.
Paparan yang lama secara alami membawa pembelajaran.
Kebiasaan sejak dini bertahan seumur hidup.
Memperbaiki sesuatu setelah kerusakan terjadi.
Awal yang baik adalah setengah pekerjaan.
Bertanya dan periksa meski jalannya sudah dikenal.
Tidak ada asap tanpa sebab.
Ketekunan dapat mengatasi tugas yang sulit.
Pakaian dapat mengubah kesan.
Pandangan sempit mengira batasnya sebagai seluruh dunia.
Ahli pun membuat kesalahan.
Kepemimpinan yang baik memberi teladan bagi bawahannya.
Ukuran kecil dapat menyimpan kekuatan besar.
Jangan lampiaskan marah kepada orang yang salah.
Orang lembut pun melawan jika terlalu ditekan.
Perjalanan panjang dimulai dengan satu langkah.
Keuntungan kecil menumpuk menjadi sesuatu yang besar.
Ini hampir mustahil dilakukan.
Kurangnya pengalaman dapat membuat bahaya tidak terlihat.
Sebut seseorang dan dia mungkin muncul.
Masalah kecil yang diabaikan menjadi besar.
Kebaikan sulit dibalas dengan kekejaman.
Kita tiba tepat ketika kejadian tak terduga berlangsung.
Gunakan pilihan terbaik berikutnya jika yang ideal tidak ada.
Milik orang lain sering tampak lebih baik.
Kesempatan yang terlewat sering tampak lebih besar kemudian.
Tanda awal sering menunjukkan potensi masa depan.
Ini tugas yang mudah dan pasti.
Biaya tambahan melebihi nilai utamanya.
Seseorang merugikan lalu berpura-pura membantu.
Terlalu banyak pemimpin dapat menyesatkan pekerjaan.
Satu kesulitan diikuti kesulitan lain.
Ini hanya bagian sangat kecil dari keseluruhan.
Hasil mengikuti penyebabnya.
Pekerjaan besar tidak selesai dalam satu percobaan.
Kehangatan yang diberikan mengundang kehangatan kembali.
Kesalahan kecil dapat tumbuh menjadi kesalahan besar.
Ucapan menyebar sangat jauh dan cepat.
Kita menuai apa yang kita tanam.
Kegagalan memulai pembelajaran, bukan mengakhiri usaha.
Konsistensi dapat menjadi lebih kuat daripada bakat.
Langkah kecil hari ini menciptakan jalan esok.
Kecepatan mengikuti setelah ketepatan menjadi kebiasaan.
Pertumbuhan dimulai dengan menanyakan yang belum diketahui.
Beristirahat tidak sama dengan menyerah.
Catat kemenangan kecil untuk menjaga motivasi.
Ukur kemajuan terhadap dirimu di masa lalu.
Mulailah daripada menunggu saat yang sempurna.
Langkah stabil ke arah yang benar tetap sampai tujuan.
Sepuluh menit fokus mengalahkan satu jam tanpa konsentrasi.
Pengetahuan menjadi milikmu saat digunakan.
Pertanyaan baik dapat bertahan lebih lama daripada jawaban baik.
Catatan bertahan lebih lama daripada ingatan.
Kesalahan yang diperbaiki membangun ingatan lebih jelas.
Bahkan pada hari sulit, kamu dapat menulis satu baris.
Setiap orang belajar dengan kecepatan berbeda.
Ucapan baik yang singkat dapat meninggalkan kesan lama.
Dengarkan, ulangi, dan tulis sendiri.
Latihan harian mengubah huruf asing menjadi teman.
`),
  ms: lines(`
Kata-kata baik mengundang kata-kata baik.
Perubahan kecil terkumpul sebelum kita menyedarinya.
Jangan lupakan permulaanmu yang sederhana.
Yang lemah boleh menderita apabila yang kuat bertarung.
Kegembiraan datang selepas kesukaran.
Usaha yang teliti membina hasil yang berkekalan.
Potensi menjadi bernilai melalui tindakan.
Sesuatu yang diingini tetapi tidak dapat dicapai.
Pemandangan indah juga lebih nikmat selepas makan.
Semakin mendesak, semakin berhati-hati kita harus bertindak.
Berhati-hati kerana kata-kata peribadi mungkin didengari.
Masalah saya sendiri perlu diberi perhatian dahulu.
Ini sangat mudah.
Segala-galanya merosot selepas mencapai kemuncak.
Ini perbandingan antara orang yang hampir setara.
Semak juga perkara yang kelihatan pasti sebelum bertindak.
Perkara yang paling dekat kadangkala paling sukar disedari.
Satu kata yang bijak dapat menyelesaikan hutang besar.
Jalan berbeza boleh mencapai matlamat yang sama.
Pengkhianatan sering datang dari tempat kita menaruh kepercayaan.
Kerja ringan juga lebih mudah jika dilakukan bersama.
Penyampaian yang baik menambah nilai kandungan yang baik.
Kesukaran boleh menjadikan sesuatu lebih kuat.
Bekas kosong menghasilkan bunyi paling kuat.
Pendedahan yang lama secara semula jadi membawa pembelajaran.
Tabiat sejak kecil kekal sepanjang hayat.
Membaiki sesuatu selepas kerosakan berlaku.
Permulaan yang baik ialah separuh pekerjaan.
Bertanya dan semak walaupun jalannya sudah dikenali.
Tiada asap tanpa sebab.
Ketekunan dapat mengatasi tugas yang sukar.
Pakaian dapat mengubah tanggapan.
Pandangan sempit menganggap batasnya sebagai seluruh dunia.
Pakar juga melakukan kesilapan.
Kepimpinan yang baik menetapkan teladan untuk orang lain.
Saiz kecil boleh menyembunyikan kekuatan besar.
Jangan lepaskan marah kepada orang yang salah.
Orang yang lembut juga melawan jika terlalu ditekan.
Perjalanan jauh bermula dengan satu langkah.
Keuntungan kecil terkumpul menjadi sesuatu yang besar.
Ini hampir mustahil dilakukan.
Kurang pengalaman boleh menyebabkan bahaya tidak disedari.
Sebut seseorang dan dia mungkin muncul.
Masalah kecil yang diabaikan menjadi besar.
Kebaikan sukar dibalas dengan kekejaman.
Kita tiba tepat ketika perkara tidak dijangka berlaku.
Gunakan pilihan terbaik seterusnya jika yang ideal tiada.
Milik orang lain sering kelihatan lebih baik.
Peluang yang terlepas sering kelihatan lebih besar kemudian.
Tanda awal sering menunjukkan potensi masa depan.
Ini tugas yang mudah dan pasti.
Kos tambahan melebihi nilai utama.
Seseorang menyebabkan mudarat lalu berpura-pura membantu.
Terlalu ramai pemimpin boleh menyesatkan kerja.
Satu kesukaran diikuti kesukaran yang lain.
Ini hanya bahagian yang sangat kecil daripada keseluruhan.
Hasil mengikuti sebabnya.
Kerja besar tidak selesai dalam satu percubaan.
Kehangatan yang diberi mengundang kehangatan kembali.
Kesalahan kecil boleh berkembang menjadi kesalahan besar.
Kata-kata tersebar sangat jauh dan pantas.
Kita menuai apa yang kita tanam.
Kegagalan memulakan pembelajaran, bukan menamatkan usaha.
Konsistensi boleh menjadi lebih kuat daripada bakat.
Langkah kecil hari ini mencipta jalan esok.
Kelajuan menyusul apabila ketepatan menjadi tabiat.
Pertumbuhan bermula dengan bertanya apa yang belum diketahui.
Berehat tidak sama dengan berputus asa.
Catat kemenangan kecil untuk mengekalkan motivasi.
Ukur kemajuan berbanding dirimu yang dahulu.
Mulakan daripada menunggu saat yang sempurna.
Langkah tetap ke arah yang betul tetap sampai ke tujuan.
Sepuluh minit fokus mengatasi satu jam yang terganggu.
Ilmu menjadi milikmu apabila digunakan.
Soalan yang baik boleh kekal lebih lama daripada jawapan baik.
Catatan bertahan lebih lama daripada ingatan.
Kesilapan yang dibetulkan membina ingatan lebih jelas.
Walaupun pada hari sukar, kamu boleh menulis satu baris.
Setiap orang belajar pada kadar yang berbeza.
Kata baik yang ringkas boleh meninggalkan kesan berkekalan.
Dengar, ulangi dan tulis sendiri.
Latihan harian mengubah huruf asing menjadi teman.
`),
  fil: lines(`
Ang mabubuting salita ay nag-aanyaya ng mabubuting salita.
Naiipon ang maliliit na pagbabago bago mo mapansin.
Huwag kalimutan ang iyong payak na pinagmulan.
Maaaring magdusa ang mahihina kapag naglalaban ang makapangyarihan.
Dumarating ang saya pagkatapos ng hirap.
Ang maingat na pagsisikap ay nagbubunga ng pangmatagalang resulta.
Nagiging mahalaga ang potensiyal sa pamamagitan ng pagkilos.
Isang bagay na kanais-nais ngunit hindi maaabot.
Mas masarap kahit ang magandang tanawin pagkatapos kumain.
Kung mas madalian, mas maingat kang dapat kumilos.
Mag-ingat dahil maaaring marinig ang pribadong usapan.
Kailangang unahin ang sarili kong mga problema.
Napakadali nito.
Humihina ang lahat matapos maabot ang rurok.
Paghahambing ito ng halos magkakapantay.
Suriin kahit ang tiyak na bagay bago kumilos.
Ang pinakamalapit ang maaaring pinakamahirap mapansin.
Kayang lutasin ng maingat na salita ang malaking problema.
Maaaring humantong ang magkaibang daan sa iisang layunin.
Madalas manggaling ang pagtataksil sa pinagkatiwalaan.
Mas madali kahit ang magaan na trabaho kapag magkakasama.
Pinahuhusay ng magandang presentasyon ang magandang nilalaman.
Maaaring magpatibay ang mga pagsubok.
Ang sisidlang walang laman ang pinakamaingay.
Ang matagal na pagkakalantad ay likas na humahantong sa pagkatuto.
Ang maagang gawi ay tumatagal habambuhay.
Pag-aayos lamang matapos mangyari ang pinsala.
Ang magandang simula ay kalahati ng gawain.
Magtanong at magsuri kahit sa pamilyar na daan.
Walang usok nang walang dahilan.
Kayang lampasan ng pagtitiyaga ang mahirap na gawain.
Kayang baguhin ng damit ang impresyon.
Inaakalang buong mundo ng makitid na pananaw ang sariling hangganan.
Nagkakamali rin ang mga eksperto.
Ang mabuting pamumuno ang nagtatakda ng tono sa iba.
Maaaring magtago ng malaking lakas ang maliit na anyo.
Huwag ibunton ang galit sa maling tao.
Lumalaban din ang maamo kapag labis na pinipilit.
Nagsisimula ang mahabang paglalakbay sa isang hakbang.
Naiipon ang maliliit na pakinabang at nagiging malaki.
Halos imposibleng hirap nito.
Maaaring hindi makilala ng walang karanasan ang panganib.
Banggitin ang isang tao at maaari siyang lumitaw.
Lumalaki ang maliit na problemang pinabayaan.
Mahirap tumbasan ng kalupitan ang kabaitan.
Dumarating ka sa mismong oras ng di-inaasahang pangyayari.
Gamitin ang susunod na pinakamainam kapag wala ang perpekto.
Madalas mas maganda ang pag-aari ng iba.
Mas malaki sa isip ang pagkakataong napalampas.
Madalas ipinapakita ng maagang tanda ang potensiyal sa hinaharap.
Madali at tiyak na gawain ito.
Mas malaki ang dagdag na gastos kaysa pangunahing halaga.
May nananakit at saka nagpapanggap na tumutulong.
Maaaring maligaw ang gawain dahil sa sobrang daming pinuno.
May kasunod na hirap ang bawat hirap.
Napakaliit na bahagi lamang ito ng kabuuan.
Ang resulta ay sumusunod sa sanhi.
Hindi natatapos ang malaking gawain sa isang pagsubok.
Ang ibinigay na malasakit ay nag-aanyaya ng malasakit pabalik.
Maaaring lumaki ang maliit na kasalanan.
Napakalayo at napakabilis kumalat ng mga salita.
Aanihin mo ang iyong itinanim.
Nagsisimula ng pagkatuto ang kabiguan, hindi nagtatapos ng pagsisikap.
Maaaring maging mas malakas sa talento ang pagiging tuloy-tuloy.
Ginagawa ng munting hakbang ngayon ang landas bukas.
Susunod ang bilis kapag naging gawi ang katumpakan.
Nagsisimula ang paglago sa pagtatanong ng hindi mo alam.
Ang pagpapahinga ay hindi pagsuko.
Itala ang maliliit na tagumpay upang manatiling ganado.
Ihambing ang pag-unlad sa dati mong sarili.
Magsimula sa halip na hintayin ang perpektong sandali.
Makakarating din ang tuloy-tuloy na lakad sa tamang direksiyon.
Higit ang sampung minutong tutok sa isang oras na magulo.
Nagiging iyo ang kaalaman kapag ginagamit mo ito.
Maaaring mas tumagal ang mabuting tanong kaysa mabuting sagot.
Mas matagal ang tala kaysa alaala.
Lumilinaw ang alaala sa pagwawasto ng pagkakamali.
Kahit sa mahirap na araw, makasusulat ka ng isang linya.
Magkakaiba ang bilis ng pagkatuto ng bawat tao.
Maaaring mag-iwan ng pangmatagalang bakas ang maikling mabuting salita.
Makinig, ulitin, at isulat mo mismo.
Ginagawang kaibigan ng araw-araw na ensayo ang di-pamilyar na titik.
`),
  vi: lines(`
Lời tử tế sẽ nhận lại lời tử tế.
Những thay đổi nhỏ tích tụ trước khi bạn nhận ra.
Đừng quên thuở ban đầu khiêm nhường của mình.
Người yếu có thể chịu thiệt khi kẻ mạnh tranh đấu.
Niềm vui đến sau gian khó.
Nỗ lực cẩn thận tạo nên kết quả bền lâu.
Tiềm năng trở nên có giá trị nhờ hành động.
Một điều đáng mong muốn nhưng không thể đạt được.
Cảnh đẹp cũng thú vị hơn sau một bữa ăn.
Càng khẩn cấp càng phải tiến hành thận trọng.
Hãy cẩn thận vì lời riêng tư có thể bị nghe thấy.
Rắc rối của chính mình cần được giải quyết trước.
Việc này vô cùng dễ.
Mọi thứ đều suy giảm sau khi đạt đỉnh.
Đó là sự so sánh giữa những người gần như ngang nhau.
Hãy kiểm tra cả điều tưởng như chắc chắn trước khi làm.
Điều ở gần nhất đôi khi lại khó nhận thấy nhất.
Một lời chu đáo có thể giải quyết món nợ lớn.
Những con đường khác nhau có thể đến cùng một đích.
Sự phản bội thường đến từ nơi ta đã đặt lòng tin.
Việc nhẹ cũng dễ hơn khi cùng làm.
Cách trình bày tốt làm nội dung hay thêm giá trị.
Gian khó có thể khiến mọi thứ mạnh mẽ hơn.
Thùng rỗng thường kêu to nhất.
Tiếp xúc lâu dài tự nhiên dẫn đến học hỏi.
Thói quen từ sớm kéo dài cả đời.
Chỉ sửa chữa sau khi thiệt hại đã xảy ra.
Khởi đầu tốt là một nửa công việc.
Hỏi và kiểm tra ngay cả trên đường quen.
Không có khói nếu không có nguyên nhân.
Kiên trì có thể vượt qua nhiệm vụ khó.
Trang phục có thể thay đổi ấn tượng.
Tầm nhìn hẹp nhầm giới hạn của mình là cả thế giới.
Ngay cả chuyên gia cũng mắc lỗi.
Lãnh đạo tốt tạo khuôn mẫu cho người bên dưới.
Vóc dáng nhỏ có thể ẩn sức mạnh lớn.
Đừng trút giận lên nhầm người.
Người hiền cũng phản kháng khi bị dồn ép quá mức.
Hành trình dài bắt đầu bằng một bước chân.
Những lợi ích nhỏ tích tụ thành điều lớn lao.
Việc này khó gần như không thể.
Thiếu kinh nghiệm có thể khiến ta không nhận ra nguy hiểm.
Nhắc đến ai đó và họ có thể xuất hiện.
Vấn đề nhỏ bị bỏ mặc sẽ thành vấn đề lớn.
Thật khó đáp lại lòng tốt bằng sự tàn nhẫn.
Bạn đến đúng lúc một việc bất ngờ xảy ra.
Hãy dùng lựa chọn tốt kế tiếp khi không có điều lý tưởng.
Đồ của người khác thường trông tốt hơn.
Cơ hội đã lỡ thường có vẻ lớn hơn về sau.
Dấu hiệu sớm thường cho thấy triển vọng tương lai.
Đó là một việc dễ và chắc chắn.
Chi phí phụ vượt quá giá trị chính.
Ai đó gây hại rồi giả vờ giúp đỡ.
Quá nhiều người chỉ huy có thể làm công việc lạc hướng.
Hết khó khăn này lại đến khó khăn khác.
Đó chỉ là một phần rất nhỏ của toàn bộ.
Kết quả phát sinh từ nguyên nhân.
Việc lớn không thể hoàn thành trong một lần.
Trao sự ấm áp sẽ nhận lại sự ấm áp.
Sai trái nhỏ có thể phát triển thành sai trái lớn.
Lời nói truyền đi rất xa và nhanh.
Gieo gì gặt nấy.
Thất bại mở đầu việc học chứ không kết thúc nỗ lực.
Sự bền bỉ có thể mạnh hơn tài năng.
Bước nhỏ hôm nay tạo nên con đường ngày mai.
Tốc độ sẽ đến khi độ chính xác thành thói quen.
Trưởng thành bắt đầu từ việc hỏi điều mình chưa biết.
Nghỉ ngơi không đồng nghĩa với bỏ cuộc.
Ghi lại chiến thắng nhỏ để duy trì động lực.
Đo tiến bộ bằng chính bạn của ngày hôm qua.
Hãy bắt đầu thay vì chờ khoảnh khắc hoàn hảo.
Đi đều đúng hướng rồi cũng sẽ tới đích.
Mười phút tập trung hơn một giờ xao nhãng.
Kiến thức trở thành của bạn khi bạn sử dụng nó.
Câu hỏi hay có thể tồn tại lâu hơn câu trả lời hay.
Ghi chép tồn tại lâu hơn trí nhớ.
Lỗi được sửa tạo nên ký ức rõ hơn.
Ngay cả ngày khó khăn, bạn vẫn có thể viết một dòng.
Mỗi người học với một tốc độ khác nhau.
Một lời tử tế ngắn có thể để lại dấu ấn lâu dài.
Hãy nghe, lặp lại và tự tay viết.
Luyện tập hằng ngày biến chữ lạ thành bạn.
`),
  th: lines(`
คำพูดที่ดีจะนำมาซึ่งคำพูดที่ดี
การเปลี่ยนแปลงเล็ก ๆ สะสมขึ้นก่อนที่เราจะรู้ตัว
อย่าลืมจุดเริ่มต้นอันเรียบง่ายของตน
ผู้อ่อนแออาจเดือดร้อนเมื่อผู้มีอำนาจต่อสู้กัน
ความสุขมาหลังจากความยากลำบาก
ความพยายามอย่างรอบคอบสร้างผลลัพธ์ที่ยั่งยืน
ศักยภาพมีคุณค่าเมื่อได้ลงมือทำ
สิ่งที่น่าปรารถนาแต่เอื้อมไม่ถึง
แม้แต่วิวสวยก็เพลิดเพลินกว่าเมื่อกินอิ่ม
ยิ่งเร่งด่วนยิ่งต้องดำเนินการอย่างระมัดระวัง
ควรระวัง เพราะคำพูดส่วนตัวอาจมีคนได้ยิน
ปัญหาของตนเองต้องได้รับการดูแลก่อน
เป็นเรื่องง่ายมาก
ทุกสิ่งย่อมลดลงหลังถึงจุดสูงสุด
เป็นการเปรียบเทียบระหว่างผู้ที่แทบไม่ต่างกัน
แม้ดูแน่นอนก็ควรตรวจสอบก่อนลงมือ
สิ่งที่อยู่ใกล้ที่สุดอาจสังเกตเห็นได้ยากที่สุด
คำพูดที่รอบคอบคำเดียวอาจแก้ปัญหาใหญ่ได้
เส้นทางต่างกันก็ไปถึงเป้าหมายเดียวกันได้
การทรยศมักมาจากที่ที่เราเคยไว้วางใจ
แม้งานเบาก็ง่ายขึ้นเมื่อช่วยกัน
การนำเสนอที่ดีเพิ่มคุณค่าให้เนื้อหาที่ดี
ความยากลำบากทำให้สิ่งต่าง ๆ แข็งแกร่งขึ้นได้
ภาชนะว่างส่งเสียงดังที่สุด
การพบเห็นเป็นเวลานานนำไปสู่การเรียนรู้โดยธรรมชาติ
นิสัยที่เกิดแต่เด็กอยู่ไปตลอดชีวิต
ซ่อมแซมเมื่อความเสียหายเกิดขึ้นแล้ว
การเริ่มต้นที่ดีเท่ากับทำงานไปครึ่งหนึ่ง
แม้ทางคุ้นเคยก็ควรถามและตรวจสอบ
ไม่มีควันโดยปราศจากสาเหตุ
ความพากเพียรเอาชนะงานยากได้
เสื้อผ้าเปลี่ยนความประทับใจได้
มุมมองแคบมองขอบเขตของตนเป็นโลกทั้งใบ
แม้แต่ผู้เชี่ยวชาญก็ทำผิดพลาด
ผู้นำที่ดีวางแบบอย่างให้ผู้ตาม
ขนาดเล็กอาจซ่อนพลังอันยิ่งใหญ่
อย่าระบายความโกรธใส่คนผิด
แม้คนอ่อนโยนก็ต่อต้านเมื่อถูกกดดันเกินไป
การเดินทางไกลเริ่มจากก้าวเดียว
สิ่งเล็ก ๆ สะสมจนกลายเป็นสิ่งใหญ่
เป็นเรื่องยากจนแทบเป็นไปไม่ได้
การขาดประสบการณ์อาจทำให้มองไม่เห็นอันตราย
เอ่ยถึงใคร คนนั้นอาจปรากฏตัว
ปัญหาเล็กที่ถูกละเลยจะกลายเป็นปัญหาใหญ่
ยากที่จะตอบแทนความเมตตาด้วยความโหดร้าย
มาถึงพอดีตอนเกิดเหตุการณ์ที่ไม่คาดคิด
ใช้ตัวเลือกที่ใกล้เคียงที่สุดเมื่อสิ่งที่เหมาะที่สุดไม่มี
ของของผู้อื่นมักดูดีกว่า
โอกาสที่พลาดไปมักดูยิ่งใหญ่ขึ้นภายหลัง
สัญญาณแรกเริ่มมักเผยศักยภาพในอนาคต
เป็นงานที่ง่ายและแน่นอน
ค่าใช้จ่ายส่วนเกินมากกว่าคุณค่าหลัก
บางคนทำร้ายแล้วแสร้งทำเป็นช่วย
ผู้นำมากเกินไปอาจทำให้งานหลงทาง
ผ่านความยากหนึ่งก็เจออีกความยาก
เป็นเพียงส่วนเล็กน้อยของทั้งหมด
ผลลัพธ์ย่อมตามมาจากสาเหตุ
งานใหญ่ไม่อาจเสร็จได้ในครั้งเดียว
มอบความอบอุ่นย่อมได้รับความอบอุ่นกลับมา
ความผิดเล็กอาจเติบโตเป็นความผิดใหญ่
คำพูดเดินทางได้ไกลและรวดเร็ว
หว่านสิ่งใดย่อมเก็บเกี่ยวสิ่งนั้น
ความล้มเหลวเริ่มการเรียนรู้ ไม่ได้จบความพยายาม
ความสม่ำเสมออาจแข็งแกร่งกว่าพรสวรรค์
ก้าวเล็กวันนี้สร้างเส้นทางของวันพรุ่งนี้
ความเร็วจะตามมาเมื่อความแม่นยำเป็นนิสัย
การเติบโตเริ่มจากการถามสิ่งที่ไม่รู้
การพักไม่เหมือนกับการยอมแพ้
บันทึกชัยชนะเล็ก ๆ เพื่อรักษาแรงจูงใจ
วัดความก้าวหน้ากับตัวเองในอดีต
เริ่มลงมือแทนการรอช่วงเวลาที่สมบูรณ์แบบ
ก้าวอย่างสม่ำเสมอในทิศทางที่ถูกต้องย่อมถึงจุดหมาย
สิบนาทีที่จดจ่อดีกว่าหนึ่งชั่วโมงที่วอกแวก
ความรู้เป็นของเราเมื่อเราใช้มัน
คำถามที่ดีอาจอยู่ได้นานกว่าคำตอบที่ดี
บันทึกอยู่ได้นานกว่าความทรงจำ
การแก้ข้อผิดพลาดสร้างความจำที่ชัดเจนขึ้น
แม้ในวันที่ยากก็ยังเขียนได้หนึ่งบรรทัด
แต่ละคนเรียนรู้ด้วยความเร็วต่างกัน
คำพูดดีสั้น ๆ อาจทิ้งความประทับใจยาวนาน
ฟัง ทำซ้ำ แล้วเขียนด้วยตนเอง
การฝึกทุกวันทำให้ตัวอักษรแปลกหน้ากลายเป็นเพื่อน
`),
  ar: lines(`
الكلمات الطيبة تجلب كلمات طيبة.
تتراكم التغييرات الصغيرة قبل أن تلاحظها.
لا تنس بداياتك المتواضعة.
قد يعاني الضعفاء عندما يتصارع الأقوياء.
تأتي السعادة بعد المشقة.
الجهد المتقن يصنع نتائج دائمة.
تصبح الإمكانات ذات قيمة بالعمل.
شيء مرغوب لكنه بعيد المنال.
حتى المناظر الجميلة تكون أمتع بعد الطعام.
كلما زاد الاستعجال وجب التقدم بحذر أكبر.
احذر لأن الكلام الخاص قد يسمعه الآخرون.
مشكلاتي الخاصة تحتاج إلى الاهتمام أولاً.
هذا سهل للغاية.
كل شيء يتراجع بعد بلوغ القمة.
إنها مقارنة بين أشخاص متقاربين جداً.
تحقق حتى مما يبدو مؤكداً قبل أن تتصرف.
قد يكون الأقرب هو الأصعب ملاحظة.
كلمة مدروسة قد تحل مشكلة كبيرة.
طرق مختلفة قد تصل إلى الهدف نفسه.
تأتي الخيانة غالباً ممن وُضع فيه الثقة.
حتى العمل الخفيف يصبح أسهل معاً.
العرض الجيد يزيد المحتوى الجيد قيمة.
قد تجعل المشقة الأشياء أقوى.
الأوعية الفارغة تصدر الضجيج الأكبر.
المخالطة الطويلة تقود إلى التعلم طبيعياً.
عادات الصغر تدوم مدى الحياة.
إصلاح الأمور بعد وقوع الضرر.
البداية الجيدة نصف العمل.
اسأل وتحقق حتى في الطريق المألوف.
لا دخان بلا سبب.
المثابرة تتغلب على المهمة الصعبة.
الملابس قد تغير الانطباع.
الرؤية الضيقة تظن حدودها العالم كله.
حتى الخبراء يخطئون.
القيادة الجيدة تضع القدوة لمن تحتها.
الحجم الصغير قد يخفي قوة كبيرة.
لا تصب غضبك على الشخص الخطأ.
حتى الوديع يقاوم إذا دُفع بعيداً.
رحلة الألف ميل تبدأ بخطوة.
المكاسب الصغيرة تتجمع فتصبح شيئاً عظيماً.
هذا صعب إلى حد يكاد يكون مستحيلاً.
قلة الخبرة قد تمنع إدراك الخطر.
اذكر شخصاً فقد يظهر.
المشكلة الصغيرة المهملة تصبح كبيرة.
يصعب الرد على اللطف بالقسوة.
تصل في اللحظة التي يقع فيها أمر غير متوقع.
استخدم أفضل بديل عندما لا يتوفر الخيار المثالي.
ما لدى الآخرين يبدو غالباً أفضل.
الفرصة الضائعة تبدو أكبر بعد فواتها.
العلامات المبكرة تكشف غالباً عن وعد المستقبل.
إنها مهمة سهلة ومضمونة.
التكلفة الإضافية تتجاوز القيمة الأساسية.
يسبب شخص الضرر ثم يتظاهر بالمساعدة.
كثرة القادة قد تضلل العمل.
تأتي صعوبة بعد أخرى.
إنه جزء ضئيل جداً من الكل.
النتائج تتبع أسبابها.
العمل العظيم لا يكتمل بمحاولة واحدة.
الدفء الذي تمنحه يدعو إلى دفء مماثل.
الخطأ الصغير قد يكبر إلى خطأ أعظم.
الكلمات تنتشر بعيداً وبسرعة.
تحصد ما تزرع.
الفشل يبدأ التعلم ولا ينهي الجهد.
الاستمرار قد يصبح أقوى من الموهبة.
خطوة اليوم الصغيرة تصنع طريق الغد.
تأتي السرعة عندما تصبح الدقة عادة.
النمو يبدأ بسؤال ما لا تعرفه.
الراحة ليست استسلاماً.
سجل الانتصارات الصغيرة لتحافظ على الدافع.
قس تقدمك مقارنة بنفسك في الماضي.
ابدأ بدلاً من انتظار اللحظة المثالية.
السير الثابت في الاتجاه الصحيح يصل إلى الهدف.
عشر دقائق من التركيز أفضل من ساعة مشتتة.
تصبح المعرفة ملكك عندما تستخدمها.
السؤال الجيد قد يبقى أطول من الإجابة الجيدة.
السجل يدوم أطول من الذاكرة.
تصحيح الأخطاء يبني ذاكرة أوضح.
حتى في يوم صعب يمكنك كتابة سطر واحد.
يتعلم كل شخص بوتيرة مختلفة.
كلمة طيبة قصيرة قد تترك أثراً طويلاً.
استمع وكرر واكتب بنفسك.
الممارسة اليومية تحول الحروف الغريبة إلى أصدقاء.
`),
  fa: lines(`
سخنان مهربان، سخنان مهربان به همراه می‌آورند.
تغییرهای کوچک پیش از آن‌که متوجه شوید جمع می‌شوند.
آغاز فروتنانهٔ خود را فراموش نکنید.
وقتی قدرتمندان می‌جنگند، ضعیفان ممکن است آسیب ببینند.
پس از سختی، شادی می‌آید.
تلاش دقیق نتیجه‌ای ماندگار می‌سازد.
توانایی با عمل ارزشمند می‌شود.
چیزی خواستنی اما دست‌نیافتنی.
حتی منظرهٔ زیبا پس از غذا لذت‌بخش‌تر است.
هرچه کار فوری‌تر باشد، باید با دقت بیشتری پیش رفت.
مراقب باشید، زیرا سخن خصوصی ممکن است شنیده شود.
نخست باید به مشکلات خودم رسیدگی کنم.
این کار بسیار آسان است.
همه چیز پس از رسیدن به اوج کاهش می‌یابد.
این مقایسه‌ای میان افراد تقریباً برابر است.
پیش از عمل، حتی چیز قطعی را نیز بررسی کنید.
گاهی نزدیک‌ترین چیز سخت‌تر دیده می‌شود.
یک سخن سنجیده می‌تواند مشکلی بزرگ را حل کند.
راه‌های متفاوت می‌توانند به یک هدف برسند.
خیانت اغلب از جایی می‌آید که اعتماد کرده‌ایم.
حتی کار سبک هم با همکاری آسان‌تر است.
ارائهٔ خوب به محتوای خوب ارزش می‌افزاید.
سختی می‌تواند چیزها را محکم‌تر کند.
ظرف خالی بیشترین صدا را دارد.
تماس طولانی به‌طور طبیعی به یادگیری می‌انجامد.
عادت‌های کودکی تا پایان عمر می‌مانند.
تعمیر کردن پس از آن‌که زیان رخ داده است.
شروع خوب نیمی از کار است.
حتی در راه آشنا نیز بپرسید و بررسی کنید.
هیچ دودی بدون علت نیست.
پشتکار می‌تواند بر کار دشوار غلبه کند.
لباس می‌تواند برداشت دیگران را تغییر دهد.
دید محدود، مرز خود را همهٔ جهان می‌پندارد.
حتی متخصصان نیز اشتباه می‌کنند.
رهبری خوب برای دیگران الگو می‌سازد.
اندازهٔ کوچک می‌تواند نیروی بزرگی پنهان کند.
خشم خود را بر سر فرد نادرست خالی نکنید.
حتی فرد آرام نیز با فشار زیاد مقاومت می‌کند.
سفر طولانی با یک گام آغاز می‌شود.
دستاوردهای کوچک جمع می‌شوند و بزرگ می‌گردند.
این کار تقریباً ناممکن است.
بی‌تجربگی ممکن است مانع شناخت خطر شود.
از کسی سخن بگویید و شاید ظاهر شود.
مشکل کوچکِ نادیده‌گرفته‌شده بزرگ می‌شود.
پاسخ دادن به مهربانی با بی‌رحمی دشوار است.
درست هنگامی می‌رسید که اتفاقی غیرمنتظره رخ می‌دهد.
اگر گزینهٔ ایده‌آل نیست، بهترین جایگزین را به کار ببرید.
داشته‌های دیگران اغلب بهتر به نظر می‌رسد.
فرصت ازدست‌رفته بعداً بزرگ‌تر به نظر می‌رسد.
نشانه‌های نخستین اغلب استعداد آینده را نشان می‌دهند.
این کاری آسان و مطمئن است.
هزینهٔ جانبی از ارزش اصلی بیشتر می‌شود.
کسی آسیب می‌زند و سپس وانمود می‌کند کمک می‌کند.
رهبران بسیار می‌توانند کار را از مسیر خارج کنند.
یک دشواری پس از دشواری دیگر می‌آید.
این تنها بخش بسیار کوچکی از کل است.
نتیجه‌ها از علت‌های خود پیروی می‌کنند.
کار بزرگ با یک تلاش تمام نمی‌شود.
مهربانیِ داده‌شده، مهربانیِ متقابل می‌آورد.
خطای کوچک می‌تواند به خطایی بزرگ تبدیل شود.
سخنان بسیار دور و سریع پخش می‌شوند.
آنچه می‌کارید درو می‌کنید.
شکست آغاز یادگیری است، نه پایان تلاش.
پیوستگی می‌تواند از استعداد نیرومندتر شود.
گام کوچک امروز راه فردا را می‌سازد.
وقتی دقت عادت شود، سرعت نیز می‌آید.
رشد با پرسیدن آنچه نمی‌دانید آغاز می‌شود.
استراحت با تسلیم شدن یکی نیست.
پیروزی‌های کوچک را ثبت کنید تا انگیزه بماند.
پیشرفت را با خودِ گذشته‌تان بسنجید.
به‌جای انتظار لحظهٔ کامل، آغاز کنید.
حرکت پیوسته در جهت درست به مقصد می‌رسد.
ده دقیقه تمرکز از یک ساعت حواس‌پرتی بهتر است.
دانش وقتی به کار می‌رود از آنِ شما می‌شود.
پرسش خوب می‌تواند بیش از پاسخ خوب بماند.
نوشته از حافظه ماندگارتر است.
اصلاح اشتباه‌ها حافظه را روشن‌تر می‌کند.
حتی در روز سخت می‌توانید یک سطر بنویسید.
هر کس با سرعت متفاوتی یاد می‌گیرد.
یک سخن کوتاه و مهربان اثری ماندگار می‌گذارد.
گوش دهید، تکرار کنید و خودتان بنویسید.
تمرین روزانه حروف ناآشنا را به دوست تبدیل می‌کند.
`),
  ur: lines(`
نرم الفاظ نرم الفاظ کو دعوت دیتے ہیں۔
چھوٹی تبدیلیاں آپ کے محسوس کرنے سے پہلے جمع ہو جاتی ہیں۔
اپنی عاجزانہ ابتدا نہ بھولیں۔
طاقتوروں کی لڑائی میں کمزور نقصان اٹھا سکتے ہیں۔
مشکل کے بعد خوشی آتی ہے۔
محتاط کوشش دیرپا نتائج بناتی ہے۔
صلاحیت عمل کے ذریعے قیمتی بنتی ہے۔
ایک پسندیدہ مگر ناقابلِ حصول چیز۔
خوبصورت منظر بھی کھانے کے بعد زیادہ اچھا لگتا ہے۔
کام جتنا فوری ہو، اتنی ہی احتیاط سے آگے بڑھیں۔
محتاط رہیں کیونکہ نجی بات سنی جا سکتی ہے۔
پہلے میرے اپنے مسائل توجہ چاہتے ہیں۔
یہ انتہائی آسان ہے۔
ہر چیز عروج کے بعد کم ہونے لگتی ہے۔
یہ تقریباً برابر لوگوں کے درمیان موازنہ ہے۔
عمل سے پہلے یقینی بات بھی دوبارہ جانچیں۔
سب سے قریب چیز کو دیکھنا کبھی سب سے مشکل ہوتا ہے۔
ایک سوچا سمجھا لفظ بڑی مشکل حل کر سکتا ہے۔
مختلف راستے ایک ہی مقصد تک پہنچ سکتے ہیں۔
دھوکا اکثر وہیں سے آتا ہے جہاں بھروسا کیا گیا ہو۔
ہلکا کام بھی مل کر آسان ہو جاتا ہے۔
اچھی پیش کش اچھے مواد کی قدر بڑھاتی ہے۔
مشکل حالات چیزوں کو مضبوط بنا سکتے ہیں۔
خالی برتن سب سے زیادہ آواز کرتے ہیں۔
طویل واسطہ فطری طور پر سیکھنے کی طرف لے جاتا ہے۔
بچپن کی عادتیں عمر بھر رہتی ہیں۔
نقصان ہونے کے بعد چیزیں ٹھیک کرنا۔
اچھی ابتدا آدھا کام ہے۔
واقف راستے پر بھی پوچھیں اور جانچیں۔
بغیر سبب دھواں نہیں ہوتا۔
ثابت قدمی مشکل کام پر قابو پا سکتی ہے۔
لباس تاثر بدل سکتا ہے۔
تنگ نظر اپنی حد کو پوری دنیا سمجھتا ہے۔
ماہر بھی غلطیاں کرتے ہیں۔
اچھی قیادت دوسروں کے لیے معیار قائم کرتی ہے۔
چھوٹا جسم بڑی طاقت چھپا سکتا ہے۔
اپنا غصہ غلط شخص پر نہ نکالیں۔
نرم مزاج بھی حد سے زیادہ دبانے پر مزاحمت کرتا ہے۔
طویل سفر ایک قدم سے شروع ہوتا ہے۔
چھوٹی کامیابیاں جمع ہو کر بڑی بنتی ہیں۔
یہ تقریباً ناممکن حد تک مشکل ہے۔
کم تجربہ خطرے کو پہچاننے سے روک سکتا ہے۔
کسی کا ذکر کریں تو وہ سامنے آ سکتا ہے۔
نظرانداز کیا گیا چھوٹا مسئلہ بڑا بن جاتا ہے۔
مہربانی کا جواب ظلم سے دینا مشکل ہے۔
آپ ٹھیک اس وقت پہنچتے ہیں جب غیر متوقع واقعہ ہو۔
مثالی چیز نہ ہو تو اگلا بہترین متبادل اپنائیں۔
دوسروں کی چیز اکثر بہتر دکھائی دیتی ہے۔
گنوایا ہوا موقع بعد میں بڑا دکھائی دیتا ہے۔
ابتدائی نشانیاں اکثر مستقبل کی صلاحیت دکھاتی ہیں۔
یہ آسان اور یقینی کام ہے۔
اضافی لاگت اصل قدر سے بڑھ جاتی ہے۔
کوئی نقصان پہنچا کر مدد کا دکھاوا کرتا ہے۔
بہت سے رہنما کام کو راستے سے ہٹا سکتے ہیں۔
ایک مشکل کے بعد دوسری مشکل آتی ہے۔
یہ پورے کا صرف بہت چھوٹا حصہ ہے۔
نتائج اپنی وجوہات کے مطابق آتے ہیں۔
بڑا کام ایک کوشش میں مکمل نہیں ہوتا۔
دی گئی محبت بدلے میں محبت لاتی ہے۔
چھوٹی بدعملی بڑے جرم میں بڑھ سکتی ہے۔
باتیں بہت دور اور تیزی سے پھیلتی ہیں۔
جیسا بوئیں گے ویسا کاٹیں گے۔
ناکامی کوشش ختم نہیں کرتی، سیکھنا شروع کرتی ہے۔
تسلسل صلاحیت سے زیادہ طاقتور بن سکتا ہے۔
آج کا چھوٹا قدم کل کی راہ بناتا ہے۔
درستی عادت بنے تو رفتار خود آتی ہے۔
ترقی اس بات کو پوچھنے سے شروع ہوتی ہے جو آپ نہیں جانتے۔
آرام کرنا ہار ماننا نہیں ہے۔
حوصلہ قائم رکھنے کے لیے چھوٹی کامیابیاں لکھیں۔
اپنی ترقی کا موازنہ اپنے ماضی سے کریں۔
کامل لمحے کے انتظار کے بجائے شروع کریں۔
صحیح سمت میں مستقل رفتار منزل تک پہنچاتی ہے۔
دس منٹ کی توجہ ایک بکھرے گھنٹے سے بہتر ہے۔
علم استعمال کرنے پر آپ کا بنتا ہے۔
اچھا سوال اچھے جواب سے زیادہ دیر رہ سکتا ہے۔
تحریری ریکارڈ یادداشت سے زیادہ دیر رہتا ہے۔
درست کی گئی غلطیاں یادداشت واضح کرتی ہیں۔
مشکل دن میں بھی آپ ایک سطر لکھ سکتے ہیں۔
ہر شخص مختلف رفتار سے سیکھتا ہے۔
مختصر نرم لفظ دیرپا اثر چھوڑ سکتا ہے۔
سنیں، دہرائیں اور خود لکھیں۔
روزانہ مشق اجنبی حروف کو دوست بنا دیتی ہے۔
`),
  hi: lines(`
दयालु शब्द दयालु शब्दों को आमंत्रित करते हैं।
छोटे बदलाव आपके ध्यान देने से पहले जमा हो जाते हैं।
अपनी साधारण शुरुआत को मत भूलिए।
शक्तिशाली लोगों की लड़ाई में कमजोर पीड़ित हो सकते हैं।
कठिनाई के बाद आनंद आता है।
सावधानी से किया प्रयास टिकाऊ परिणाम बनाता है।
क्षमता कर्म के माध्यम से मूल्यवान बनती है।
ऐसी मनचाही वस्तु जिसे पाया नहीं जा सकता।
सुंदर दृश्य भी भोजन के बाद अधिक अच्छे लगते हैं।
काम जितना जरूरी हो, उतनी ही सावधानी से आगे बढ़ें।
सावधान रहें, निजी बातें भी सुनी जा सकती हैं।
पहले मेरी अपनी समस्याओं पर ध्यान देना जरूरी है।
यह बेहद आसान है।
हर चीज शिखर पर पहुँचने के बाद घटती है।
यह लगभग बराबर लोगों के बीच तुलना है।
कार्य करने से पहले निश्चित बात को भी जाँचें।
सबसे निकट की चीज कभी सबसे कठिन दिखाई देती है।
सोचा-समझा शब्द बड़ी समस्या सुलझा सकता है।
अलग रास्ते एक ही लक्ष्य तक पहुँच सकते हैं।
विश्वासघात अक्सर वहीं से आता है जहाँ भरोसा रखा गया हो।
हल्का काम भी साथ करने पर आसान होता है।
अच्छी प्रस्तुति अच्छे विषय का मूल्य बढ़ाती है।
कठिनाई चीजों को मजबूत बना सकती है।
खाली बर्तन सबसे अधिक आवाज करते हैं।
लंबे समय का संपर्क स्वाभाविक रूप से सीखने तक ले जाता है।
बचपन की आदतें जीवन भर रहती हैं।
नुकसान हो जाने के बाद चीजें सुधारना।
अच्छी शुरुआत आधा काम है।
जानी-पहचानी राह पर भी पूछें और जाँचें।
बिना कारण धुआँ नहीं उठता।
लगातार प्रयास कठिन काम पर विजय पा सकता है।
कपड़े छवि बदल सकते हैं।
संकीर्ण दृष्टि अपनी सीमा को पूरी दुनिया समझती है।
विशेषज्ञ भी गलतियाँ करते हैं।
अच्छा नेतृत्व दूसरों के लिए स्वर तय करता है।
छोटा आकार बड़ी शक्ति छिपा सकता है।
अपना गुस्सा गलत व्यक्ति पर न निकालें।
शांत व्यक्ति भी बहुत दबाने पर विरोध करता है।
लंबी यात्रा एक कदम से शुरू होती है।
छोटी उपलब्धियाँ मिलकर बड़ी बनती हैं।
यह लगभग असंभव रूप से कठिन है।
अनुभव की कमी खतरे को पहचानने से रोक सकती है।
किसी का नाम लें और वह सामने आ सकता है।
छोटी अनदेखी समस्या बड़ी बन जाती है।
दया का उत्तर क्रूरता से देना कठिन है।
आप ठीक उसी समय पहुँचते हैं जब कुछ अनपेक्षित होता है।
आदर्श विकल्प न हो तो अगला सर्वोत्तम विकल्प लें।
दूसरों की चीज अक्सर बेहतर दिखाई देती है।
छूटा अवसर बाद में अधिक बड़ा लगता है।
शुरुआती संकेत अक्सर भविष्य की संभावना दिखाते हैं।
यह आसान और निश्चित काम है।
अतिरिक्त लागत मुख्य मूल्य से अधिक हो जाती है।
कोई नुकसान पहुँचाकर मदद का दिखावा करता है।
बहुत से नेता काम को भटका सकते हैं।
एक कठिनाई के बाद दूसरी आती है।
यह पूरे का केवल एक छोटा अंश है।
परिणाम अपने कारणों से आते हैं।
बड़ा काम एक प्रयास में पूरा नहीं होता।
दी गई आत्मीयता आत्मीयता वापस लाती है।
छोटी बुरी आदत बड़ा अपराध बन सकती है।
शब्द बहुत दूर और तेजी से फैलते हैं।
जैसा बोओगे वैसा काटोगे।
असफलता प्रयास खत्म नहीं करती, सीखना शुरू करती है।
निरंतरता प्रतिभा से अधिक शक्तिशाली बन सकती है।
आज का छोटा कदम कल की राह बनाता है।
सटीकता आदत बने तो गति स्वयं आती है।
विकास उस बात को पूछने से शुरू होता है जो आप नहीं जानते।
आराम करना हार मानना नहीं है।
प्रेरणा बनाए रखने के लिए छोटी जीत दर्ज करें।
अपनी प्रगति की तुलना अपने पुराने रूप से करें।
सही समय की प्रतीक्षा के बजाय शुरू करें।
सही दिशा में स्थिर गति मंजिल तक पहुँचती है।
दस मिनट की एकाग्रता बिखरे हुए एक घंटे से बेहतर है।
ज्ञान उपयोग करने पर आपका बनता है।
अच्छा प्रश्न अच्छे उत्तर से अधिक समय रह सकता है।
लिखा हुआ रिकॉर्ड याददाश्त से अधिक टिकता है।
सुधारी गई गलतियाँ स्मृति को स्पष्ट बनाती हैं।
कठिन दिन में भी आप एक पंक्ति लिख सकते हैं।
हर व्यक्ति अलग गति से सीखता है।
छोटा दयालु शब्द स्थायी छाप छोड़ सकता है।
सुनें, दोहराएँ और स्वयं लिखें।
रोज का अभ्यास अनजान अक्षरों को मित्र बना देता है।
`),
  ne: lines(`
दयालु शब्दले दयालु शब्द नै फर्काउँछन्।
साना परिवर्तन थाहा नपाउँदै जम्मा हुन्छन्।
आफ्नो सामान्य सुरुवात नबिर्सनुहोस्।
शक्तिशालीहरू लड्दा कमजोरले दुःख पाउन सक्छन्।
कठिनाइपछि खुसी आउँछ।
सावधानीपूर्वक प्रयासले टिकाउ नतिजा दिन्छ।
सम्भावना कामबाट मूल्यवान् बन्छ।
चाहना भएको तर पाउन नसकिने कुरा।
राम्रो दृश्य पनि खाना खाएपछि अझ रमाइलो हुन्छ।
काम जति जरुरी हुन्छ, उति सावधानीपूर्वक अघि बढ्नुपर्छ।
सावधान रहनुहोस्, गोप्य कुरा पनि सुनिन सक्छ।
पहिले आफ्नै समस्यामा ध्यान दिनुपर्छ।
यो अत्यन्त सजिलो छ।
शिखर पुगेपछि सबै कुरा घट्न थाल्छ।
यो लगभग बराबर व्यक्तिबीचको तुलना हो।
काम गर्नुअघि निश्चित देखिएको कुरा पनि जाँच्नुहोस्।
सबैभन्दा नजिकको कुरा कहिलेकाहीँ देख्न गाह्रो हुन्छ।
सोचेर बोलेको शब्दले ठूलो समस्या समाधान गर्न सक्छ।
फरक बाटोले एउटै लक्ष्यमा पुर्‍याउन सक्छ।
विश्वासघात प्रायः भरोसा राखेकै ठाउँबाट आउँछ।
हलुका काम पनि मिलेर गर्दा सजिलो हुन्छ।
राम्रो प्रस्तुतिले राम्रो विषयलाई अझ मूल्यवान् बनाउँछ।
कठिनाइले चीजलाई बलियो बनाउन सक्छ।
खाली भाँडोले सबैभन्दा ठूलो आवाज गर्छ।
लामो समयको सम्पर्कले स्वाभाविक रूपमा सिकाउँछ।
सानैदेखिको बानी जीवनभर रहन्छ।
क्षति भइसकेपछि मात्र सुधार गर्नु।
राम्रो सुरुवात आधा काम हो।
चिनेको बाटोमा पनि सोध्नुहोस् र जाँच्नुहोस्।
कारणबिना धुवाँ उठ्दैन।
निरन्तर प्रयासले कठिन काम जित्न सक्छ।
लुगाले छाप बदल्न सक्छ।
साँघुरो दृष्टिले आफ्नै सीमालाई संसार ठान्छ।
विशेषज्ञले पनि गल्ती गर्छन्।
राम्रो नेतृत्वले अरूका लागि मानक बनाउँछ।
सानो आकारमा ठूलो शक्ति लुकेको हुन सक्छ।
रिस गलत व्यक्तिमाथि नपोख्नुहोस्।
शान्त व्यक्ति पनि धेरै दबाउँदा प्रतिरोध गर्छ।
लामो यात्रा एक पाइलाबाट सुरु हुन्छ।
साना उपलब्धि जम्मा भएर ठूलो बन्छन्।
यो लगभग असम्भव जति कठिन छ।
अनुभवको कमीले खतरा चिन्न नसक्न सक्छ।
कसैको कुरा गर्दा ऊ देखा पर्न सक्छ।
बेवास्ता गरिएको सानो समस्या ठूलो बन्छ।
दयाको जवाफ क्रूरताले दिन गाह्रो हुन्छ।
अप्रत्याशित घटना हुँदा ठीक त्यही बेला पुग्नु।
आदर्श विकल्प नभए अर्को उत्तम विकल्प रोज्नुहोस्।
अरूको चीज प्रायः राम्रो देखिन्छ।
छुटेको अवसर पछि अझ ठूलो देखिन्छ।
सुरुका संकेतले भविष्यको सम्भावना देखाउँछन्।
यो सजिलो र निश्चित काम हो।
अतिरिक्त खर्च मुख्य मूल्यभन्दा ठूलो हुन्छ।
कसैले हानि गरेर पछि सहयोगको नाटक गर्छ।
धेरै नेताले कामलाई बाटोबाट हटाउन सक्छन्।
एउटा कठिनाइपछि अर्को आउँछ।
यो समग्रको अत्यन्त सानो अंश हो।
नतिजा आफ्ना कारणअनुसार आउँछ।
ठूलो काम एक प्रयासमा पूरा हुँदैन।
दिएको आत्मीयताले आत्मीयता फर्काउँछ।
सानो गलत काम ठूलो अपराध बन्न सक्छ।
शब्द धेरै टाढा र छिटो फैलिन्छ।
जे रोपिन्छ त्यही फल्छ।
असफलताले प्रयास रोक्दैन, सिकाइ सुरु गर्छ।
निरन्तरता प्रतिभाभन्दा बलियो हुन सक्छ।
आजको सानो पाइलाले भोलिको बाटो बनाउँछ।
शुद्धता बानी बनेपछि गति आउँछ।
विकास नजानेको कुरा सोध्नबाट सुरु हुन्छ।
आराम गर्नु हार मान्नु होइन।
प्रेरणा कायम राख्न साना सफलता लेख्नुहोस्।
आफ्नो प्रगति विगतको आफूसँग तुलना गर्नुहोस्।
सही समय पर्खनुभन्दा सुरु गर्नुहोस्।
सही दिशाको स्थिर गतिले गन्तव्यमा पुर्‍याउँछ।
दस मिनेटको एकाग्रता अलमलिएको एक घण्टाभन्दा राम्रो हुन्छ।
ज्ञान प्रयोग गरेपछि आफ्नो हुन्छ।
राम्रो प्रश्न राम्रो उत्तरभन्दा लामो समय टिक्न सक्छ।
लेखिएको कुरा सम्झनाभन्दा लामो समय टिक्छ।
सच्याइएका गल्तीले स्पष्ट सम्झना बनाउँछन्।
कठिन दिनमा पनि एक हरफ लेख्न सकिन्छ।
हरेक व्यक्ति फरक गतिमा सिक्छ।
छोटो दयालु शब्दले दीर्घ छाप छोड्न सक्छ।
सुन्नुहोस्, दोहोर्‍याउनुहोस् र आफैँ लेख्नुहोस्।
दैनिक अभ्यासले अपरिचित अक्षरलाई साथी बनाउँछ।
`),
  bn: lines(`
ভালো কথা ভালো কথাকে আহ্বান করে।
ছোট পরিবর্তন বুঝে ওঠার আগেই জমে যায়।
নিজের সাধারণ শুরুর কথা ভুলবেন না।
শক্তিশালীরা লড়লে দুর্বলরা কষ্ট পেতে পারে।
কষ্টের পর আনন্দ আসে।
যত্নশীল প্রচেষ্টা স্থায়ী ফল গড়ে।
কাজের মাধ্যমেই সম্ভাবনা মূল্যবান হয়।
কাঙ্ক্ষিত কিন্তু অপ্রাপ্য কোনো কিছু।
খাওয়ার পর সুন্দর দৃশ্যও বেশি উপভোগ্য।
যত জরুরি, তত সতর্কভাবে এগোতে হবে।
সাবধান থাকুন, গোপন কথাও শোনা যেতে পারে।
আগে নিজের সমস্যায় মনোযোগ দিতে হবে।
এটি অত্যন্ত সহজ।
শিখরে পৌঁছানোর পর সবকিছু কমতে থাকে।
এটি প্রায় সমানদের মধ্যে তুলনা।
কাজের আগে নিশ্চিত বিষয়ও যাচাই করুন।
সবচেয়ে কাছের জিনিস কখনো সবচেয়ে কঠিন দেখা যায়।
ভেবেচিন্তে বলা কথা বড় সমস্যা মেটাতে পারে।
ভিন্ন পথ একই লক্ষ্যে পৌঁছাতে পারে।
বিশ্বাসঘাতকতা প্রায়ই বিশ্বাসের জায়গা থেকেই আসে।
হালকা কাজও একসঙ্গে করলে সহজ হয়।
ভালো উপস্থাপনা ভালো বিষয়কে আরও মূল্যবান করে।
কষ্ট অনেক কিছুকে শক্ত করতে পারে।
খালি পাত্রই বেশি শব্দ করে।
দীর্ঘ পরিচয় স্বাভাবিকভাবেই শেখায়।
ছোটবেলার অভ্যাস সারাজীবন থাকে।
ক্ষতি হওয়ার পর মেরামত করা।
ভালো শুরু অর্ধেক কাজ।
চেনা পথেও জিজ্ঞেস ও যাচাই করুন।
কারণ ছাড়া ধোঁয়া হয় না।
অধ্যবসায় কঠিন কাজ জয় করতে পারে।
পোশাক মানুষের ধারণা বদলাতে পারে।
সংকীর্ণ দৃষ্টি নিজের সীমাকেই পুরো পৃথিবী ভাবে।
বিশেষজ্ঞরাও ভুল করেন।
ভালো নেতৃত্ব অন্যদের মান নির্ধারণ করে।
ছোট আকারে বড় শক্তি লুকিয়ে থাকতে পারে।
ভুল মানুষের ওপর রাগ ঝাড়বেন না।
শান্ত মানুষও অতিরিক্ত চাপ দিলে প্রতিরোধ করে।
দীর্ঘ যাত্রা এক ধাপ দিয়ে শুরু হয়।
ছোট অর্জন জমে বড় কিছু হয়।
এটি প্রায় অসম্ভব রকম কঠিন।
অভিজ্ঞতার অভাবে বিপদ বোঝা নাও যেতে পারে।
কারও কথা বললেই সে হাজির হতে পারে।
অবহেলিত ছোট সমস্যা বড় হয়ে যায়।
দয়ার জবাব নিষ্ঠুরতায় দেওয়া কঠিন।
অপ্রত্যাশিত ঘটনা ঘটার ঠিক সময়ে পৌঁছানো।
আদর্শটি না থাকলে পরের সেরা বিকল্প নিন।
অন্যের জিনিস প্রায়ই বেশি ভালো দেখায়।
হারানো সুযোগ পরে আরও বড় মনে হয়।
প্রথম লক্ষণ ভবিষ্যতের সম্ভাবনা দেখাতে পারে।
এটি সহজ ও নিশ্চিত কাজ।
অতিরিক্ত খরচ মূল মূল্যের চেয়ে বেড়ে যায়।
কেউ ক্ষতি করে পরে সাহায্যের ভান করে।
অনেক নেতা কাজকে ভুল পথে নিতে পারে।
এক সমস্যার পর আরেক সমস্যা আসে।
এটি পুরো বিষয়ের অতি ক্ষুদ্র অংশ।
ফল তার কারণ অনুযায়ী আসে।
বড় কাজ এক চেষ্টায় শেষ হয় না।
দেওয়া আন্তরিকতা আন্তরিকতা ফিরিয়ে আনে।
ছোট অন্যায় বড় অন্যায়ে পরিণত হতে পারে।
কথা খুব দূরে ও দ্রুত ছড়ায়।
যেমন বুনবেন তেমনই কাটবেন।
ব্যর্থতা চেষ্টা শেষ করে না, শেখা শুরু করে।
নিয়মিততা প্রতিভার চেয়ে শক্তিশালী হতে পারে।
আজকের ছোট পদক্ষেপ আগামী দিনের পথ গড়ে।
নির্ভুলতা অভ্যাস হলে গতি নিজে আসে।
যা জানেন না তা জিজ্ঞেস করেই উন্নতি শুরু।
বিশ্রাম নেওয়া হাল ছাড়া নয়।
অনুপ্রেরণা রাখতে ছোট জয় লিখে রাখুন।
অতীতের নিজের সঙ্গে অগ্রগতি মাপুন।
নিখুঁত সময়ের অপেক্ষা না করে শুরু করুন।
সঠিক দিকে স্থির গতি গন্তব্যে পৌঁছায়।
দশ মিনিট মনোযোগ এক ঘণ্টা অমনোযোগের চেয়ে ভালো।
ব্যবহার করলেই জ্ঞান আপনার হয়।
ভালো প্রশ্ন ভালো উত্তরের চেয়ে বেশি দিন থাকতে পারে।
লিখিত নথি স্মৃতির চেয়ে বেশি দিন থাকে।
সংশোধিত ভুল স্মৃতিকে আরও স্পষ্ট করে।
কঠিন দিনেও এক লাইন লেখা যায়।
প্রত্যেকে ভিন্ন গতিতে শেখে।
ছোট ভালো কথা দীর্ঘস্থায়ী ছাপ ফেলতে পারে।
শুনুন, পুনরাবৃত্তি করুন এবং নিজে লিখুন।
দৈনিক অনুশীলন অপরিচিত অক্ষরকে বন্ধু বানায়।
`),
  ta: lines(`
அன்பான சொற்கள் அன்பான சொற்களை வரவழைக்கும்.
சிறிய மாற்றங்கள் அறியாமலே சேர்கின்றன.
உங்கள் எளிய தொடக்கத்தை மறக்காதீர்கள்.
வலியவர்கள் சண்டையிடும்போது எளியவர்கள் பாதிக்கப்படலாம்.
துன்பத்திற்குப் பிறகு மகிழ்ச்சி வரும்.
கவனமான முயற்சி நீடித்த பலனை உருவாக்கும்.
செயலால் திறமை மதிப்பைப் பெறுகிறது.
விரும்பத்தக்க ஆனால் அடைய முடியாத ஒன்று.
உணவுக்குப் பிறகு அழகிய காட்சியும் சிறப்பாக இருக்கும்.
அவசரம் அதிகமானால் கவனம் அதிகமாக வேண்டும்.
தனிப்பட்ட பேச்சும் கேட்கப்படலாம்; கவனமாக இருங்கள்.
முதலில் என் சொந்த சிக்கல்களை கவனிக்க வேண்டும்.
இது மிகவும் எளிது.
உச்சத்தை அடைந்த பின் அனைத்தும் குறையும்.
இது கிட்டத்தட்ட சமமானவர்களின் ஒப்பீடு.
செயலுக்கு முன் உறுதியானதையும் சரிபாருங்கள்.
மிக அருகிலிருப்பதையே கவனிப்பது கடினமாகலாம்.
சிந்தித்த ஒரு சொல் பெரிய சிக்கலைத் தீர்க்கலாம்.
வேறு பாதைகள் ஒரே இலக்கை அடையலாம்.
நம்பிக்கை வைத்த இடத்திலிருந்தே துரோகம் வரலாம்.
இலகு வேலையும் சேர்ந்து செய்தால் எளிது.
நல்ல விளக்கம் நல்ல உள்ளடக்கத்தின் மதிப்பை உயர்த்தும்.
துன்பம் ஒன்றை மேலும் வலுப்படுத்தலாம்.
வெற்றுப் பாத்திரமே அதிக ஒலி செய்யும்.
நீண்ட பழக்கம் இயல்பாக கற்றலுக்கு வழி செய்கிறது.
இளமையில் உருவான பழக்கம் வாழ்நாள் முழுதும் நீடிக்கும்.
சேதம் ஏற்பட்ட பின் சரிசெய்வது.
நல்ல தொடக்கம் பாதி வேலை.
தெரிந்த பாதையிலும் கேட்டு உறுதி செய்யுங்கள்.
காரணமில்லாமல் புகை வராது.
விடாமுயற்சி கடின வேலையை வெல்லும்.
உடை தோற்றத்தை மாற்றலாம்.
குறுகிய பார்வை தன் எல்லையையே உலகம் என நினைக்கும்.
நிபுணர்களும் தவறு செய்கிறார்கள்.
நல்ல தலைமை மற்றவர்களுக்கு வழி காட்டும்.
சிறிய உடலில் பெரிய வலிமை இருக்கலாம்.
கோபத்தை தவறானவரிடம் காட்டாதீர்கள்.
அமைதியானவரும் மிகுந்த அழுத்தத்தில் எதிர்ப்பார்.
நீண்ட பயணம் ஒரு அடியிலிருந்து தொடங்கும்.
சிறிய பலன்கள் சேர்ந்து பெரியதாகும்.
இது கிட்டத்தட்ட முடியாத அளவு கடினம்.
அனுபவமின்மை ஆபத்தை அறியத் தடுக்கும்.
ஒருவரைப் பற்றி பேசினால் அவர் தோன்றலாம்.
கவனிக்காத சிறிய சிக்கல் பெரிதாகும்.
அன்புக்கு கொடுமையால் பதிலளிப்பது கடினம்.
எதிர்பாராத ஒன்று நடக்கும் நேரத்தில் வந்து சேர்வது.
சிறந்தது இல்லையெனில் அடுத்த நல்ல மாற்றை பயன்படுத்துங்கள்.
பிறருடையது பெரும்பாலும் சிறப்பாகத் தெரியும்.
தவறவிட்ட வாய்ப்பு பின்னர் பெரிதாகத் தெரியும்.
ஆரம்ப அறிகுறிகள் எதிர்கால திறனை காட்டும்.
இது எளிய, உறுதியான வேலை.
கூடுதல் செலவு முதன்மை மதிப்பை மீறும்.
ஒருவர் தீங்கு செய்து பின்னர் உதவுவது போல் நடிக்கிறார்.
அதிக தலைவர்கள் வேலையை வழிதவறச் செய்யலாம்.
ஒரு துன்பத்தை அடுத்து இன்னொன்று வரும்.
இது முழுமையின் மிகச் சிறிய பகுதி.
விளைவு அதன் காரணத்திலிருந்து வருகிறது.
பெரிய வேலை ஒரே முயற்சியில் முடியாது.
கொடுத்த அன்பு அன்பைத் திருப்பி தரும்.
சிறிய தவறு பெரிய தவறாக வளரலாம்.
சொற்கள் மிகத் தொலைவுக்கும் வேகமாகவும் பரவும்.
விதைத்ததை அறுவடை செய்வீர்கள்.
தோல்வி முயற்சியை முடிக்காது; கற்றலைத் தொடங்கும்.
தொடர்ச்சி திறமையை விட வலிமையாகலாம்.
இன்றைய சிறிய அடி நாளைய பாதையை உருவாக்கும்.
துல்லியம் பழக்கமானால் வேகம் பின்தொடரும்.
தெரியாததை கேட்பதில் வளர்ச்சி தொடங்கும்.
ஓய்வெடுப்பது கைவிடுவது அல்ல.
ஊக்கத்தை காக்க சிறிய வெற்றிகளை பதிவு செய்யுங்கள்.
கடந்த கால உங்களுடன் முன்னேற்றத்தை அளவிடுங்கள்.
சரியான நேரத்திற்காக காத்திராமல் தொடங்குங்கள்.
சரியான திசையில் நிலையான வேகம் இலக்கை அடையும்.
பத்து நிமிட கவனம் சிதறிய ஒரு மணிநேரத்தை விட சிறந்தது.
பயன்படுத்தும்போது அறிவு உங்களுடையதாகும்.
நல்ல கேள்வி நல்ல பதிலை விட நீண்ட காலம் நிலைக்கலாம்.
பதிவு நினைவை விட நீண்ட காலம் இருக்கும்.
திருத்திய தவறுகள் தெளிவான நினைவை உருவாக்கும்.
கடின நாளிலும் ஒரு வரி எழுதலாம்.
ஒவ்வொருவரும் வேறு வேகத்தில் கற்கிறார்கள்.
சிறிய அன்பான சொல் நீண்ட தாக்கத்தை விடலாம்.
கேளுங்கள், மீண்டும் சொல்லுங்கள், நீங்களே எழுதுங்கள்.
தினசரி பயிற்சி அறியாத எழுத்துகளை நண்பர்களாக்கும்.
`),
  si: lines(`
කාරුණික වචන කාරුණික වචන කැඳවයි.
කුඩා වෙනස්කම් නොදැනීම එකතු වේ.
ඔබේ සරල ආරම්භය අමතක නොකරන්න.
බලවතුන් සටන් කරන විට දුර්වලයන්ට හානි විය හැක.
දුෂ්කරතාවයෙන් පසු සතුට පැමිණේ.
සැලකිලිමත් උත්සාහය දිගුකාලීන ප්‍රතිඵල ගොඩනගයි.
හැකියාව ක්‍රියාවෙන් වටිනාකම ලබයි.
කැමති නමුත් ළඟා විය නොහැකි දෙයක්.
ලස්සන දසුනක් පවා ආහාරයෙන් පසු වඩා රසවත්ය.
වැඩේ හදිසි වන තරමට වඩාත් සැලකිලිමත් විය යුතුය.
පෞද්ගලික වචනද ඇසිය හැකි නිසා ප්‍රවේශම් වන්න.
මුලින් මගේම ගැටලු ගැන සැලකිලිමත් විය යුතුය.
මෙය ඉතා පහසුය.
උච්චයට පැමිණි පසු සියල්ල පහළ යයි.
මෙය සමාන තත්ත්වයේ අය අතර සැසඳීමකි.
ක්‍රියා කිරීමට පෙර නිශ්චිත දේද පරීක්ෂා කරන්න.
ළඟම තිබෙන දේම හඳුනාගැනීමට අපහසු විය හැක.
සැලකිලිමත් වචනයක් විශාල ගැටලුවක් විසඳිය හැක.
වෙනස් මාර්ග එකම ඉලක්කයට යා හැක.
පාවාදීම බොහෝ විට විශ්වාස කළ තැනින්ම පැමිණේ.
සැහැල්ලු වැඩක් පවා එකට කළ විට පහසුය.
හොඳ ඉදිරිපත් කිරීම හොඳ අන්තර්ගතයට වටිනාකම එක් කරයි.
දුෂ්කරතා දේවල් ශක්තිමත් කළ හැක.
හිස් බඳුන් වැඩිපුරම ශබ්ද කරයි.
දිගුකාලීන සම්බන්ධය ස්වභාවිකව ඉගෙනීමට ගෙන යයි.
ළමා වියේ පුරුදු ජීවිත කාලය පුරා පවතී.
හානිය වූ පසු පමණක් අලුත්වැඩියා කිරීම.
හොඳ ආරම්භයක් වැඩෙන් අඩකි.
හුරු මාර්ගයකදීද අසා පරීක්ෂා කරන්න.
හේතුවක් නැතිව දුමක් නැත.
අඛණ්ඩ උත්සාහයෙන් දුෂ්කර වැඩ ජය ගත හැක.
ඇඳුමෙන් හැඟීම වෙනස් කළ හැක.
පටු දැක්ම තම සීමාවම මුළු ලෝකය ලෙස සිතයි.
විශේෂඥයන්ද වැරදි කරති.
හොඳ නායකත්වය අනෙක් අයට ආදර්ශයක් තබයි.
කුඩා ප්‍රමාණයක් විශාල බලයක් සඟවා තිබිය හැක.
කෝපය වැරදි පුද්ගලයා මත නොදමන්න.
නිහතමානී අයද වැඩිපුර පීඩනය කළ විට ප්‍රතිරෝධය දක්වති.
දිගු ගමනක් එක් පියවරකින් ආරම්භ වේ.
කුඩා ජයග්‍රහණ එකතු වී විශාල දෙයක් වේ.
මෙය කළ නොහැකි තරම් දුෂ්කරය.
අත්දැකීම් හිඟය අනතුර හඳුනාගැනීම වළක්වයි.
යමෙකු ගැන කතා කළ විට ඔහු පැමිණිය හැක.
නොසලකා හැරූ කුඩා ගැටලුව විශාල වේ.
කාරුණිකත්වයට කෲරත්වයෙන් පිළිතුරු දීම අපහසුය.
අනපේක්ෂිත සිදුවීමක් වන වේලාවටම පැමිණීම.
සුදුසුම දේ නැත්නම් ඊළඟ හොඳම විකල්පය ගන්න.
අන් අය සතු දේ වඩා හොඳ ලෙස පෙනේ.
අහිමි වූ අවස්ථාව පසුව වඩා විශාල ලෙස පෙනේ.
මුල් ලකුණු අනාගත හැකියාව පෙන්වයි.
මෙය පහසු සහ නිශ්චිත වැඩකි.
අමතර වියදම ප්‍රධාන වටිනාකම ඉක්මවයි.
යමෙක් හානි කර පසුව උදව් කරන ලෙස හැසිරෙයි.
නායකයන් වැඩි වූ විට වැඩේ මඟ හැරිය හැක.
එක් දුෂ්කරතාවයකට පසු තවත් එකක් පැමිණේ.
මෙය සමස්තයෙන් ඉතා කුඩා කොටසකි.
ප්‍රතිඵල ඒවායේ හේතු අනුව පැමිණේ.
විශාල වැඩක් එක් උත්සාහයකින් අවසන් නොවේ.
දුන් උණුසුම නැවත උණුසුම ගෙන එයි.
කුඩා වැරැද්ද විශාල වරදක් විය හැක.
වචන ඉතා දුරට හා වේගයෙන් පැතිරේ.
වපුරන දේම නෙළාගනී.
අසාර්ථකත්වය උත්සාහය අවසන් නොකර ඉගෙනීම ආරම්භ කරයි.
අඛණ්ඩතාව දක්ෂතාවයට වඩා බලවත් විය හැක.
අද කුඩා පියවර හෙට මාර්ගය සාදයි.
නිවැරදි බව පුරුද්දක් වූ විට වේගය පැමිණේ.
නොදන්නා දේ ඇසීමෙන් වර්ධනය ආරම්භ වේ.
විවේක ගැනීම අත්හැරීම නොවේ.
උනන්දුව රැකීමට කුඩා ජයග්‍රහණ සටහන් කරන්න.
පසුගිය ඔබ සමඟ ප්‍රගතිය මැන බලන්න.
පරිපූර්ණ මොහොත බලා නොසිට ආරම්භ කරන්න.
නිවැරදි දිශාවේ ස්ථාවර ගමන ඉලක්කයට ළඟා වේ.
අවධානයේ මිනිත්තු දහයක් විසිරුණු පැයකට වඩා හොඳය.
දැනුම භාවිත කළ විට ඔබේ වේ.
හොඳ ප්‍රශ්නයක් හොඳ පිළිතුරකට වඩා දිගු කාලයක් පවතී.
සටහන මතකයට වඩා දිගු කාලයක් පවතී.
නිවැරදි කළ වැරදි පැහැදිලි මතකයක් ගොඩනගයි.
දුෂ්කර දිනකදීද එක් පේළියක් ලිවිය හැක.
සෑම කෙනෙකුම වෙනස් වේගයකින් ඉගෙන ගනී.
කෙටි කාරුණික වචනයක් දිගු සලකුණක් තැබිය හැක.
අසන්න, නැවත කියන්න, ඔබම ලියන්න.
දිනපතා පුහුණුව නුහුරු අකුරු මිතුරන් කරයි.
`),
  kk: lines(`
Жылы сөз жылы сөзді шақырады.
Кішкентай өзгерістер байқалмай жиналады.
Қарапайым бастауыңды ұмытпа.
Күштілер шайқасқанда әлсіздер зардап шегуі мүмкін.
Қиындықтан кейін қуаныш келеді.
Ұқыпты еңбек тұрақты нәтиже береді.
Мүмкіндік әрекет арқылы құнды болады.
Қалаулы, бірақ қол жетпейтін нәрсе.
Әдемі көрініс те тамақтан кейін жақсырақ.
Іс неғұрлым шұғыл болса, соғұрлым сақ қимылдау керек.
Жеке сөзді біреу естуі мүмкін, сондықтан абай бол.
Алдымен өз мәселелеріме көңіл бөлуім керек.
Бұл өте оңай.
Шыңына жеткен соң бәрі бәсеңдейді.
Бұл шамалас адамдарды салыстыру.
Әрекетке дейін анық көрінгенді де тексер.
Ең жақын нәрсені байқау кейде қиын.
Ойлы сөз үлкен мәселені шеше алады.
Әртүрлі жол бір мақсатқа жеткізе алады.
Сатқындық көбіне сенім артқан жерден келеді.
Жеңіл жұмыс та бірге істесе оңай.
Жақсы ұсыну жақсы мазмұнды күшейтеді.
Қиындық нәрсені мықты ете алады.
Бос ыдыс қатты дыбыс шығарады.
Ұзақ араласу табиғи түрде үйретеді.
Ерте қалыптасқан әдет өмір бойы қалады.
Зиян болғаннан кейін ғана жөндеу.
Жақсы бастау — жұмыстың жартысы.
Таныс жолда да сұрап, тексер.
Себепсіз түтін болмайды.
Табандылық қиын істі жеңеді.
Киім адамның әсерін өзгерте алады.
Тар көзқарас өз шегін бүкіл әлем деп ойлайды.
Мамандар да қателеседі.
Жақсы басшылық өзгелерге бағыт береді.
Кішкентай өлшем үлкен күшті жасыруы мүмкін.
Ашуыңды кінәсіз адамнан алма.
Момын адам да қатты қысымда қарсы тұрады.
Ұзақ сапар бір қадамнан басталады.
Кішкентай табыстар жиналып, үлкенге айналады.
Бұл мүмкін еместей қиын.
Тәжірибесіздік қауіпті байқатпауы мүмкін.
Біреуді айтсаң, ол пайда болуы мүмкін.
Еленбеген кішкентай мәселе үлкейеді.
Жақсылыққа қатігездікпен жауап беру қиын.
Күтпеген оқиға болған сәтте тап болу.
Мінсізі болмаса, келесі жақсы нұсқаны таңда.
Өзгенікі жиі жақсырақ көрінеді.
Жоғалған мүмкіндік кейін үлкен көрінеді.
Алғашқы белгілер болашақ мүмкіндікті көрсетеді.
Бұл оңай әрі анық жұмыс.
Қосымша шығын негізгі құннан асып кетеді.
Біреу зиян келтіріп, кейін көмектескендей болады.
Басшы көп болса, жұмыс жолдан адасады.
Бір қиындықтан кейін екіншісі келеді.
Бұл бүтіннің өте кішкентай бөлігі.
Нәтиже өз себебінен туады.
Үлкен жұмыс бір талпыныста бітпейді.
Берілген жылылық жылылықты қайтарады.
Кішкентай теріс іс үлкенге айналуы мүмкін.
Сөз алысқа әрі тез таралады.
Не ексең, соны орасың.
Сәтсіздік еңбекті тоқтатпай, оқуды бастайды.
Тұрақтылық таланттан да күшті болуы мүмкін.
Бүгінгі кіші қадам ертеңгі жолды жасайды.
Дәлдік әдетке айналса, жылдамдық келеді.
Өсу білмегеніңді сұраудан басталады.
Демалу — бас тарту емес.
Ынтаны сақтау үшін шағын жеңістерді жаз.
Өсуіңді бұрынғы өзіңмен салыстыр.
Мінсіз сәтті күтпей, баста.
Дұрыс бағыттағы тұрақты жүріс мақсатқа жеткізеді.
Он минут зейін бір сағат алаңдаудан жақсы.
Білім қолданғанда сенікі болады.
Жақсы сұрақ жақсы жауаптан ұзақ қалуы мүмкін.
Жазба жадтан ұзақ сақталады.
Түзетілген қате жадты айқындайды.
Қиын күнде де бір жол жазуға болады.
Әр адам әртүрлі жылдамдықпен үйренеді.
Қысқа жылы сөз ұзақ із қалдырады.
Тыңда, қайтала және өзің жаз.
Күнделікті жаттығу бейтаныс әріпті дос етеді.
`),
  uz: lines(`
Yaxshi so‘zlar yaxshi so‘zlarni chorlaydi.
Kichik o‘zgarishlar sezilmay yig‘iladi.
Kamtarona boshlagan paytingizni unutmang.
Kuchlilar kurashsa, kuchsizlar zarar ko‘rishi mumkin.
Qiyinchilikdan keyin quvonch keladi.
Puxta mehnat uzoq natija beradi.
Imkoniyat harakat orqali qadrli bo‘ladi.
Istalgan, ammo erishib bo‘lmaydigan narsa.
Go‘zal manzara ham ovqatdan keyin yaxshiroq.
Ish qanchalik shoshilinch bo‘lsa, shunchalik ehtiyot bo‘ling.
Shaxsiy gap ham eshitilishi mumkin, ehtiyot bo‘ling.
Avval o‘z muammolarimga e’tibor berishim kerak.
Bu juda oson.
Cho‘qqiga chiqqach, hamma narsa pasayadi.
Bu deyarli teng odamlarni solishtirish.
Ishdan oldin aniq ko‘ringan narsani ham tekshiring.
Eng yaqin narsani ko‘rish ba’zan qiyin.
O‘ylangan bir so‘z katta muammoni hal qiladi.
Turli yo‘llar bir maqsadga olib boradi.
Xiyonat ko‘pincha ishonch qo‘yilgan joydan keladi.
Yengil ish ham birga osonroq.
Yaxshi taqdimot yaxshi mazmunni kuchaytiradi.
Qiyinchilik narsalarni mustahkam qiladi.
Bo‘sh idish eng ko‘p shovqin qiladi.
Uzoq tanishlik tabiiy ravishda o‘rgatadi.
Yoshlikdagi odat umr bo‘yi qoladi.
Zarar bo‘lgandan keyin tuzatish.
Yaxshi boshlanish ishning yarmi.
Tanish yo‘lda ham so‘rang va tekshiring.
Sababsiz tutun bo‘lmaydi.
Qat’iyat qiyin vazifani yengadi.
Kiyim taassurotni o‘zgartiradi.
Tor qarash o‘z chegarasini butun dunyo deb biladi.
Mutaxassislar ham xato qiladi.
Yaxshi rahbarlik boshqalarga yo‘l ko‘rsatadi.
Kichik o‘lcham katta kuchni yashirishi mumkin.
Jahlingizni noto‘g‘ri odamdan olmang.
Yuvosh odam ham ortiqcha bosimda qarshilik qiladi.
Uzoq yo‘l bir qadamdan boshlanadi.
Kichik yutuqlar yig‘ilib kattalashadi.
Bu deyarli imkonsiz darajada qiyin.
Tajribasizlik xavfni ko‘rishga to‘sqinlik qiladi.
Birovni tilga olsangiz, u paydo bo‘lishi mumkin.
E’tiborsiz qolgan kichik muammo kattalashadi.
Yaxshilikka yomonlik bilan javob berish qiyin.
Kutilmagan voqea vaqtida aynan yetib kelish.
Mukammali bo‘lmasa, keyingi yaxshi variantni tanlang.
Boshqalarning narsasi ko‘pincha yaxshiroq ko‘rinadi.
Qo‘ldan ketgan imkoniyat keyin kattaroq ko‘rinadi.
Ilk belgilar kelajak imkoniyatini ko‘rsatadi.
Bu oson va aniq ish.
Qo‘shimcha xarajat asosiy qiymatdan oshadi.
Kimdir zarar yetkazib, keyin yordamchi bo‘lib ko‘rinadi.
Rahbar ko‘p bo‘lsa, ish yo‘ldan chiqadi.
Bir qiyinchilikdan keyin boshqasi keladi.
Bu butunning juda kichik qismi.
Natija o‘z sababidan keladi.
Katta ish bir urinishda bitmaydi.
Berilgan mehr mehrni qaytaradi.
Kichik yomonlik katta xatoga aylanishi mumkin.
So‘z juda uzoq va tez tarqaladi.
Nima eksangiz, shuni o‘rasiz.
Muvaffaqiyatsizlik mehnatni tugatmaydi, o‘qishni boshlaydi.
Izchillik iste’doddan kuchli bo‘lishi mumkin.
Bugungi kichik qadam ertangi yo‘lni yaratadi.
Aniqlik odat bo‘lsa, tezlik keladi.
O‘sish bilmaganingizni so‘rashdan boshlanadi.
Dam olish taslim bo‘lish emas.
Rag‘batni saqlash uchun kichik yutuqlarni yozing.
O‘sishingizni avvalgi o‘zingiz bilan o‘lchang.
Mukammal paytni kutmay, boshlang.
To‘g‘ri yo‘nalishdagi barqaror yurish manzilga yetadi.
O‘n daqiqa diqqat bir soat chalg‘ishdan yaxshi.
Bilim ishlatilganda sizniki bo‘ladi.
Yaxshi savol yaxshi javobdan uzoqroq yashaydi.
Yozuv xotiradan uzoqroq saqlanadi.
Tuzatilgan xatolar xotirani ravshan qiladi.
Qiyin kunda ham bir satr yozish mumkin.
Har kim turli tezlikda o‘rganadi.
Qisqa yaxshi so‘z uzoq iz qoldiradi.
Tinglang, takrorlang va o‘zingiz yozing.
Kundalik mashq notanish harflarni do‘st qiladi.
`),
  mn: lines(`
Эелдэг үг эелдэг үгийг дууддаг.
Жижиг өөрчлөлтүүд анзаарахаас өмнө хуримтлагдана.
Даруухан эхлэлээ бүү март.
Хүчтэнүүд тэмцэхэд сул дорой нь хохирч болно.
Бэрхшээлийн дараа баяр ирдэг.
Нямбай хичээл зүтгэл тогтвортой үр дүн бүтээнэ.
Боломж үйлдлээр үнэ цэнтэй болдог.
Хүсүүштэй боловч хүршгүй зүйл.
Сайхан үзэмж ч хоолны дараа илүү сайхан.
Хэчнээн яаралтай байна, төдий чинээ болгоомжтой яв.
Нууц үгийг ч хүн сонсож болох тул анхаар.
Эхлээд өөрийн асуудалд анхаарах хэрэгтэй.
Энэ маш амархан.
Оргилдоо хүрсний дараа бүх зүйл буурдаг.
Энэ нь бараг тэнцүү хүмүүсийн харьцуулалт.
Үйлдэхийн өмнө тодорхой зүйлийг ч шалга.
Хамгийн ойрын зүйл хамгийн хэцүү анзаарагдаж болно.
Бодолтой нэг үг том асуудлыг шийдэж чадна.
Өөр замууд нэг зорилгод хүрч чадна.
Урвалт итгэл тавьсан газраас ирэх нь олон.
Хөнгөн ажил ч хамтдаа илүү амар.
Сайн үзүүлэлт сайн агуулгыг улам үнэтэй болгоно.
Бэрхшээл зүйлсийг илүү бат бөх болгож чадна.
Хоосон сав хамгийн их дуу гаргана.
Удаан харьцах нь аяндаа сурахад хүргэнэ.
Багадаа тогтсон зуршил насан турш үргэлжилнэ.
Хохирол гарсны дараа засах.
Сайн эхлэл ажлын тал.
Танил замд ч асууж шалга.
Шалтгаангүй утаа гарахгүй.
Тэвчээр хэцүү даалгаврыг давна.
Хувцас сэтгэгдлийг өөрчилж чадна.
Явцуу үзэл өөрийн хязгаарыг бүх дэлхий гэж боддог.
Мэргэжилтэн ч алдаа гаргана.
Сайн манлайлал бусдад өнгө аясыг тогтооно.
Жижиг биед их хүч нуугдаж болно.
Уураа буруу хүн дээр бүү гарга.
Номхон хүн ч хэт шахвал эсэргүүцнэ.
Урт аялал нэг алхмаас эхэлнэ.
Жижиг ололт хуримтлагдаж том болно.
Энэ бараг боломжгүй хэцүү.
Туршлагагүй байдал аюулыг танихад саад болно.
Хэн нэгнийг яривал тэр гарч ирж магадгүй.
Үл тоосон жижиг асуудал томордог.
Сайхан сэтгэлд харгис хариулах хэцүү.
Гэнэтийн зүйл болох яг үед хүрч ирэх.
Төгс зүйл байхгүй бол дараагийн сайн сонголтыг ашигла.
Бусдын зүйл ихэвчлэн илүү сайхан харагддаг.
Алдсан боломж дараа нь илүү том санагдана.
Эхний шинж тэмдэг ирээдүйн боломжийг харуулдаг.
Энэ амар бөгөөд найдвартай ажил.
Нэмэлт зардал үндсэн үнээс давна.
Хэн нэгэн хохироогоод дараа нь тусалж буй мэт дүр эсгэнэ.
Удирдагч хэт олон бол ажил замаасаа гарна.
Нэг бэрхшээлийн дараа нөгөө нь ирнэ.
Энэ бол бүхэл зүйлийн өчүүхэн хэсэг.
Үр дүн шалтгаанаасаа гарна.
Том ажил нэг оролдлогоор дуусахгүй.
Өгсөн халуун сэтгэл халуун сэтгэлийг буцаана.
Жижиг буруу үйлдэл том буруу болж өсөж болно.
Үг маш хол, хурдан тардаг.
Юу тарина, түүнийгээ хураана.
Бүтэлгүйтэл хичээл зүтгэлийг дуусгахгүй, суралцахыг эхлүүлнэ.
Тогтвортой байдал авьяасаас хүчтэй болж чадна.
Өнөөдрийн жижиг алхам маргаашийн замыг бүтээнэ.
Нарийвчлал зуршил болвол хурд дагана.
Өсөлт мэдэхгүй зүйлээ асуухаас эхэлнэ.
Амрах нь бууж өгөх биш.
Урам зоригоо хадгалахын тулд жижиг ялалтаа тэмдэглэ.
Ахиц дэвшлээ өмнөх өөртэйгөө харьцуул.
Төгс мөчийг хүлээлгүй эхэл.
Зөв чигийн тогтвортой алхам зорилгод хүрнэ.
Арван минутын төвлөрөл сарнисан нэг цагаас дээр.
Мэдлэгийг ашиглахад таных болно.
Сайн асуулт сайн хариултаас урт үлдэж чадна.
Бичлэг ой санамжаас удаан хадгалагдана.
Зассан алдаа ойг илүү тод болгоно.
Хэцүү өдөр ч нэг мөр бичиж болно.
Хүн бүр өөр хурдаар сурдаг.
Богино эелдэг үг удаан мөр үлдээж чадна.
Сонс, давт, өөрөө бич.
Өдөр тутмын дасгал танихгүй үсгийг найз болгоно.
`),
  my: lines(`
နူးညံ့သောစကားက နူးညံ့သောစကားကို ပြန်ခေါ်လာသည်။
သေးငယ်သောပြောင်းလဲမှုများကို မသိမီ စုပုံလာသည်။
မိမိ၏ ရိုးရှင်းသောအစကို မမေ့ပါနှင့်။
အားကြီးသူများ တိုက်ခိုက်လျှင် အားနည်းသူများ ထိခိုက်နိုင်သည်။
အခက်အခဲနောက်တွင် ပျော်ရွှင်မှုလာသည်။
ဂရုတစိုက်ကြိုးစားမှုက ရေရှည်ရလဒ်တည်ဆောက်သည်။
အလားအလာသည် လုပ်ဆောင်မှုဖြင့် တန်ဖိုးရှိလာသည်။
လိုချင်သော်လည်း မရနိုင်သောအရာ။
လှပသောရှုခင်းပင် အစာစားပြီးမှ ပိုကောင်းသည်။
ပိုအရေးကြီးလေလေ ပိုဂရုစိုက်ရလေလေဖြစ်သည်။
ကိုယ်ရေးစကားကိုလည်း ကြားနိုင်သဖြင့် သတိထားပါ။
ပထမ မိမိပြဿနာကို ဂရုစိုက်ရမည်။
ဤအရာသည် အလွန်လွယ်ကူသည်။
ထိပ်ဆုံးရောက်ပြီးနောက် အရာအားလုံး လျော့ကျသည်။
အဆင့်တူနီးပါးသူများကို နှိုင်းယှဉ်ခြင်းဖြစ်သည်။
မလုပ်မီ သေချာသည့်အရာကိုလည်း စစ်ဆေးပါ။
အနီးဆုံးအရာကိုပင် သတိပြုရန် ခက်နိုင်သည်။
စဉ်းစားပြောသော စကားတစ်ခွန်းက ပြဿနာကြီးကို ဖြေရှင်းနိုင်သည်။
မတူသောလမ်းများက တူညီသောရည်မှန်းချက်သို့ ရောက်နိုင်သည်။
သစ္စာဖောက်မှုသည် ယုံကြည်ရာနေရာမှ လာတတ်သည်။
ပေါ့ပါးသောအလုပ်ပင် အတူလုပ်လျှင် ပိုလွယ်သည်။
ကောင်းသောတင်ပြမှုက ကောင်းသောအကြောင်းအရာကို တန်ဖိုးတိုးစေသည်။
အခက်အခဲက အရာများကို ပိုခိုင်မာစေနိုင်သည်။
ဗလာအိုးသည် အသံအကျယ်ဆုံးဖြစ်သည်။
ကြာရှည်ထိတွေ့မှုက သဘာဝအတိုင်း သင်ယူစေသည်။
ငယ်စဉ်အလေ့အထသည် တစ်သက်လုံးတည်သည်။
ပျက်စီးပြီးမှ ပြန်ပြင်ခြင်း။
ကောင်းသောအစသည် အလုပ်၏တစ်ဝက်ဖြစ်သည်။
ရင်းနှီးသောလမ်းတွင်လည်း မေးပြီးစစ်ဆေးပါ။
အကြောင်းမရှိဘဲ မီးခိုးမထွက်ပါ။
စွဲမြဲမှုက ခက်သောအလုပ်ကို ကျော်နိုင်သည်။
အဝတ်အစားက ထင်မြင်ချက်ကို ပြောင်းနိုင်သည်။
ကျဉ်းသောအမြင်က မိမိနယ်နိမိတ်ကို ကမ္ဘာဟုထင်သည်။
ကျွမ်းကျင်သူများလည်း အမှားလုပ်ကြသည်။
ကောင်းသောခေါင်းဆောင်မှုက အခြားသူများအတွက် လမ်းပြသည်။
သေးငယ်သောကိုယ်ထည်တွင် ကြီးမားသောစွမ်းအား ရှိနိုင်သည်။
ဒေါသကို လူမှားပေါ် မပုံချပါနှင့်။
နူးညံ့သူပင် အလွန်ဖိနှိပ်လျှင် ပြန်တုံ့ပြန်သည်။
ခရီးရှည်သည် ခြေလှမ်းတစ်လှမ်းမှ စသည်။
သေးငယ်သောအောင်မြင်မှုများ စုပုံ၍ ကြီးမားလာသည်။
ဤအရာသည် မဖြစ်နိုင်သလောက် ခက်သည်။
အတွေ့အကြုံနည်းလျှင် အန္တရာယ်ကို မမြင်နိုင်ပါ။
တစ်ယောက်အကြောင်းပြောလျှင် ထိုသူ ပေါ်လာနိုင်သည်။
လျစ်လျူရှုသော ပြဿနာငယ်သည် ကြီးလာသည်။
ကြင်နာမှုကို ရက်စက်မှုဖြင့် ပြန်ဆိုရန် ခက်သည်။
မမျှော်လင့်သောအဖြစ် ဖြစ်ချိန်တည့်တည့် ရောက်လာခြင်း။
အကောင်းဆုံးမရှိလျှင် နောက်အကောင်းဆုံးကို သုံးပါ။
သူများပိုင်ဆိုင်ရာသည် ပိုကောင်းသလို မြင်ရတတ်သည်။
လွတ်သွားသောအခွင့်အရေးသည် နောက်မှ ပိုကြီးသလိုထင်သည်။
အစလက္ခဏာများက အနာဂတ်အလားအလာကို ပြနိုင်သည်။
ဤသည် လွယ်ကူပြီး သေချာသောအလုပ်ဖြစ်သည်။
အပိုကုန်ကျစရိတ်က အဓိကတန်ဖိုးထက် ကျော်သည်။
တစ်ယောက်က ထိခိုက်စေပြီး ကူညီသလို ဟန်ဆောင်သည်။
ခေါင်းဆောင်များလွန်းလျှင် အလုပ်လမ်းမှားနိုင်သည်။
အခက်အခဲတစ်ခုပြီးနောက် နောက်တစ်ခုလာသည်။
ဤသည် အားလုံး၏ အလွန်သေးငယ်သောအပိုင်းဖြစ်သည်။
ရလဒ်သည် အကြောင်းရင်းအတိုင်း လာသည်။
အလုပ်ကြီးကို တစ်ကြိမ်တည်း မပြီးနိုင်ပါ။
ပေးသောမေတ္တာက မေတ္တာကို ပြန်ခေါ်လာသည်။
အမှားငယ်က အမှားကြီးဖြစ်လာနိုင်သည်။
စကားသည် အဝေးသို့ အလွန်မြန်စွာ ပျံ့နှံ့သည်။
စိုက်သမျှကို ရိတ်သိမ်းရသည်။
ကျရှုံးမှုက ကြိုးစားမှုကို မပိတ်ဘဲ သင်ယူမှုကို ဖွင့်သည်။
တည်ငြိမ်မှုက ပါရမီထက် ပိုအားကောင်းနိုင်သည်။
ယနေ့ခြေလှမ်းငယ်က မနက်ဖြန်လမ်းကို ဖန်တီးသည်။
တိကျမှု အလေ့အထဖြစ်လျှင် အမြန်နှုန်းလိုက်လာသည်။
မသိသည်ကို မေးခြင်းမှ တိုးတက်မှု စသည်။
အနားယူခြင်းသည် လက်လျှော့ခြင်းမဟုတ်ပါ။
စိတ်အားတည်ရန် အောင်မြင်မှုငယ်များ မှတ်တမ်းတင်ပါ။
တိုးတက်မှုကို မိမိအတိတ်နှင့် နှိုင်းယှဉ်ပါ။
ပြည့်စုံချိန်ကို မစောင့်ဘဲ စတင်ပါ။
မှန်သောလမ်းတွင် တည်ငြိမ်စွာသွားလျှင် ပန်းတိုင်ရောက်သည်။
အာရုံစိုက်သော ဆယ်မိနစ်က စိတ်လွင့်သော တစ်နာရီထက်ကောင်းသည်။
အသုံးပြုမှ အသိပညာသည် မိမိပိုင်ဖြစ်သည်။
မေးခွန်းကောင်းသည် အဖြေကောင်းထက် ပိုကြာနိုင်သည်။
မှတ်တမ်းသည် မှတ်ဉာဏ်ထက် ပိုကြာသည်။
ပြင်ထားသောအမှားများက မှတ်ဉာဏ်ပိုရှင်းစေသည်။
ခက်သောနေ့တွင်လည်း စာတစ်ကြောင်းရေးနိုင်သည်။
လူတိုင်း သင်ယူနှုန်း မတူကြပါ။
နူးညံ့သောစကားတိုက ရေရှည်အမှတ်ထားနိုင်သည်။
နားထောင်၊ ထပ်ပြောပြီး ကိုယ်တိုင်ရေးပါ။
နေ့စဉ်လေ့ကျင့်မှုက မရင်းနှီးသောအက္ခရာကို မိတ်ဆွေဖြစ်စေသည်။
`),
  km: lines(`
ពាក្យសម្តីល្អ នាំមកនូវពាក្យសម្តីល្អ។
ការផ្លាស់ប្តូរតូចៗប្រមូលផ្តុំមុនពេលអ្នកដឹង។
កុំភ្លេចការចាប់ផ្តើមដ៏សាមញ្ញរបស់អ្នក។
អ្នកទន់ខ្សោយអាចរងគ្រោះពេលអ្នកខ្លាំងប្រយុទ្ធគ្នា។
ភាពរីករាយមកបន្ទាប់ពីការលំបាក។
ការខិតខំដោយប្រុងប្រយ័ត្នបង្កើតលទ្ធផលយូរអង្វែង។
សក្តានុពលមានតម្លៃតាមរយៈសកម្មភាព។
អ្វីមួយដែលចង់បាន ប៉ុន្តែមិនអាចឈានដល់។
ទេសភាពស្អាតក៏ល្អជាងបន្ទាប់ពីញ៉ាំអាហារ។
កាន់តែបន្ទាន់ កាន់តែត្រូវប្រុងប្រយ័ត្ន។
ប្រយ័ត្ន ព្រោះពាក្យសម្ងាត់អាចត្រូវគេឮ។
បញ្ហារបស់ខ្ញុំត្រូវការយកចិត្តទុកដាក់មុន។
វាងាយស្រួលខ្លាំងណាស់។
អ្វីៗថយចុះបន្ទាប់ពីឡើងដល់កំពូល។
វាជាការប្រៀបធៀបរវាងអ្នកស្ទើរតែស្មើគ្នា។
ពិនិត្យសូម្បីតែអ្វីដែលមើលទៅប្រាកដមុនធ្វើ។
អ្វីដែលនៅជិតបំផុតអាចពិបាកមើលឃើញ។
ពាក្យគិតល្អមួយអាចដោះស្រាយបញ្ហាធំ។
ផ្លូវខុសគ្នាអាចទៅដល់គោលដៅដូចគ្នា។
ការក្បត់ជាញឹកញាប់មកពីកន្លែងដែលយើងទុកចិត្ត។
ការងារស្រាលក៏ងាយជាងពេលធ្វើជាមួយគ្នា។
ការបង្ហាញល្អបន្ថែមតម្លៃឱ្យខ្លឹមសារល្អ។
ការលំបាកអាចធ្វើឱ្យអ្វីៗរឹងមាំ។
ធុងទទេបង្កើតសំឡេងខ្លាំងបំផុត។
ការស្គាល់យូរនាំទៅកាន់ការរៀនដោយធម្មជាតិ។
ទម្លាប់ពីក្មេងនៅពេញមួយជីវិត។
ជួសជុលបន្ទាប់ពីការខូចខាតកើតរួច។
ការចាប់ផ្តើមល្អគឺពាក់កណ្តាលការងារ។
សួរនិងពិនិត្យសូម្បីតែនៅលើផ្លូវស្គាល់។
គ្មានផ្សែងដោយគ្មានមូលហេតុ។
ការតស៊ូអាចឈ្នះការងារលំបាក។
សម្លៀកបំពាក់អាចផ្លាស់ប្តូរចំណាប់អារម្មណ៍។
ទស្សនៈចង្អៀតគិតថាព្រំដែនខ្លួនជាពិភពទាំងមូល។
អ្នកជំនាញក៏ធ្វើខុសដែរ។
ការដឹកនាំល្អកំណត់គំរូឱ្យអ្នកដទៃ។
ទំហំតូចអាចលាក់កម្លាំងធំ។
កុំបញ្ចេញកំហឹងលើមនុស្សខុស។
សូម្បីតែអ្នកស្លូតក៏តបតពេលត្រូវសង្កត់ខ្លាំង។
ដំណើរវែងចាប់ផ្តើមពីមួយជំហាន។
ផលតូចៗប្រមូលផ្តុំក្លាយជាធំ។
វាពិបាកស្ទើរតែមិនអាចធ្វើបាន។
ខ្វះបទពិសោធន៍អាចធ្វើឱ្យមិនឃើញគ្រោះថ្នាក់។
និយាយពីនរណាម្នាក់ ហើយគេអាចបង្ហាញខ្លួន។
បញ្ហាតូចដែលមិនអើពើនឹងក្លាយជាធំ។
ពិបាកឆ្លើយតបភាពសប្បុរសដោយភាពឃោរឃៅ។
មកដល់ត្រឹមពេលអ្វីមិនរំពឹងកើតឡើង។
ប្រើជម្រើសល្អបន្ទាប់បើជម្រើសល្អបំផុតមិនមាន។
របស់អ្នកដទៃជាញឹកញាប់មើលទៅល្អជាង។
ឱកាសដែលខកខានមើលទៅធំជាងនៅពេលក្រោយ។
សញ្ញាដំបូងបង្ហាញសក្តានុពលអនាគត។
វាជាការងារងាយនិងប្រាកដ។
ចំណាយបន្ថែមលើសតម្លៃសំខាន់។
នរណាម្នាក់បង្កគ្រោះហើយធ្វើជាជួយ។
អ្នកដឹកនាំច្រើនអាចធ្វើឱ្យការងារវង្វេង។
ការលំបាកមួយតាមដោយមួយទៀត។
វាគ្រាន់តែជាផ្នែកតូចនៃទាំងមូល។
លទ្ធផលកើតតាមមូលហេតុ។
ការងារធំមិនអាចបញ្ចប់ក្នុងការសាកល្បងមួយ។
ភាពកក់ក្តៅដែលផ្តល់ នាំភាពកក់ក្តៅត្រឡប់។
កំហុសតូចអាចលូតទៅជាកំហុសធំ។
ពាក្យសម្តីរាលដាលឆ្ងាយនិងលឿន។
អ្នកច្រូតអ្វីដែលអ្នកសាបព្រោះ។
បរាជ័យចាប់ផ្តើមការរៀន មិនបញ្ចប់ការខិតខំ។
ភាពទៀងទាត់អាចខ្លាំងជាងទេពកោសល្យ។
ជំហានតូចថ្ងៃនេះបង្កើតផ្លូវថ្ងៃស្អែក។
ល្បឿនតាមមកពេលភាពត្រឹមត្រូវក្លាយជាទម្លាប់។
ការរីកចម្រើនចាប់ផ្តើមពីការសួរអ្វីដែលមិនដឹង។
ការសម្រាកមិនមែនជាការបោះបង់។
កត់ត្រាជ័យជម្នះតូចៗដើម្បីរក្សាកម្លាំងចិត្ត។
វាស់ការរីកចម្រើននឹងខ្លួនអ្នកពីមុន។
ចាប់ផ្តើម ជំនួសការរង់ចាំពេលល្អឥតខ្ចោះ។
ល្បឿនថេរទៅទិសត្រឹមត្រូវនឹងដល់គោលដៅ។
ការផ្តោតដប់នាទីល្អជាងមួយម៉ោងរំខាន។
ចំណេះដឹងក្លាយជារបស់អ្នកពេលប្រើវា។
សំណួរល្អអាចនៅយូរជាងចម្លើយល្អ។
កំណត់ត្រានៅយូរជាងការចងចាំ។
កំហុសដែលកែធ្វើឱ្យការចងចាំច្បាស់។
សូម្បីតែថ្ងៃលំបាក អ្នកអាចសរសេរមួយបន្ទាត់។
មនុស្សម្នាក់ៗរៀនក្នុងល្បឿនខុសគ្នា។
ពាក្យល្អខ្លីអាចទុកស្នាមយូរ។
ស្តាប់ ធ្វើតាម ហើយសរសេរដោយខ្លួនឯង។
ការហាត់រាល់ថ្ងៃធ្វើឱ្យអក្សរមិនស្គាល់ក្លាយជាមិត្ត។
`),
  lo: lines(`
ຄຳເວົ້າດີນຳຄຳເວົ້າດີກັບຄືນມາ.
ການປ່ຽນແປງນ້ອຍໆສະສົມກ່ອນທີ່ຈະຮູ້ຕົວ.
ຢ່າລືມຈຸດເລີ່ມຕົ້ນທີ່ຮຽບງ່າຍ.
ຄົນອ່ອນແອອາດເດືອດຮ້ອນເມື່ອຄົນແຂງແຮງຕໍ່ສູ້ກັນ.
ຄວາມສຸກມາຫຼັງຄວາມລຳບາກ.
ຄວາມພະຍາຍາມຢ່າງຮອບຄອບສ້າງຜົນລະຍະຍາວ.
ສັກກະຍະພາບມີຄຸນຄ່າຜ່ານການລົງມື.
ສິ່ງທີ່ຢາກໄດ້ແຕ່ເຂົ້າເຖິງບໍ່ໄດ້.
ວິວງາມກໍດີກວ່າຫຼັງກິນເຂົ້າ.
ຍິ່ງຮີບດ່ວນ ຍິ່ງຕ້ອງລະວັງ.
ຈົ່ງລະວັງ ເພາະຄຳສ່ວນຕົວອາດມີຄົນໄດ້ຍິນ.
ຕ້ອງໃສ່ໃຈບັນຫາຂອງຕົນເອງກ່ອນ.
ມັນງ່າຍຫຼາຍ.
ທຸກຢ່າງຫຼຸດລົງຫຼັງຮອດຈຸດສູງສຸດ.
ນີ້ແມ່ນການປຽບທຽບຄົນທີ່ເກືອບເທົ່າກັນ.
ກວດສອບແມ່ນແຕ່ສິ່ງທີ່ແນ່ນອນກ່ອນລົງມື.
ສິ່ງທີ່ໃກ້ທີ່ສຸດອາດເຫັນໄດ້ຍາກທີ່ສຸດ.
ຄຳເວົ້າທີ່ຄິດດີອາດແກ້ບັນຫາໃຫຍ່.
ເສັ້ນທາງຕ່າງກັນອາດເຖິງເປົ້າໝາຍດຽວກັນ.
ການຫັກຫຼັງມັກມາຈາກບ່ອນທີ່ໄວ້ໃຈ.
ວຽກເບົາກໍງ່າຍກວ່າເມື່ອເຮັດນຳກັນ.
ການນຳສະເໜີດີເພີ່ມຄຸນຄ່າໃຫ້ເນື້ອຫາດີ.
ຄວາມລຳບາກອາດເຮັດໃຫ້ສິ່ງຕ່າງໆແຂງແຮງ.
ພາຊະນະເປົ່າມີສຽງດັງທີ່ສຸດ.
ການຄຸ້ນເຄີຍດົນນຳໄປສູ່ການຮຽນຮູ້.
ນິໄສແຕ່ນ້ອຍຢູ່ຕະຫຼອດຊີວິດ.
ສ້ອມແປງຫຼັງຄວາມເສຍຫາຍເກີດຂຶ້ນ.
ການເລີ່ມຕົ້ນດີແມ່ນເຄິ່ງຂອງວຽກ.
ຖາມແລະກວດແມ່ນແຕ່ທາງທີ່ຄຸ້ນ.
ບໍ່ມີຄວັນໂດຍບໍ່ມີເຫດ.
ຄວາມພາກພຽນຊະນະວຽກຍາກ.
ເສື້ອຜ້າອາດປ່ຽນຄວາມປະທັບໃຈ.
ມຸມມອງແຄບຄິດວ່າຂອບເຂດຕົນແມ່ນໂລກທັງໝົດ.
ຜູ້ຊ່ຽວຊານກໍຜິດພາດ.
ການນຳທີ່ດີວາງແບບຢ່າງໃຫ້ຄົນອື່ນ.
ຂະໜາດນ້ອຍອາດເຊື່ອງພະລັງໃຫຍ່.
ຢ່າລົງຄວາມໂກດໃສ່ຄົນຜິດ.
ຄົນອ່ອນໂຍນກໍຕໍ່ຕ້ານເມື່ອຖືກກົດເກີນໄປ.
ການເດີນທາງຍາວເລີ່ມຈາກກ້າວດຽວ.
ຜົນນ້ອຍໆສະສົມເປັນສິ່ງໃຫຍ່.
ມັນຍາກເກືອບເປັນໄປບໍ່ໄດ້.
ຂາດປະສົບການອາດບໍ່ເຫັນອັນຕະລາຍ.
ເວົ້າເຖິງໃຜ ຄົນນັ້ນອາດປາກົດ.
ບັນຫານ້ອຍທີ່ລະເລີຍຈະໃຫຍ່ຂຶ້ນ.
ຍາກທີ່ຈະຕອບຄວາມດີດ້ວຍຄວາມໂຫດຮ້າຍ.
ມາຮອດພໍດີເມື່ອເຫດບໍ່ຄາດຄິດເກີດ.
ໃຊ້ທາງເລືອກດີຖັດໄປຖ້າບໍ່ມີສິ່ງດີສຸດ.
ຂອງຄົນອື່ນມັກເບິ່ງດີກວ່າ.
ໂອກາດທີ່ພາດມັກເບິ່ງໃຫຍ່ຂຶ້ນພາຍຫຼັງ.
ສັນຍານແຕ່ຕົ້ນມັກສະແດງສັກກະຍະພາບອະນາຄົດ.
ນີ້ແມ່ນວຽກງ່າຍແລະແນ່ນອນ.
ຄ່າເພີ່ມເກີນຄຸນຄ່າຫຼັກ.
ບາງຄົນກໍ່ຄວາມເສຍຫາຍແລ້ວເຮັດທ່າຊ່ວຍ.
ຜູ້ນຳຫຼາຍເກີນໄປອາດເຮັດໃຫ້ວຽກຫຼົງທາງ.
ຄວາມຍາກໜຶ່ງຕາມດ້ວຍອີກຄວາມຍາກ.
ນີ້ເປັນພຽງສ່ວນນ້ອຍຫຼາຍຂອງທັງໝົດ.
ຜົນຕາມມາຈາກເຫດ.
ວຽກໃຫຍ່ບໍ່ສຳເລັດໃນຄັ້ງດຽວ.
ຄວາມອົບອຸ່ນທີ່ໃຫ້ນຳຄວາມອົບອຸ່ນກັບມາ.
ຄວາມຜິດນ້ອຍອາດເຕີບເປັນຄວາມຜິດໃຫຍ່.
ຄຳເວົ້າແຜ່ໄກແລະໄວ.
ຫວ່ານຫຍັງກໍເກັບກ່ຽວສິ່ງນັ້ນ.
ຄວາມລົ້ມເຫຼວເລີ່ມການຮຽນ ບໍ່ໄດ້ຈົບຄວາມພະຍາຍາມ.
ຄວາມສະໝ່ຳສະເໝີອາດແຂງແຮງກວ່າພອນສະຫວັນ.
ກ້າວນ້ອຍມື້ນີ້ສ້າງທາງມື້ອື່ນ.
ຄວາມໄວຕາມມາເມື່ອຄວາມຖືກຕ້ອງເປັນນິໄສ.
ການເຕີບໂຕເລີ່ມຈາກຖາມສິ່ງທີ່ບໍ່ຮູ້.
ການພັກບໍ່ແມ່ນການຍອມແພ້.
ບັນທຶກໄຊຊະນະນ້ອຍເພື່ອຮັກສາແຮງໃຈ.
ວັດຄວາມກ້າວໜ້າກັບຕົນເອງໃນອະດີດ.
ເລີ່ມແທນການລໍຖ້າຊ່ວງທີ່ສົມບູນ.
ກ້າວຄົງທີ່ໃນທິດທາງຖືກຈະຮອດເປົ້າ.
ສິບນາທີທີ່ຈົດຈໍ່ດີກວ່າໜຶ່ງຊົ່ວໂມງທີ່ວອກແວກ.
ຄວາມຮູ້ເປັນຂອງທ່ານເມື່ອນຳໃຊ້.
ຄຳຖາມດີອາດຢູ່ດົນກວ່າຄຳຕອບດີ.
ບັນທຶກຢູ່ດົນກວ່າຄວາມຈື່ຈຳ.
ຄວາມຜິດທີ່ແກ້ໄຂສ້າງຄວາມຈຳຊັດຂຶ້ນ.
ແມ່ນແຕ່ມື້ຍາກກໍຂຽນໄດ້ໜຶ່ງແຖວ.
ທຸກຄົນຮຽນດ້ວຍຄວາມໄວຕ່າງກັນ.
ຄຳດີສັ້ນໆອາດປະໄວ້ຄວາມປະທັບໃຈຍາວ.
ຟັງ ເວົ້າຊ້ຳ ແລະຂຽນເອງ.
ການຝຶກທຸກມື້ເຮັດໃຫ້ຕົວອັກສອນແປກເປັນໝູ່.
`),
};
