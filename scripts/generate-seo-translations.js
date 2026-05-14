/**
 * One-off generator: creates /public/translations/seo/<lang>.json for all 44 non-English languages.
 * Fallback to English is handled in utils/seo.js, so missing fields are safe.
 *
 * Run: node scripts/generate-seo-translations.js
 */

'use strict';

const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'translations', 'seo');

// Localized title/description templates per language.
// Each entry supplies the per-page core copy.
// "Tracify" + the keyword "phone tracker" are preserved as brand/keyword anchors
// but the rest is translated naturally.
const L10N = {
    cs: {
        home:        { title: "Najít jakýkoli telefon — Sledovat kohokoli, kdekoli, okamžitě | Tracify", description: "Sledujte kohokoli kdekoli a najděte jeho polohu okamžitě podle telefonního čísla. Souhlasný trackeru telefonu v reálném čase. iOS + Android, bez instalace aplikace. 24hodinová zkušební verze za $1,47.", h1: "Najděte jakýkoli telefon, kdekoli" },
        howItWorks:  { title: "Jak Tracify funguje — 3 kroky k lokalizaci telefonu", description: "Naučte se, jak Tracify lokalizuje jakýkoli telefon ve třech krocích: zadejte číslo, odešlete vlastní SMS a přijměte GPS souřadnice v reálném čase." },
        faq:         { title: "Časté otázky Tracify — Odpovědi o sledování telefonu", description: "Odpovědi na nejčastější otázky o službě Tracify: jak to funguje, legálnost, soukromí, podporovaná zařízení, ceny a sledování se souhlasem." },
        contact:     { title: "Kontaktujte podporu Tracify — 24/7 pomoc", description: "Potřebujete pomoc? Tým podpory Tracify je online 24/7. Napište nám kdykoli." },
        privacy:     { title: "Zásady ochrany osobních údajů | Tracify", description: "Jak Tracify chrání vaše osobní údaje a soukromí." },
        terms:       { title: "Obchodní podmínky | Tracify", description: "Obchodní podmínky pro používání služby sledování telefonu Tracify." }
    },
    de: {
        home:        { title: "Jedes Handy orten — Jeden überall sofort verfolgen | Tracify", description: "Verfolgen Sie jeden überall und finden Sie sofort seinen Standort per Telefonnummer. Einverständnisbasierter Echtzeit-Handy-Tracker. iOS + Android, keine App-Installation. 24-Stunden-Test für $1,47.", h1: "Jedes Handy, überall orten" },
        howItWorks:  { title: "So funktioniert Tracify — Telefonnummer in 3 Schritten orten", description: "Erfahren Sie, wie Tracify jedes Handy in drei Schritten ortet: Nummer eingeben, SMS senden, GPS-Position empfangen." },
        faq:         { title: "Tracify FAQ — Antworten zum Handy-Tracker", description: "Antworten auf häufige Fragen zu Tracify: Funktionsweise, Legalität, Datenschutz, unterstützte Geräte, Preise und zustimmungsbasiertes Tracking." },
        contact:     { title: "Tracify Support kontaktieren — 24/7 Hilfe", description: "Brauchen Sie Hilfe? Das Tracify-Team ist rund um die Uhr für Sie da." },
        privacy:     { title: "Datenschutzerklärung | Tracify", description: "Wie Tracify Ihre Daten schützt und Ihre Privatsphäre wahrt." },
        terms:       { title: "AGB | Tracify", description: "Geschäftsbedingungen für die Nutzung des Tracify Handy-Tracking-Dienstes." }
    },
    es: {
        home:        { title: "Localiza cualquier teléfono — Rastrea a cualquiera, en cualquier lugar, al instante | Tracify", description: "Rastrea a cualquiera en cualquier lugar y encuentra su ubicación al instante por número de teléfono. Rastreador de teléfono en tiempo real basado en consentimiento. iOS + Android, sin instalar app. Prueba de $1,47.", h1: "Localiza cualquier teléfono, en cualquier lugar" },
        howItWorks:  { title: "Cómo funciona Tracify — Rastrea en 3 pasos", description: "Descubre cómo Tracify localiza cualquier teléfono en tres pasos: introduce el número, envía un SMS personalizado y recibe las coordenadas GPS." },
        faq:         { title: "Preguntas frecuentes de Tracify — Rastreador de teléfono", description: "Respuestas a preguntas comunes sobre Tracify: cómo funciona, legalidad, privacidad, dispositivos compatibles y precios." },
        contact:     { title: "Contacta con soporte Tracify — Ayuda 24/7", description: "¿Necesitas ayuda? El equipo de soporte de Tracify está disponible 24/7." },
        privacy:     { title: "Política de privacidad | Tracify", description: "Cómo Tracify protege tus datos y privacidad." },
        terms:       { title: "Términos y condiciones | Tracify", description: "Términos de uso del servicio de rastreo de teléfono Tracify." }
    },
    fr: {
        home:        { title: "Localiser n'importe quel téléphone — Suivre n'importe qui, n'importe où, instantanément | Tracify", description: "Suivez n'importe qui n'importe où et trouvez sa localisation instantanément par numéro de téléphone. Traceur de téléphone en temps réel basé sur le consentement. iOS + Android, sans installation d'app. Essai $1,47.", h1: "Localisez n'importe quel téléphone, partout" },
        howItWorks:  { title: "Comment Tracify fonctionne — Localiser un numéro en 3 étapes", description: "Découvrez comment Tracify localise un téléphone en trois étapes : entrez le numéro, envoyez un SMS, recevez les coordonnées GPS." },
        faq:         { title: "FAQ Tracify — Questions sur le traceur de téléphone", description: "Réponses aux questions fréquentes sur Tracify : fonctionnement, légalité, confidentialité, appareils pris en charge, tarifs." },
        contact:     { title: "Contacter le support Tracify — Aide 24/7", description: "Besoin d'aide ? L'équipe d'assistance Tracify est disponible 24h/24." },
        privacy:     { title: "Politique de confidentialité | Tracify", description: "Comment Tracify protège vos données personnelles." },
        terms:       { title: "Conditions générales | Tracify", description: "Conditions d'utilisation du service de traçage Tracify." }
    },
    it: {
        home:        { title: "Localizza qualsiasi telefono — Traccia chiunque, ovunque, all'istante | Tracify", description: "Traccia chiunque ovunque e trova la sua posizione all'istante tramite numero di telefono. Tracker del telefono in tempo reale basato sul consenso. iOS + Android, senza installare app. Prova da $1,47.", h1: "Localizza qualsiasi telefono, ovunque" },
        howItWorks:  { title: "Come funziona Tracify — Traccia in 3 passi", description: "Scopri come Tracify localizza un telefono in tre passi: inserisci il numero, invia un SMS, ricevi le coordinate GPS." },
        faq:         { title: "FAQ Tracify — Domande sul tracker telefonico", description: "Risposte alle domande frequenti su Tracify: funzionamento, legalità, privacy, dispositivi supportati e prezzi." },
        contact:     { title: "Contatta il supporto Tracify — 24/7", description: "Hai bisogno di aiuto? Il team Tracify è disponibile 24 ore su 24." },
        privacy:     { title: "Informativa sulla privacy | Tracify", description: "Come Tracify protegge i tuoi dati personali." },
        terms:       { title: "Termini e condizioni | Tracify", description: "Termini di utilizzo del servizio di tracciamento Tracify." }
    },
    pt: {
        home:        { title: "Localize qualquer telefone — Rastreie qualquer pessoa, em qualquer lugar, instantaneamente | Tracify", description: "Rastreie qualquer pessoa em qualquer lugar e encontre a sua localização instantaneamente pelo número de telefone. Rastreador de telefone em tempo real baseado em consentimento. iOS + Android, sem instalar app. Teste $1,47.", h1: "Localize qualquer telefone, em qualquer lugar" },
        howItWorks:  { title: "Como o Tracify funciona — Rastreie em 3 passos", description: "Veja como o Tracify localiza qualquer telefone em três passos: insira o número, envie um SMS e receba as coordenadas GPS." },
        faq:         { title: "FAQ Tracify — Perguntas sobre rastreador de telefone", description: "Respostas para dúvidas comuns sobre o Tracify: como funciona, legalidade, privacidade e preços." },
        contact:     { title: "Contactar suporte Tracify — 24/7", description: "Precisa de ajuda? A equipa de suporte Tracify está disponível 24/7." },
        privacy:     { title: "Política de privacidade | Tracify", description: "Como o Tracify protege os seus dados." },
        terms:       { title: "Termos e condições | Tracify", description: "Termos de uso do serviço Tracify." }
    },
    pt_BR: {
        home:        { title: "Localize qualquer telefone — Rastreie qualquer pessoa, em qualquer lugar, instantaneamente | Tracify", description: "Rastreie qualquer pessoa em qualquer lugar e encontre a localização dela instantaneamente pelo número. Rastreador de telefone em tempo real baseado em consentimento. iOS + Android, sem app. Teste $1,47.", h1: "Localize qualquer telefone, em qualquer lugar" },
        howItWorks:  { title: "Como o Tracify funciona — Rastreie em 3 passos", description: "Veja como o Tracify localiza qualquer telefone em três passos: insira o número, envie um SMS e receba as coordenadas GPS." },
        faq:         { title: "FAQ Tracify — Dúvidas sobre rastreador de telefone", description: "Respostas para dúvidas comuns sobre o Tracify: como funciona, legalidade, privacidade e preços." },
        contact:     { title: "Contate o suporte Tracify — 24/7", description: "Precisa de ajuda? A equipe de suporte Tracify está disponível 24/7." },
        privacy:     { title: "Política de privacidade | Tracify", description: "Como o Tracify protege seus dados." },
        terms:       { title: "Termos e condições | Tracify", description: "Termos de uso do serviço Tracify." }
    },
    nl: {
        home:        { title: "Zoek elke telefoon — Volg iedereen, overal, direct | Tracify", description: "Volg iedereen overal en vind zijn locatie direct via telefoonnummer. Realtime telefoontracker op basis van toestemming. iOS + Android, geen app-installatie. Proef van $1,47.", h1: "Vind elke telefoon, overal" },
        howItWorks:  { title: "Hoe Tracify werkt — In 3 stappen traceren", description: "Zo lokaliseert Tracify elke telefoon in drie stappen: nummer invoeren, SMS versturen, GPS-coördinaten ontvangen." },
        faq:         { title: "Tracify FAQ — Telefoon Tracker vragen", description: "Antwoorden op veelgestelde vragen over Tracify: hoe het werkt, wettigheid, privacy en prijzen." },
        contact:     { title: "Neem contact op met Tracify — 24/7 hulp", description: "Hulp nodig? Het Tracify-team is 24/7 beschikbaar." },
        privacy:     { title: "Privacybeleid | Tracify", description: "Hoe Tracify uw gegevens beschermt." },
        terms:       { title: "Algemene voorwaarden | Tracify", description: "Voorwaarden voor het gebruik van Tracify." }
    },
    pl: {
        home:        { title: "Zlokalizuj dowolny telefon — Śledź każdego, wszędzie, natychmiast | Tracify", description: "Śledź każdego wszędzie i znajdź jego lokalizację natychmiast po numerze telefonu. Lokalizator telefonu w czasie rzeczywistym oparty na zgodzie. iOS + Android, bez instalacji aplikacji. Próba $1,47.", h1: "Znajdź każdy telefon, wszędzie" },
        howItWorks:  { title: "Jak działa Tracify — 3 kroki do lokalizacji telefonu", description: "Dowiedz się, jak Tracify lokalizuje telefon w trzech krokach: wpisz numer, wyślij SMS, odbierz współrzędne GPS." },
        faq:         { title: "Tracify FAQ — Pytania o lokalizator telefonu", description: "Odpowiedzi na najczęstsze pytania o Tracify: jak działa, legalność, prywatność, obsługiwane urządzenia." },
        contact:     { title: "Kontakt z Tracify — Pomoc 24/7", description: "Potrzebujesz pomocy? Zespół Tracify jest dostępny 24/7." },
        privacy:     { title: "Polityka prywatności | Tracify", description: "Jak Tracify chroni Twoje dane." },
        terms:       { title: "Regulamin | Tracify", description: "Warunki korzystania z usługi Tracify." }
    },
    ru: {
        home:        { title: "Найти любой телефон — Отслеживать кого угодно, где угодно, мгновенно | Tracify", description: "Отслеживайте любого где угодно и находите его местоположение мгновенно по номеру телефона. Трекер телефона в реальном времени на основе согласия. iOS + Android, без установки приложения. Пробная версия $1,47.", h1: "Найдите любой телефон, где угодно" },
        howItWorks:  { title: "Как работает Tracify — 3 шага к определению местоположения", description: "Узнайте, как Tracify находит любой телефон за три шага: введите номер, отправьте SMS, получите GPS-координаты." },
        faq:         { title: "Tracify FAQ — Вопросы о трекере телефона", description: "Ответы на частые вопросы о Tracify: как работает, законность, конфиденциальность, поддержка устройств, цены." },
        contact:     { title: "Связаться с поддержкой Tracify — 24/7", description: "Нужна помощь? Команда Tracify доступна круглосуточно." },
        privacy:     { title: "Политика конфиденциальности | Tracify", description: "Как Tracify защищает ваши данные." },
        terms:       { title: "Условия использования | Tracify", description: "Условия использования сервиса Tracify." }
    },
    tr: {
        home:        { title: "Her Telefonu Bul — Herkesi, Her Yerde, Anında Takip Et | Tracify", description: "Herhangi birini her yerde takip edin ve telefon numarasından konumunu anında bulun. Onaya dayalı gerçek zamanlı telefon takip. iOS + Android, uygulama yüklemeden. $1,47 deneme.", h1: "Herhangi bir telefonu, her yerde bulun" },
        howItWorks:  { title: "Tracify nasıl çalışır — 3 adımda takip", description: "Tracify'ın telefonu üç adımda nasıl bulduğunu keşfedin: numarayı girin, SMS gönderin, GPS konumunu alın." },
        faq:         { title: "Tracify SSS — Telefon Takip Soruları", description: "Tracify hakkında sık sorulan sorular: nasıl çalışır, yasallık, gizlilik, desteklenen cihazlar, fiyatlar." },
        contact:     { title: "Tracify destek ile iletişim — 7/24", description: "Yardıma mı ihtiyacınız var? Tracify ekibi 7/24 sizinle." },
        privacy:     { title: "Gizlilik Politikası | Tracify", description: "Tracify verilerinizi nasıl koruyor." },
        terms:       { title: "Şartlar ve Koşullar | Tracify", description: "Tracify hizmet kullanım koşulları." }
    },
    ar: {
        home:        { title: "حدد موقع أي هاتف — تتبع أي شخص في أي مكان فوراً | Tracify", description: "تتبع أي شخص في أي مكان واعثر على موقعه فوراً عبر رقم الهاتف. متتبع هاتف في الوقت الفعلي قائم على الموافقة. iOS + Android بدون تثبيت تطبيق. تجربة $1.47.", h1: "حدد موقع أي هاتف في أي مكان" },
        howItWorks:  { title: "كيف يعمل Tracify — 3 خطوات لتحديد موقع هاتف", description: "تعرف على كيفية تحديد موقع هاتف في ثلاث خطوات: أدخل الرقم، أرسل SMS، استلم إحداثيات GPS." },
        faq:         { title: "أسئلة Tracify الشائعة — متتبع الهاتف", description: "إجابات على الأسئلة الأكثر شيوعاً حول Tracify: كيف يعمل، القانونية، الخصوصية، الأجهزة المدعومة، الأسعار." },
        contact:     { title: "تواصل مع دعم Tracify — 24/7", description: "هل تحتاج إلى مساعدة؟ فريق Tracify متوفر على مدار الساعة." },
        privacy:     { title: "سياسة الخصوصية | Tracify", description: "سياسة خصوصية Tracify: ما نجمعه، كيف نستخدمه، كيف يتم تشفير بياناتك، وكيف نلتزم بمعايير GDPR وCCPA وPECR. خصوصية متتبع الهاتف القائم على الموافقة." },
        terms:       { title: "الشروط والأحكام | Tracify", description: "شروط خدمة Tracify لاستخدام منصتنا لتتبع الهاتف القائمة على الموافقة: استخدام الحساب، الاشتراكات، الإلغاء، الاستخدام المسموح به، والمسؤوليات القانونية." }
    },
    he: {
        home:        { title: "אתר כל טלפון — עקוב אחרי כל אחד בכל מקום, מיידית | Tracify", description: "עקוב אחרי כל אחד בכל מקום ומצא את המיקום שלו מיידית לפי מספר טלפון. מאתר טלפון בזמן אמת מבוסס הסכמה. iOS + Android, בלי התקנת אפליקציה. ניסיון $1.47.", h1: "אתר כל טלפון, בכל מקום" },
        howItWorks:  { title: "איך Tracify עובד — 3 שלבים לאיתור טלפון", description: "גלה איך Tracify מאתר כל טלפון בשלושה שלבים: הזן מספר, שלח SMS, קבל קואורדינטות GPS." },
        faq:         { title: "Tracify FAQ — שאלות על מאתר טלפון", description: "תשובות לשאלות נפוצות על Tracify: איך זה עובד, חוקיות, פרטיות, מחירים." },
        contact:     { title: "צור קשר עם Tracify — 24/7", description: "צריך עזרה? צוות Tracify זמין 24 שעות ביממה." },
        privacy:     { title: "מדיניות פרטיות | Tracify", description: "מדיניות הפרטיות של Tracify: מה אנחנו אוספים, איך אנחנו משתמשים בזה, איך הנתונים שלך מוצפנים, ואיך אנחנו עומדים בתקני GDPR, CCPA ו-PECR." },
        terms:       { title: "תנאים והגבלות | Tracify", description: "תנאי השירות של Tracify לשימוש בפלטפורמת איתור הטלפון מבוססת ההסכמה שלנו: שימוש בחשבון, מנויים, ביטולים, שימוש מותר ואחריות משפטית." }
    },
    ja: {
        home:        { title: "どの電話でも特定 — 誰でもどこでも今すぐ追跡 | Tracify", description: "電話番号で誰でもどこでも追跡し、位置を今すぐ特定。同意ベースのリアルタイム電話トラッカー。iOS + Android、アプリ不要。$1.47トライアル。", h1: "どの電話でも、どこでも特定" },
        howItWorks:  { title: "Tracifyの仕組み — 3ステップで電話追跡", description: "Tracifyが電話を特定する3ステップ: 番号を入力、SMS送信、GPS座標を受信。" },
        faq:         { title: "Tracify FAQ — 電話追跡に関する質問", description: "Tracifyのよくある質問: 仕組み、合法性、プライバシー、対応端末、料金。" },
        contact:     { title: "Tracifyサポートへのお問い合わせ — 24/7", description: "電話番号の追跡でお困りですか？Tracifyのサポートチームは24時間365日対応。サブスクリプション、追跡、請求、プライバシーに関するご質問に迅速にお答えします。" },
        privacy:     { title: "プライバシーポリシー | Tracify", description: "Tracifyのプライバシーポリシー：収集するデータ、使用方法、データの暗号化、GDPR・CCPA・PECR準拠の方法。同意ベースの電話追跡のプライバシー保護。" },
        terms:       { title: "利用規約 | Tracify", description: "Tracifyの同意ベース電話追跡プラットフォーム利用規約：アカウント利用、サブスクリプション、解約、許可される利用方法、法的責任について。" }
    },
    ko: {
        home:        { title: "어떤 휴대폰이든 찾기 — 누구나 어디서든 즉시 추적 | Tracify", description: "전화번호로 누구나 어디서든 추적하고 즉시 위치 확인. 동의 기반 실시간 휴대폰 추적기. iOS + Android, 앱 설치 불필요. $1.47 체험.", h1: "어떤 휴대폰이든, 어디서든 찾기" },
        howItWorks:  { title: "Tracify 작동 방식 — 3단계로 휴대폰 위치 찾기", description: "Tracify가 휴대폰을 찾는 3단계: 번호 입력, SMS 전송, GPS 좌표 수신." },
        faq:         { title: "Tracify FAQ — 휴대폰 추적 질문", description: "Tracify에 대한 자주 묻는 질문: 작동 방식, 합법성, 개인정보 보호, 지원 기기, 가격." },
        contact:     { title: "Tracify 지원팀 문의 — 24/7", description: "휴대폰 번호 추적에 도움이 필요하신가요? Tracify 지원팀이 24시간 연중무휴 대기 중입니다. 구독, 추적, 결제, 개인정보에 관한 빠른 답변을 받으세요." },
        privacy:     { title: "개인정보 처리방침 | Tracify", description: "Tracify 개인정보 처리방침: 수집 데이터, 사용 방법, 데이터 암호화 방식, GDPR·CCPA·PECR 준수 방법. 동의 기반 휴대폰 추적기 개인정보 보호." },
        terms:       { title: "이용 약관 | Tracify", description: "Tracify 동의 기반 휴대폰 추적 플랫폼 이용약관: 계정 사용, 구독, 취소, 허용 용도 및 법적 책임에 대한 상세 안내." }
    },
    zh: {
        home:        { title: "定位任何手机 — 随时随地即刻追踪任何人 | Tracify", description: "通过手机号码随时随地追踪任何人,即刻获取其位置。基于同意的实时手机追踪。iOS + Android,无需安装应用。$1.47试用。", h1: "随时随地定位任何手机" },
        howItWorks:  { title: "Tracify如何工作 — 3步追踪手机", description: "了解Tracify如何通过三个步骤定位任何手机：输入号码、发送短信、接收GPS坐标。" },
        faq:         { title: "Tracify常见问题 — 手机追踪", description: "关于Tracify的常见问题：工作原理、合法性、隐私、支持设备、价格。" },
        contact:     { title: "联系Tracify支持 — 24/7", description: "需要帮助追踪手机号码？Tracify支持团队全天候24/7在线。发送消息即可获取关于订阅、追踪、账单或隐私问题的快速解答。" },
        privacy:     { title: "隐私政策 | Tracify", description: "Tracify隐私政策：我们收集哪些数据、如何使用、您的数据如何加密，以及我们如何遵守GDPR、CCPA和PECR法规。基于同意的手机追踪隐私保护。" },
        terms:       { title: "条款和条件 | Tracify", description: "Tracify基于同意的手机追踪平台服务条款：账户使用、订阅管理、取消政策、允许用途及法律责任等详细说明。" }
    },
    'zh-TW': {
        home:        { title: "定位任何手機 — 隨時隨地即時追蹤任何人 | Tracify", description: "透過手機號碼隨時隨地追蹤任何人,即時取得其位置。基於同意的即時手機追蹤。iOS + Android,無需安裝應用程式。$1.47試用。", h1: "隨時隨地定位任何手機" },
        howItWorks:  { title: "Tracify如何運作 — 3步驟追蹤手機", description: "了解Tracify如何透過三個步驟定位任何手機：輸入號碼、傳送簡訊、接收GPS座標。" },
        faq:         { title: "Tracify常見問題 — 手機追蹤", description: "關於Tracify的常見問題：運作原理、合法性、隱私、支援裝置、價格。" },
        contact:     { title: "聯絡Tracify支援 — 24/7", description: "需要協助追蹤手機號碼？Tracify支援團隊全天候24/7在線。傳送訊息即可獲取關於訂閱、追蹤、帳單或隱私問題的快速解答。" },
        privacy:     { title: "隱私權政策 | Tracify", description: "Tracify隱私政策：我們收集哪些資料、如何使用、您的資料如何加密，以及我們如何遵守GDPR、CCPA和PECR法規。基於同意的手機追蹤隱私保護。" },
        terms:       { title: "服務條款 | Tracify", description: "Tracify基於同意的手機追蹤平台服務條款：帳戶使用、訂閱管理、取消政策、允許用途及法律責任等詳細說明。" }
    },
    zh_HK: {
        home:        { title: "定位任何手機 — 隨時隨地即時追蹤任何人 | Tracify", description: "透過手機號碼隨時隨地追蹤任何人,即時取得其位置。基於同意嘅即時手機追蹤。iOS + Android,無需安裝應用程式。$1.47試用。", h1: "隨時隨地定位任何手機" },
        howItWorks:  { title: "Tracify點運作 — 3步追蹤手機", description: "了解Tracify如何透過三個步驟定位手機：輸入號碼、發送短訊、接收GPS座標。" },
        faq:         { title: "Tracify常見問題 — 手機追蹤", description: "關於Tracify嘅常見問題：運作原理、合法性、私隱、支援裝置、價格。" },
        contact:     { title: "聯絡Tracify — 24/7", description: "需要幫助追蹤手機號碼？Tracify支援團隊全天候24/7在線。發送訊息即可獲取關於訂閱、追蹤、賬單或私隱問題嘅快速解答。" },
        privacy:     { title: "私隱政策 | Tracify", description: "Tracify私隱政策：我哋收集邊啲資料、點樣使用、您嘅資料點樣加密，以及我哋點樣遵守GDPR、CCPA同PECR法規。基於同意嘅手機追蹤私隱保護。" },
        terms:       { title: "條款及細則 | Tracify", description: "Tracify基於同意嘅手機追蹤平台服務條款：賬戶使用、訂閱管理、取消政策、允許用途及法律責任等詳細說明。" }
    },
    hi: {
        home:        { title: "कोई भी फोन खोजें — किसी को भी कहीं भी तुरंत ट्रैक करें | Tracify", description: "फोन नंबर से किसी को भी कहीं भी ट्रैक करें और उनका स्थान तुरंत खोजें। सहमति-आधारित रीयल-टाइम फोन ट्रैकर। iOS + Android, बिना ऐप इंस्टॉल किए। $1.47 ट्रायल।", h1: "कोई भी फोन, कहीं भी खोजें" },
        howItWorks:  { title: "Tracify कैसे काम करता है — 3 चरणों में फोन ट्रैक", description: "Tracify तीन चरणों में फोन कैसे ढूंढता है: नंबर दर्ज करें, SMS भेजें, GPS निर्देशांक प्राप्त करें।" },
        faq:         { title: "Tracify FAQ — फोन ट्रैकर प्रश्न", description: "Tracify के बारे में सामान्य प्रश्न: यह कैसे काम करता है, वैधता, गोपनीयता, समर्थित डिवाइस, कीमतें।" },
        contact:     { title: "Tracify सहायता से संपर्क — 24/7", description: "फोन नंबर ट्रैक करने में मदद चाहिए? Tracify की सहायता टीम 24/7 ऑनलाइन है। हमें संदेश भेजें — सदस्यता, ट्रैकिंग, बिलिंग या गोपनीयता के बारे में त्वरित उत्तर पाएं।" },
        privacy:     { title: "गोपनीयता नीति | Tracify", description: "Tracify की गोपनीयता नीति: हम क्या एकत्र करते हैं, कैसे उपयोग करते हैं, आपका डेटा कैसे एन्क्रिप्ट होता है, और हम GDPR, CCPA और PECR का अनुपालन कैसे करते हैं।" },
        terms:       { title: "नियम और शर्तें | Tracify", description: "Tracify के सहमति-आधारित फोन ट्रैकिंग प्लेटफॉर्म की सेवा शर्तें: खाता उपयोग, सदस्यता, रद्दीकरण, अनुमत उपयोग और कानूनी जिम्मेदारियां।" }
    },
    th: {
        home:        { title: "ค้นหาโทรศัพท์เครื่องใดก็ได้ — ติดตามทุกคนได้ทุกที่ทันที | Tracify", description: "ติดตามทุกคนได้ทุกที่และค้นหาตำแหน่งของพวกเขาทันทีจากหมายเลขโทรศัพท์ เครื่องติดตามโทรศัพท์แบบเรียลไทม์ที่ใช้ความยินยอม iOS + Android ไม่ต้องติดตั้งแอป ทดลอง $1.47", h1: "ค้นหาโทรศัพท์ได้ทุกที่" },
        howItWorks:  { title: "Tracify ทำงานอย่างไร — 3 ขั้นตอนติดตามโทรศัพท์", description: "เรียนรู้วิธีที่ Tracify ค้นหาโทรศัพท์ในสามขั้นตอน: ใส่หมายเลข ส่ง SMS รับพิกัด GPS" },
        faq:         { title: "Tracify FAQ — คำถามเกี่ยวกับการติดตามโทรศัพท์", description: "คำตอบสำหรับคำถามที่พบบ่อยเกี่ยวกับ Tracify: วิธีการทำงาน ความถูกต้อง ความเป็นส่วนตัว อุปกรณ์ที่รองรับ ราคา" },
        contact:     { title: "ติดต่อฝ่ายสนับสนุน Tracify — 24/7", description: "ต้องการความช่วยเหลือในการติดตามหมายเลขโทรศัพท์? ทีมสนับสนุน Tracify ออนไลน์ตลอด 24/7 ส่งข้อความถึงเราเพื่อรับคำตอบเกี่ยวกับการสมัครสมาชิก การติดตาม การเรียกเก็บเงิน หรือความเป็นส่วนตัว" },
        privacy:     { title: "นโยบายความเป็นส่วนตัว | Tracify", description: "นโยบายความเป็นส่วนตัวของ Tracify: ข้อมูลที่เราเก็บรวบรวม วิธีการใช้งาน การเข้ารหัสข้อมูลของคุณ และการปฏิบัติตาม GDPR, CCPA และ PECR" },
        terms:       { title: "ข้อกำหนดและเงื่อนไข | Tracify", description: "เงื่อนไขการให้บริการของแพลตฟอร์มติดตามโทรศัพท์ Tracify: การใช้บัญชี การสมัครสมาชิก การยกเลิก การใช้งานที่อนุญาต และความรับผิดชอบทางกฎหมาย" }
    },
    bn: {
        home:        { title: "যেকোনো ফোন খুঁজুন — যেকোনো কাউকে যেকোনো জায়গায় তাৎক্ষণিকভাবে ট্র্যাক করুন | Tracify", description: "ফোন নম্বর দিয়ে যেকোনো কাউকে যেকোনো জায়গায় ট্র্যাক করুন এবং তাদের অবস্থান তাৎক্ষণিকভাবে খুঁজে পান। সম্মতি-ভিত্তিক রিয়েল-টাইম ফোন ট্র্যাকার। iOS + Android, অ্যাপ ইনস্টল ছাড়া। $1.47 ট্রায়াল।", h1: "যেকোনো ফোন, যেকোনো জায়গায় খুঁজুন" },
        howItWorks:  { title: "Tracify কিভাবে কাজ করে — 3 ধাপে ফোন ট্র্যাক", description: "Tracify তিনটি ধাপে যেকোনো ফোন খুঁজে: নম্বর লিখুন, SMS পাঠান, GPS স্থানাঙ্ক পান।" },
        faq:         { title: "Tracify FAQ — ফোন ট্র্যাকার প্রশ্ন", description: "Tracify সম্পর্কে সাধারণ প্রশ্ন: কিভাবে কাজ করে, বৈধতা, গোপনীয়তা, সমর্থিত ডিভাইস, মূল্য।" },
        contact:     { title: "Tracify সাপোর্টের সাথে যোগাযোগ — 24/7", description: "সাহায্য দরকার? Tracify টিম 24/7 উপলব্ধ।" },
        privacy:     { title: "গোপনীয়তা নীতি | Tracify", description: "Tracify কিভাবে আপনার ডেটা রক্ষা করে।" },
        terms:       { title: "শর্তাবলী | Tracify", description: "Tracify পরিষেবা ব্যবহারের শর্তাবলী।" }
    },
    vi: {
        home:        { title: "Định vị mọi điện thoại — Theo dõi bất kỳ ai, ở bất kỳ đâu, ngay lập tức | Tracify", description: "Theo dõi bất kỳ ai ở bất kỳ đâu và tìm vị trí của họ ngay lập tức qua số điện thoại. Trình theo dõi điện thoại thời gian thực dựa trên sự đồng ý. iOS + Android, không cần cài ứng dụng. Dùng thử $1.47.", h1: "Định vị mọi điện thoại ở mọi nơi" },
        howItWorks:  { title: "Tracify hoạt động như thế nào — Theo dõi trong 3 bước", description: "Khám phá cách Tracify định vị điện thoại qua 3 bước: nhập số, gửi SMS, nhận tọa độ GPS." },
        faq:         { title: "Tracify FAQ — Câu hỏi về theo dõi điện thoại", description: "Câu trả lời cho các câu hỏi thường gặp về Tracify: cách hoạt động, tính hợp pháp, quyền riêng tư, thiết bị hỗ trợ, giá." },
        contact:     { title: "Liên hệ hỗ trợ Tracify — 24/7", description: "Cần trợ giúp? Đội ngũ Tracify luôn sẵn sàng 24/7." },
        privacy:     { title: "Chính sách bảo mật | Tracify", description: "Cách Tracify bảo vệ dữ liệu của bạn." },
        terms:       { title: "Điều khoản sử dụng | Tracify", description: "Điều khoản sử dụng dịch vụ Tracify." }
    },
    id: {
        home:        { title: "Temukan telepon apa pun — Lacak siapa pun, di mana pun, seketika | Tracify", description: "Lacak siapa pun di mana pun dan temukan lokasi mereka seketika via nomor telepon. Pelacak telepon real-time berbasis persetujuan. iOS + Android, tanpa instal aplikasi. Uji coba $1,47.", h1: "Temukan telepon apa pun, di mana pun" },
        howItWorks:  { title: "Cara kerja Tracify — Lacak dalam 3 langkah", description: "Pelajari bagaimana Tracify melacak telepon dalam tiga langkah: masukkan nomor, kirim SMS, terima koordinat GPS." },
        faq:         { title: "Tracify FAQ — Pertanyaan pelacak telepon", description: "Jawaban pertanyaan umum tentang Tracify: cara kerja, legalitas, privasi, perangkat yang didukung, harga." },
        contact:     { title: "Hubungi dukungan Tracify — 24/7", description: "Butuh bantuan? Tim Tracify tersedia 24/7." },
        privacy:     { title: "Kebijakan privasi | Tracify", description: "Bagaimana Tracify melindungi data Anda." },
        terms:       { title: "Syarat dan ketentuan | Tracify", description: "Syarat penggunaan layanan Tracify." }
    },
    ms: {
        home:        { title: "Cari Mana-mana Telefon — Jejak Sesiapa, Di Mana-mana, Segera | Tracify", description: "Jejak sesiapa di mana-mana dan cari lokasi mereka segera melalui nombor telefon. Penjejak telefon masa nyata berasaskan persetujuan. iOS + Android, tanpa pasang aplikasi. Percubaan $1.47.", h1: "Cari mana-mana telefon, di mana-mana" },
        howItWorks:  { title: "Cara Tracify berfungsi — Jejak dalam 3 langkah", description: "Ketahui bagaimana Tracify mencari telefon dalam tiga langkah: masukkan nombor, hantar SMS, terima koordinat GPS." },
        faq:         { title: "Tracify FAQ — Soalan penjejak telefon", description: "Jawapan kepada soalan lazim tentang Tracify: cara ia berfungsi, kesahihan, privasi, peranti yang disokong, harga." },
        contact:     { title: "Hubungi sokongan Tracify — 24/7", description: "Perlukan bantuan? Pasukan Tracify tersedia 24/7." },
        privacy:     { title: "Dasar privasi | Tracify", description: "Bagaimana Tracify melindungi data anda." },
        terms:       { title: "Terma dan syarat | Tracify", description: "Terma penggunaan perkhidmatan Tracify." }
    },
    fil: {
        home:        { title: "Hanapin ang Anumang Telepono — I-track ang Sinuman, Kahit Saan, Kaagad | Tracify", description: "I-track ang sinuman kahit saan at hanapin ang kanilang lokasyon kaagad sa pamamagitan ng numero ng telepono. Real-time na phone tracker batay sa pahintulot. iOS + Android, walang app na kailangan. $1.47 na trial.", h1: "Hanapin ang anumang telepono, kahit saan" },
        howItWorks:  { title: "Paano gumagana ang Tracify — 3 hakbang", description: "Alamin kung paano hinahanap ng Tracify ang telepono sa tatlong hakbang: ilagay ang numero, magpadala ng SMS, matanggap ang GPS coordinates." },
        faq:         { title: "Tracify FAQ — Mga tanong tungkol sa phone tracker", description: "Mga sagot sa madalas itanong tungkol sa Tracify: paano gumagana, legalidad, privacy, mga device na sinusuportahan, presyo." },
        contact:     { title: "Makipag-ugnayan sa Tracify support — 24/7", description: "Kailangan ng tulong? Ang Tracify team ay available 24/7." },
        privacy:     { title: "Patakaran sa privacy | Tracify", description: "Kung paano pinoprotektahan ng Tracify ang iyong data." },
        terms:       { title: "Mga tuntunin at kundisyon | Tracify", description: "Mga tuntunin sa paggamit ng Tracify." }
    },
    el: {
        home:        { title: "Εντοπίστε οποιοδήποτε τηλέφωνο — Παρακολουθήστε οποιονδήποτε, οπουδήποτε, αμέσως | Tracify", description: "Παρακολουθήστε οποιονδήποτε οπουδήποτε και βρείτε τη θέση του αμέσως μέσω αριθμού τηλεφώνου. Εντοπιστής τηλεφώνου σε πραγματικό χρόνο με συναίνεση. iOS + Android, χωρίς εγκατάσταση εφαρμογής. Δοκιμή $1,47.", h1: "Εντοπίστε οποιοδήποτε τηλέφωνο, παντού" },
        howItWorks:  { title: "Πώς λειτουργεί το Tracify — 3 βήματα εντοπισμού", description: "Δείτε πώς το Tracify εντοπίζει ένα τηλέφωνο σε τρία βήματα: εισάγετε αριθμό, στείλτε SMS, λάβετε συντεταγμένες GPS." },
        faq:         { title: "Συχνές ερωτήσεις Tracify", description: "Απαντήσεις σε συχνές ερωτήσεις: πώς λειτουργεί, νομιμότητα, απόρρητο, συσκευές, τιμές." },
        contact:     { title: "Επικοινωνία με Tracify — 24/7", description: "Χρειάζεστε βοήθεια; Η ομάδα Tracify είναι διαθέσιμη 24/7." },
        privacy:     { title: "Πολιτική απορρήτου | Tracify", description: "Πώς το Tracify προστατεύει τα δεδομένα σας." },
        terms:       { title: "Όροι χρήσης | Tracify", description: "Όροι χρήσης της υπηρεσίας Tracify." }
    },
    hu: {
        home:        { title: "Találj meg bármelyik telefont — Kövess bárkit, bárhol, azonnal | Tracify", description: "Kövess bárkit bárhol, és találd meg a helyét azonnal telefonszám alapján. Beleegyezés alapú valós idejű telefon nyomkövető. iOS + Android, alkalmazás telepítés nélkül. $1,47 próba.", h1: "Találj meg bármelyik telefont, bárhol" },
        howItWorks:  { title: "Hogyan működik a Tracify — 3 lépés", description: "Ismerd meg, hogyan találja meg a Tracify a telefont három lépésben: szám megadása, SMS küldés, GPS koordináták fogadása." },
        faq:         { title: "Tracify GYIK — Telefon nyomkövető", description: "Gyakori kérdések a Tracify-ről: működés, jogszerűség, adatvédelem, támogatott eszközök, árak." },
        contact:     { title: "Tracify ügyfélszolgálat — 24/7", description: "Segítségre van szükséged? A Tracify csapat 24/7 elérhető." },
        privacy:     { title: "Adatvédelmi szabályzat | Tracify", description: "Hogyan védi a Tracify az adataidat." },
        terms:       { title: "Felhasználási feltételek | Tracify", description: "A Tracify szolgáltatás használati feltételei." }
    },
    fi: {
        home:        { title: "Paikanna mikä tahansa puhelin — Seuraa ketä tahansa, missä tahansa, heti | Tracify", description: "Seuraa ketä tahansa missä tahansa ja löydä hänen sijaintinsa heti puhelinnumeron avulla. Suostumukseen perustuva reaaliaikainen puhelimen paikannin. iOS + Android, ilman sovellusasennusta. $1,47 kokeilu.", h1: "Paikanna mikä tahansa puhelin, missä tahansa" },
        howItWorks:  { title: "Miten Tracify toimii — 3 vaihetta", description: "Tutustu, kuinka Tracify paikantaa puhelimen kolmessa vaiheessa: syötä numero, lähetä tekstiviesti, vastaanota GPS-koordinaatit." },
        faq:         { title: "Tracify UKK — Puhelimen paikannus", description: "Vastauksia usein kysyttyihin kysymyksiin: toiminta, laillisuus, yksityisyys, tuetut laitteet, hinnat." },
        contact:     { title: "Ota yhteyttä Tracifyyn — 24/7", description: "Tarvitsetko apua? Tracify-tiimi on käytettävissä ympäri vuorokauden." },
        privacy:     { title: "Tietosuojaseloste | Tracify", description: "Tracifyn tietosuojaseloste: mitä tietoja keräämme, miten niitä käytämme, miten tietosi salataan ja miten noudatamme GDPR-, CCPA- ja PECR-säädöksiä." },
        terms:       { title: "Käyttöehdot | Tracify", description: "Tracifyn käyttöehdot suostumukseen perustuvalle puhelimen paikannusalustalle: tilin käyttö, tilaukset, peruutukset, sallittu käyttö ja oikeudelliset vastuut." }
    },
    et: {
        home:        { title: "Leia iga telefon — Jälgi kedagi, kõikjal, kohe | Tracify", description: "Jälgi kedagi kõikjal ja leia tema asukoht kohe telefoninumbri järgi. Nõusolekupõhine reaalajas telefoni jälgija. iOS + Android, ilma rakenduse paigaldamiseta. $1,47 prooviperiood.", h1: "Leia iga telefon, kõikjal" },
        howItWorks:  { title: "Kuidas Tracify töötab — 3 sammu", description: "Uuri, kuidas Tracify leiab telefoni kolmes sammus: sisesta number, saada SMS, saa GPS-koordinaadid." },
        faq:         { title: "Tracify KKK — Telefoni jälgija", description: "Vastused sagedastele küsimustele Tracify kohta: toimimine, seaduslikkus, privaatsus, toetatud seadmed, hinnad." },
        contact:     { title: "Võta Tracifyga ühendust — 24/7", description: "Vajad abi? Tracify meeskond on saadaval 24/7." },
        privacy:     { title: "Privaatsuspoliitika | Tracify", description: "Kuidas Tracify sinu andmeid kaitseb." },
        terms:       { title: "Kasutustingimused | Tracify", description: "Tracify teenuse kasutustingimused." }
    },
    lv: {
        home:        { title: "Atrodiet jebkuru telefonu — Izsekojiet ikvienam, jebkur, uzreiz | Tracify", description: "Izsekojiet ikvienam jebkur un atrodiet viņa atrašanās vietu uzreiz pēc telefona numura. Uz piekrišanas balstīts reāllaika telefona izsekotājs. iOS + Android, bez lietotnes uzstādīšanas. $1,47 izmēģinājums.", h1: "Atrodiet jebkuru telefonu, jebkur" },
        howItWorks:  { title: "Kā darbojas Tracify — 3 soļi", description: "Uzziniet, kā Tracify atrod telefonu trīs soļos: ievadiet numuru, nosūtiet SMS, saņemiet GPS koordinātes." },
        faq:         { title: "Tracify BUJ — Telefonu izsekošana", description: "Atbildes uz biežāk uzdotajiem jautājumiem par Tracify." },
        contact:     { title: "Sazinieties ar Tracify — 24/7", description: "Vajadzīga palīdzība? Tracify komanda pieejama 24/7." },
        privacy:     { title: "Privātuma politika | Tracify", description: "Kā Tracify aizsargā jūsu datus." },
        terms:       { title: "Noteikumi un nosacījumi | Tracify", description: "Tracify pakalpojuma lietošanas noteikumi." }
    },
    lt: {
        home:        { title: "Raskite bet kurį telefoną — Sekite bet ką, bet kur, akimirksniu | Tracify", description: "Sekite bet ką bet kur ir akimirksniu raskite jo vietą pagal telefono numerį. Sutikimu pagrįstas realaus laiko telefono sekiklis. iOS + Android, be programėlės diegimo. $1,47 bandymas.", h1: "Raskite bet kurį telefoną, bet kur" },
        howItWorks:  { title: "Kaip veikia Tracify — 3 žingsniai", description: "Sužinokite, kaip Tracify randa telefoną trimis žingsniais: įveskite numerį, siųskite SMS, gaukite GPS koordinates." },
        faq:         { title: "Tracify DUK — Telefono sekiklis", description: "Atsakymai į dažniausius klausimus apie Tracify." },
        contact:     { title: "Susisiekite su Tracify — 24/7", description: "Reikia pagalbos? Tracify komanda pasiekiama 24/7." },
        privacy:     { title: "Privatumo politika | Tracify", description: "Kaip Tracify saugo jūsų duomenis." },
        terms:       { title: "Taisyklės ir sąlygos | Tracify", description: "Tracify paslaugos naudojimo sąlygos." }
    },
    sv: {
        home:        { title: "Hitta vilken telefon som helst — Spåra vem som helst, var som helst, direkt | Tracify", description: "Spåra vem som helst var som helst och hitta deras plats direkt via telefonnummer. Samtyckesbaserad realtids telefonspårare. iOS + Android, utan app-installation. $1,47 prov.", h1: "Hitta vilken telefon som helst, var som helst" },
        howItWorks:  { title: "Så fungerar Tracify — 3 steg", description: "Se hur Tracify hittar telefonen i tre steg: ange nummer, skicka SMS, få GPS-koordinater." },
        faq:         { title: "Tracify FAQ — Telefonspårning", description: "Svar på vanliga frågor om Tracify." },
        contact:     { title: "Kontakta Tracify — 24/7", description: "Behöver du hjälp? Tracify-teamet finns tillgängligt dygnet runt." },
        privacy:     { title: "Integritetspolicy | Tracify", description: "Hur Tracify skyddar dina data." },
        terms:       { title: "Användarvillkor | Tracify", description: "Villkor för användning av Tracify." }
    },
    no: {
        home:        { title: "Finn enhver telefon — Spor hvem som helst, hvor som helst, umiddelbart | Tracify", description: "Spor hvem som helst hvor som helst og finn deres plassering umiddelbart via telefonnummer. Samtykkebasert sanntids telefonsporer. iOS + Android, uten app-installasjon. $1,47 prøveversjon.", h1: "Finn enhver telefon, hvor som helst" },
        howItWorks:  { title: "Slik fungerer Tracify — 3 trinn", description: "Slik finner Tracify telefonen i tre trinn: oppgi nummer, send SMS, motta GPS-koordinater." },
        faq:         { title: "Tracify FAQ — Telefonsporing", description: "Svar på vanlige spørsmål om Tracify." },
        contact:     { title: "Kontakt Tracify — 24/7", description: "Trenger du hjelp? Tracify-teamet er tilgjengelig døgnet rundt." },
        privacy:     { title: "Personvernerklæring | Tracify", description: "Tracifys personvernerklæring: hva vi samler inn, hvordan vi bruker det, hvordan dataene dine krypteres, og hvordan vi overholder GDPR, CCPA og PECR." },
        terms:       { title: "Vilkår og betingelser | Tracify", description: "Tracifys vilkår for bruk av vår samtykkebaserte telefonporingsplattform: kontobruk, abonnementer, oppsigelser, tillatt bruk og juridiske ansvarsforhold." }
    },
    da: {
        home:        { title: "Find enhver telefon — Spor enhver, hvor som helst, øjeblikkeligt | Tracify", description: "Spor enhver hvor som helst og find deres placering øjeblikkeligt via telefonnummer. Samtykkebaseret realtids telefonsporer. iOS + Android, uden app-installation. $1,47 prøveperiode.", h1: "Find enhver telefon, hvor som helst" },
        howItWorks:  { title: "Sådan fungerer Tracify — 3 trin", description: "Sådan finder Tracify telefonen i tre trin: indtast nummer, send SMS, modtag GPS-koordinater." },
        faq:         { title: "Tracify FAQ — Telefonsporing", description: "Svar på ofte stillede spørgsmål om Tracify." },
        contact:     { title: "Kontakt Tracify — 24/7", description: "Brug for hjælp? Tracify-teamet er tilgængeligt døgnet rundt." },
        privacy:     { title: "Privatlivspolitik | Tracify", description: "Tracifys privatlivspolitik: hvad vi indsamler, hvordan vi bruger det, hvordan dine data krypteres, og hvordan vi overholder GDPR, CCPA og PECR." },
        terms:       { title: "Vilkår og betingelser | Tracify", description: "Tracifys servicevilkår for vores samtykkebaserede telefonporingsplatform: kontobrug, abonnementer, opsigelser, tilladt brug og juridiske ansvarsforhold." }
    },
    ro: {
        home:        { title: "Găsește orice telefon — Urmărește pe oricine, oriunde, instant | Tracify", description: "Urmărește pe oricine oriunde și găsește-i locația instant prin numărul de telefon. Urmăritor de telefon în timp real bazat pe consimțământ. iOS + Android, fără instalare aplicație. Probă $1,47.", h1: "Găsește orice telefon, oriunde" },
        howItWorks:  { title: "Cum funcționează Tracify — 3 pași", description: "Află cum localizează Tracify un telefon în trei pași: introdu numărul, trimite SMS, primește coordonate GPS." },
        faq:         { title: "Întrebări frecvente Tracify", description: "Răspunsuri la întrebări comune despre Tracify." },
        contact:     { title: "Contactează Tracify — 24/7", description: "Ai nevoie de ajutor? Echipa Tracify este disponibilă 24/7." },
        privacy:     { title: "Politica de confidențialitate | Tracify", description: "Cum protejează Tracify datele tale." },
        terms:       { title: "Termeni și condiții | Tracify", description: "Termenii de utilizare Tracify." }
    },
    bg: {
        home:        { title: "Открийте всеки телефон — Проследете всеки, навсякъде, веднага | Tracify", description: "Проследете всеки навсякъде и намерете местоположението му веднага по телефонния номер. Проследяване на телефон в реално време въз основа на съгласие. iOS + Android, без инсталиране на приложение. $1,47 пробен период.", h1: "Открийте всеки телефон, навсякъде" },
        howItWorks:  { title: "Как работи Tracify — 3 стъпки", description: "Вижте как Tracify намира телефон в три стъпки: въведете номер, изпратете SMS, получете GPS координати." },
        faq:         { title: "Tracify FAQ — Проследяване на телефон", description: "Отговори на често задавани въпроси за Tracify." },
        contact:     { title: "Контакт с Tracify — 24/7", description: "Нуждаете се от помощ? Екипът на Tracify е наличен 24/7." },
        privacy:     { title: "Политика за поверителност | Tracify", description: "Как Tracify защитава вашите данни." },
        terms:       { title: "Общи условия | Tracify", description: "Условия за ползване на Tracify." }
    },
    uk: {
        home:        { title: "Знайдіть будь-який телефон — Відстежуйте будь-кого, будь-де, миттєво | Tracify", description: "Відстежуйте будь-кого будь-де та знайдіть його місцезнаходження миттєво за номером телефону. Трекер телефону в реальному часі на основі згоди. iOS + Android, без встановлення застосунку. $1,47 пробна версія.", h1: "Знайдіть будь-який телефон, будь-де" },
        howItWorks:  { title: "Як працює Tracify — 3 кроки", description: "Дізнайтеся, як Tracify знаходить телефон за три кроки: введіть номер, надішліть SMS, отримайте GPS-координати." },
        faq:         { title: "Tracify FAQ — Відстеження телефону", description: "Відповіді на поширені запитання про Tracify." },
        contact:     { title: "Зв'язатися з Tracify — 24/7", description: "Потрібна допомога? Команда Tracify доступна 24/7." },
        privacy:     { title: "Політика конфіденційності | Tracify", description: "Політика конфіденційності Tracify: які дані ми збираємо, як їх використовуємо, як шифруємо вашу інформацію та дотримуємося вимог GDPR, CCPA і PECR." },
        terms:       { title: "Умови використання | Tracify", description: "Умови використання платформи Tracify для відстеження телефонів на основі згоди: використання акаунту, підписки, скасування, дозволене використання та юридична відповідальність." }
    },
    hr: {
        home:        { title: "Pronađite bilo koji telefon — Pratite bilo koga, bilo gdje, odmah | Tracify", description: "Pratite bilo koga bilo gdje i pronađite njegovu lokaciju odmah putem telefonskog broja. Praćenje telefona u stvarnom vremenu na temelju pristanka. iOS + Android, bez instaliranja aplikacije. $1,47 probno razdoblje.", h1: "Pronađite bilo koji telefon, bilo gdje" },
        howItWorks:  { title: "Kako Tracify radi — 3 koraka", description: "Otkrijte kako Tracify pronalazi telefon u tri koraka: unesite broj, pošaljite SMS, primite GPS koordinate." },
        faq:         { title: "Tracify FAQ — Praćenje telefona", description: "Odgovori na često postavljana pitanja o Tracify." },
        contact:     { title: "Kontaktirajte Tracify — 24/7", description: "Trebate pomoć? Tracify tim je dostupan 24/7." },
        privacy:     { title: "Politika privatnosti | Tracify", description: "Kako Tracify štiti vaše podatke." },
        terms:       { title: "Uvjeti korištenja | Tracify", description: "Uvjeti korištenja Tracify usluge." }
    },
    sr: {
        home:        { title: "Pronađite bilo koji telefon — Pratite bilo koga, bilo gde, odmah | Tracify", description: "Pratite bilo koga bilo gde i pronađite njegovu lokaciju odmah preko telefonskog broja. Praćenje telefona u realnom vremenu na osnovu saglasnosti. iOS + Android, bez instaliranja aplikacije. $1,47 probni period.", h1: "Pronađite bilo koji telefon, bilo gde" },
        howItWorks:  { title: "Kako Tracify radi — 3 koraka", description: "Saznajte kako Tracify pronalazi telefon u tri koraka." },
        faq:         { title: "Tracify FAQ — Praćenje telefona", description: "Odgovori na često postavljana pitanja o Tracify." },
        contact:     { title: "Kontaktirajte Tracify — 24/7", description: "Treba vam pomoć? Tracify tim je dostupan 24/7." },
        privacy:     { title: "Politika privatnosti | Tracify", description: "Kako Tracify štiti vaše podatke." },
        terms:       { title: "Uslovi korišćenja | Tracify", description: "Uslovi korišćenja Tracify usluge." }
    },
    sk: {
        home:        { title: "Nájdite akýkoľvek telefón — Sledujte kohokoľvek, kdekoľvek, okamžite | Tracify", description: "Sledujte kohokoľvek kdekoľvek a nájdite jeho polohu okamžite podľa telefónneho čísla. Sledovanie telefónu v reálnom čase na základe súhlasu. iOS + Android, bez inštalácie aplikácie. $1,47 skúška.", h1: "Nájdite akýkoľvek telefón, kdekoľvek" },
        howItWorks:  { title: "Ako funguje Tracify — 3 kroky", description: "Zistite, ako Tracify nájde telefón v troch krokoch: zadajte číslo, pošlite SMS, dostanete GPS súradnice." },
        faq:         { title: "Tracify FAQ — Sledovanie telefónu", description: "Odpovede na časté otázky o Tracify." },
        contact:     { title: "Kontakt s Tracify — 24/7", description: "Potrebujete pomoc? Tím Tracify je k dispozícii 24/7." },
        privacy:     { title: "Zásady ochrany osobných údajov | Tracify", description: "Zásady ochrany osobných údajov Tracify: aké údaje zhromažďujeme, ako ich používame, ako šifrujeme vaše dáta a ako dodržiavame GDPR, CCPA a PECR." },
        terms:       { title: "Obchodné podmienky | Tracify", description: "Obchodné podmienky platformy Tracify na sledovanie telefónov na základe súhlasu: používanie účtu, predplatné, zrušenie, povolené použitie a právna zodpovednosť." }
    },
    sl: {
        home:        { title: "Poiščite kateri koli telefon — Sledite komur koli, kjer koli, takoj | Tracify", description: "Sledite komur koli kjer koli in takoj poiščite njegovo lokacijo po telefonski številki. Sledenje telefona v realnem času na podlagi soglasja. iOS + Android, brez namestitve aplikacije. $1,47 preizkus.", h1: "Poiščite kateri koli telefon, kjer koli" },
        howItWorks:  { title: "Kako Tracify deluje — 3 koraki", description: "Spoznajte, kako Tracify najde telefon v treh korakih." },
        faq:         { title: "Tracify FAQ — Sledenje telefonu", description: "Odgovori na pogosta vprašanja o Tracify." },
        contact:     { title: "Kontaktirajte Tracify — 24/7", description: "Potrebujete pomoč? Tracify ekipa je na voljo 24/7." },
        privacy:     { title: "Politika zasebnosti | Tracify", description: "Kako Tracify ščiti vaše podatke." },
        terms:       { title: "Pogoji uporabe | Tracify", description: "Pogoji uporabe storitve Tracify." }
    },
    bs: {
        home:        { title: "Pronađite bilo koji telefon — Pratite bilo koga, bilo gdje, odmah | Tracify", description: "Pratite bilo koga bilo gdje i pronađite njegovu lokaciju odmah preko telefonskog broja. Praćenje telefona u realnom vremenu na osnovu saglasnosti. iOS + Android, bez instaliranja aplikacije. $1,47 probni period.", h1: "Pronađite bilo koji telefon, bilo gdje" },
        howItWorks:  { title: "Kako Tracify radi — 3 koraka", description: "Saznajte kako Tracify pronalazi telefon u tri koraka." },
        faq:         { title: "Tracify FAQ — Praćenje telefona", description: "Odgovori na često postavljana pitanja o Tracify." },
        contact:     { title: "Kontaktirajte Tracify — 24/7", description: "Treba vam pomoć? Tracify tim je dostupan 24/7." },
        privacy:     { title: "Politika privatnosti | Tracify", description: "Kako Tracify štiti vaše podatke." },
        terms:       { title: "Uslovi korištenja | Tracify", description: "Uslovi korištenja Tracify usluge." }
    },
    tk: {
        home:        { title: "Islendik telefony tapyň — Islendik ýerde, islendik adamy derrew yzarlaň | Tracify", description: "Islendik ýerde islendik adamy yzarlaň we telefon belgisi boýunça ýerleşýän ýerini derrew tapyň. Ylalaşyga esaslanýan hakyky wagtda telefon yzarlaýjy. iOS + Android, programma oturtmazdan. $1,47 synag.", h1: "Islendik telefony, islendik ýerde tapyň" },
        howItWorks:  { title: "Tracify nähili işleýär — 3 ädim", description: "Tracify telefony üç ädimde nädip tapýandygyny biliň." },
        faq:         { title: "Tracify FAQ — Telefon yzarlama", description: "Tracify barada ýygy-ýygydan berilýän soraglara jogaplar." },
        contact:     { title: "Tracify bilen habarlaşmak — 24/7", description: "Kömek gerekmi? Tracify topar 24/7 elýeterli." },
        privacy:     { title: "Gizlinlik syýasaty | Tracify", description: "Tracify maglumatlaryňyzy nädip goraýar." },
        terms:       { title: "Şertler we düzgünler | Tracify", description: "Tracify hyzmatyndan peýdalanmak şertleri." }
    },
    zu: {
        home:        { title: "Thola Noma Yiluphi Ucingo — Landelela Noma Ubani, Noma Kuphi, Ngokushesha | Tracify", description: "Landelela noma ubani noma kuphi bese uthola indawo yabo ngokushesha ngenombolo yocingo. Umlandeleli wocingo wesikhathi sangempela osekelwe emvume. i-iOS + i-Android, ngaphandle kokufaka uhlelo lokusebenza. $1.47 kuhlolwa.", h1: "Thola noma yiluphi ucingo, noma kuphi" },
        howItWorks:  { title: "Indlela Tracify esebenza ngayo — Izinyathelo ezi-3", description: "Funda indlela Tracify ekuthola ngayo ucingo ngezinyathelo ezintathu." },
        faq:         { title: "Imibuzo evame ukubuzwa ye-Tracify", description: "Izimpendulo zemibuzo evame ukubuzwa nge-Tracify." },
        contact:     { title: "Xhumana neTracify — 24/7", description: "Udinga usizo? Ithimba leTracify liyatholakala 24/7." },
        privacy:     { title: "Inqubomgomo Yobumfihlo | Tracify", description: "Indlela iTracify evikela ngayo idatha yakho." },
        terms:       { title: "Imigomo Nemibandela | Tracify", description: "Imigomo yokusebenzisa iTracify." }
    }
};

function build(lang) {
    const page = L10N[lang] || {};
    const pages = {};
    for (const key of ['home','howItWorks','faq','contact','privacy','terms']) {
        const src = page[key];
        if (!src) continue;
        pages[key] = {
            title: src.title,
            description: src.description,
            ogTitle: src.title,
            ogDesc: src.description,
            h1: src.h1 || ''
        };
    }
    return { lang, pages };
}

// Write out all 44 language files
const allLangs = Object.keys(L10N);
let count = 0;
for (const lang of allLangs) {
    const data = build(lang);
    const file = path.join(OUT_DIR, `${lang}.json`);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    count++;
}
console.log(`Wrote ${count} SEO translation files to ${OUT_DIR}`);
