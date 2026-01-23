/**
 * Script to add modal translations to all language files
 * Run with: node scripts/add-modal-translations.js
 */

const fs = require('fs');
const path = require('path');

const translationsDir = path.join(__dirname, '../public/translations');

// Modal translations for each language
const modalTranslations = {
  en: {
    modal: {
      signup: {
        title: "Enter Your Email",
        subtitle: "We'll send your account password to this email address.",
        emailPlaceholder: "your@email.com",
        agreeText: "I agree to receive promotional emails and updates from Tracify",
        agreeRequired: "*",
        continueBtn: "Continue",
        termsText: "By continuing, you agree to our",
        termsLink: "Terms of Service",
        and: "and",
        privacyLink: "Privacy Policy",
        or: "or",
        hasAccount: "Already have an account?",
        loginLink: "Log in",
        creatingAccount: "Creating account...",
        accountCreated: "Account created!",
        yourPassword: "Your password:",
        savePassword: "Save this password! Redirecting to payment..."
      },
      login: {
        title: "Welcome Back",
        subtitle: "Log in to your Tracify account",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "Password",
        loginBtn: "Log In",
        loggingIn: "Logging in...",
        loginSuccess: "Login successful! Redirecting...",
        or: "or",
        noAccount: "Don't have an account?",
        signupLink: "Sign up"
      },
      errors: {
        connectionError: "Connection error. Please try again.",
        accountCreationFailed: "Failed to create account",
        loginFailed: "Login failed"
      }
    }
  },
  es: {
    modal: {
      signup: {
        title: "Ingresa tu correo electrónico",
        subtitle: "Enviaremos la contraseña de tu cuenta a esta dirección de correo.",
        emailPlaceholder: "tu@email.com",
        agreeText: "Acepto recibir correos promocionales y actualizaciones de Tracify",
        agreeRequired: "*",
        continueBtn: "Continuar",
        termsText: "Al continuar, aceptas nuestros",
        termsLink: "Términos de servicio",
        and: "y",
        privacyLink: "Política de privacidad",
        or: "o",
        hasAccount: "¿Ya tienes una cuenta?",
        loginLink: "Iniciar sesión",
        creatingAccount: "Creando cuenta...",
        accountCreated: "¡Cuenta creada!",
        yourPassword: "Tu contraseña:",
        savePassword: "¡Guarda esta contraseña! Redirigiendo al pago..."
      },
      login: {
        title: "Bienvenido de nuevo",
        subtitle: "Inicia sesión en tu cuenta de Tracify",
        emailPlaceholder: "tu@email.com",
        passwordPlaceholder: "Contraseña",
        loginBtn: "Iniciar sesión",
        loggingIn: "Iniciando sesión...",
        loginSuccess: "¡Inicio de sesión exitoso! Redirigiendo...",
        or: "o",
        noAccount: "¿No tienes una cuenta?",
        signupLink: "Regístrate"
      },
      errors: {
        connectionError: "Error de conexión. Por favor, inténtalo de nuevo.",
        accountCreationFailed: "Error al crear la cuenta",
        loginFailed: "Error de inicio de sesión"
      }
    }
  },
  fr: {
    modal: {
      signup: {
        title: "Entrez votre e-mail",
        subtitle: "Nous enverrons le mot de passe de votre compte à cette adresse e-mail.",
        emailPlaceholder: "votre@email.com",
        agreeText: "J'accepte de recevoir des e-mails promotionnels et des mises à jour de Tracify",
        agreeRequired: "*",
        continueBtn: "Continuer",
        termsText: "En continuant, vous acceptez nos",
        termsLink: "Conditions d'utilisation",
        and: "et",
        privacyLink: "Politique de confidentialité",
        or: "ou",
        hasAccount: "Vous avez déjà un compte?",
        loginLink: "Connexion",
        creatingAccount: "Création du compte...",
        accountCreated: "Compte créé!",
        yourPassword: "Votre mot de passe:",
        savePassword: "Enregistrez ce mot de passe! Redirection vers le paiement..."
      },
      login: {
        title: "Bon retour",
        subtitle: "Connectez-vous à votre compte Tracify",
        emailPlaceholder: "votre@email.com",
        passwordPlaceholder: "Mot de passe",
        loginBtn: "Connexion",
        loggingIn: "Connexion en cours...",
        loginSuccess: "Connexion réussie! Redirection...",
        or: "ou",
        noAccount: "Vous n'avez pas de compte?",
        signupLink: "S'inscrire"
      },
      errors: {
        connectionError: "Erreur de connexion. Veuillez réessayer.",
        accountCreationFailed: "Échec de la création du compte",
        loginFailed: "Échec de la connexion"
      }
    }
  },
  de: {
    modal: {
      signup: {
        title: "E-Mail eingeben",
        subtitle: "Wir senden Ihr Kontopasswort an diese E-Mail-Adresse.",
        emailPlaceholder: "ihre@email.com",
        agreeText: "Ich stimme dem Erhalt von Werbe-E-Mails und Updates von Tracify zu",
        agreeRequired: "*",
        continueBtn: "Fortfahren",
        termsText: "Mit dem Fortfahren akzeptieren Sie unsere",
        termsLink: "Nutzungsbedingungen",
        and: "und",
        privacyLink: "Datenschutzrichtlinie",
        or: "oder",
        hasAccount: "Bereits ein Konto?",
        loginLink: "Anmelden",
        creatingAccount: "Konto wird erstellt...",
        accountCreated: "Konto erstellt!",
        yourPassword: "Ihr Passwort:",
        savePassword: "Speichern Sie dieses Passwort! Weiterleitung zur Zahlung..."
      },
      login: {
        title: "Willkommen zurück",
        subtitle: "Melden Sie sich bei Ihrem Tracify-Konto an",
        emailPlaceholder: "ihre@email.com",
        passwordPlaceholder: "Passwort",
        loginBtn: "Anmelden",
        loggingIn: "Anmeldung läuft...",
        loginSuccess: "Anmeldung erfolgreich! Weiterleitung...",
        or: "oder",
        noAccount: "Kein Konto?",
        signupLink: "Registrieren"
      },
      errors: {
        connectionError: "Verbindungsfehler. Bitte versuchen Sie es erneut.",
        accountCreationFailed: "Kontoerstellung fehlgeschlagen",
        loginFailed: "Anmeldung fehlgeschlagen"
      }
    }
  },
  it: {
    modal: {
      signup: {
        title: "Inserisci la tua email",
        subtitle: "Invieremo la password del tuo account a questo indirizzo email.",
        emailPlaceholder: "tua@email.com",
        agreeText: "Accetto di ricevere email promozionali e aggiornamenti da Tracify",
        agreeRequired: "*",
        continueBtn: "Continua",
        termsText: "Continuando, accetti i nostri",
        termsLink: "Termini di servizio",
        and: "e",
        privacyLink: "Informativa sulla privacy",
        or: "o",
        hasAccount: "Hai già un account?",
        loginLink: "Accedi",
        creatingAccount: "Creazione account...",
        accountCreated: "Account creato!",
        yourPassword: "La tua password:",
        savePassword: "Salva questa password! Reindirizzamento al pagamento..."
      },
      login: {
        title: "Bentornato",
        subtitle: "Accedi al tuo account Tracify",
        emailPlaceholder: "tua@email.com",
        passwordPlaceholder: "Password",
        loginBtn: "Accedi",
        loggingIn: "Accesso in corso...",
        loginSuccess: "Accesso riuscito! Reindirizzamento...",
        or: "o",
        noAccount: "Non hai un account?",
        signupLink: "Registrati"
      },
      errors: {
        connectionError: "Errore di connessione. Riprova.",
        accountCreationFailed: "Creazione account fallita",
        loginFailed: "Accesso fallito"
      }
    }
  },
  pt: {
    modal: {
      signup: {
        title: "Digite seu e-mail",
        subtitle: "Enviaremos a senha da sua conta para este endereço de e-mail.",
        emailPlaceholder: "seu@email.com",
        agreeText: "Concordo em receber e-mails promocionais e atualizações do Tracify",
        agreeRequired: "*",
        continueBtn: "Continuar",
        termsText: "Ao continuar, você concorda com nossos",
        termsLink: "Termos de serviço",
        and: "e",
        privacyLink: "Política de privacidade",
        or: "ou",
        hasAccount: "Já tem uma conta?",
        loginLink: "Entrar",
        creatingAccount: "Criando conta...",
        accountCreated: "Conta criada!",
        yourPassword: "Sua senha:",
        savePassword: "Salve esta senha! Redirecionando para pagamento..."
      },
      login: {
        title: "Bem-vindo de volta",
        subtitle: "Entre na sua conta Tracify",
        emailPlaceholder: "seu@email.com",
        passwordPlaceholder: "Senha",
        loginBtn: "Entrar",
        loggingIn: "Entrando...",
        loginSuccess: "Login bem-sucedido! Redirecionando...",
        or: "ou",
        noAccount: "Não tem uma conta?",
        signupLink: "Cadastre-se"
      },
      errors: {
        connectionError: "Erro de conexão. Tente novamente.",
        accountCreationFailed: "Falha ao criar conta",
        loginFailed: "Falha no login"
      }
    }
  },
  pt_BR: {
    modal: {
      signup: {
        title: "Digite seu e-mail",
        subtitle: "Enviaremos a senha da sua conta para este endereço de e-mail.",
        emailPlaceholder: "seu@email.com",
        agreeText: "Concordo em receber e-mails promocionais e atualizações do Tracify",
        agreeRequired: "*",
        continueBtn: "Continuar",
        termsText: "Ao continuar, você concorda com nossos",
        termsLink: "Termos de serviço",
        and: "e",
        privacyLink: "Política de privacidade",
        or: "ou",
        hasAccount: "Já tem uma conta?",
        loginLink: "Entrar",
        creatingAccount: "Criando conta...",
        accountCreated: "Conta criada!",
        yourPassword: "Sua senha:",
        savePassword: "Salve esta senha! Redirecionando para pagamento..."
      },
      login: {
        title: "Bem-vindo de volta",
        subtitle: "Entre na sua conta Tracify",
        emailPlaceholder: "seu@email.com",
        passwordPlaceholder: "Senha",
        loginBtn: "Entrar",
        loggingIn: "Entrando...",
        loginSuccess: "Login bem-sucedido! Redirecionando...",
        or: "ou",
        noAccount: "Não tem uma conta?",
        signupLink: "Cadastre-se"
      },
      errors: {
        connectionError: "Erro de conexão. Tente novamente.",
        accountCreationFailed: "Falha ao criar conta",
        loginFailed: "Falha no login"
      }
    }
  },
  nl: {
    modal: {
      signup: {
        title: "Voer uw e-mail in",
        subtitle: "We sturen uw accountwachtwoord naar dit e-mailadres.",
        emailPlaceholder: "uw@email.com",
        agreeText: "Ik ga akkoord met het ontvangen van promotionele e-mails en updates van Tracify",
        agreeRequired: "*",
        continueBtn: "Doorgaan",
        termsText: "Door door te gaan, gaat u akkoord met onze",
        termsLink: "Servicevoorwaarden",
        and: "en",
        privacyLink: "Privacybeleid",
        or: "of",
        hasAccount: "Heeft u al een account?",
        loginLink: "Inloggen",
        creatingAccount: "Account aanmaken...",
        accountCreated: "Account aangemaakt!",
        yourPassword: "Uw wachtwoord:",
        savePassword: "Bewaar dit wachtwoord! Doorsturen naar betaling..."
      },
      login: {
        title: "Welkom terug",
        subtitle: "Log in op uw Tracify-account",
        emailPlaceholder: "uw@email.com",
        passwordPlaceholder: "Wachtwoord",
        loginBtn: "Inloggen",
        loggingIn: "Inloggen...",
        loginSuccess: "Succesvol ingelogd! Doorsturen...",
        or: "of",
        noAccount: "Geen account?",
        signupLink: "Aanmelden"
      },
      errors: {
        connectionError: "Verbindingsfout. Probeer het opnieuw.",
        accountCreationFailed: "Account aanmaken mislukt",
        loginFailed: "Inloggen mislukt"
      }
    }
  },
  ru: {
    modal: {
      signup: {
        title: "Введите вашу электронную почту",
        subtitle: "Мы отправим пароль вашей учетной записи на этот адрес электронной почты.",
        emailPlaceholder: "ваш@email.com",
        agreeText: "Я согласен получать рекламные письма и обновления от Tracify",
        agreeRequired: "*",
        continueBtn: "Продолжить",
        termsText: "Продолжая, вы соглашаетесь с нашими",
        termsLink: "Условиями обслуживания",
        and: "и",
        privacyLink: "Политикой конфиденциальности",
        or: "или",
        hasAccount: "Уже есть аккаунт?",
        loginLink: "Войти",
        creatingAccount: "Создание аккаунта...",
        accountCreated: "Аккаунт создан!",
        yourPassword: "Ваш пароль:",
        savePassword: "Сохраните этот пароль! Перенаправление на оплату..."
      },
      login: {
        title: "С возвращением",
        subtitle: "Войдите в свой аккаунт Tracify",
        emailPlaceholder: "ваш@email.com",
        passwordPlaceholder: "Пароль",
        loginBtn: "Войти",
        loggingIn: "Вход...",
        loginSuccess: "Вход выполнен успешно! Перенаправление...",
        or: "или",
        noAccount: "Нет аккаунта?",
        signupLink: "Зарегистрироваться"
      },
      errors: {
        connectionError: "Ошибка соединения. Пожалуйста, попробуйте еще раз.",
        accountCreationFailed: "Не удалось создать аккаунт",
        loginFailed: "Ошибка входа"
      }
    }
  },
  ja: {
    modal: {
      signup: {
        title: "メールアドレスを入力",
        subtitle: "アカウントのパスワードをこのメールアドレスに送信します。",
        emailPlaceholder: "your@email.com",
        agreeText: "Tracifyからのプロモーションメールとアップデートの受信に同意します",
        agreeRequired: "*",
        continueBtn: "続ける",
        termsText: "続行することで、当社の",
        termsLink: "利用規約",
        and: "および",
        privacyLink: "プライバシーポリシー",
        or: "または",
        hasAccount: "すでにアカウントをお持ちですか？",
        loginLink: "ログイン",
        creatingAccount: "アカウント作成中...",
        accountCreated: "アカウントが作成されました！",
        yourPassword: "パスワード：",
        savePassword: "このパスワードを保存してください！支払いページにリダイレクトします..."
      },
      login: {
        title: "おかえりなさい",
        subtitle: "Tracifyアカウントにログイン",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "パスワード",
        loginBtn: "ログイン",
        loggingIn: "ログイン中...",
        loginSuccess: "ログイン成功！リダイレクト中...",
        or: "または",
        noAccount: "アカウントをお持ちでないですか？",
        signupLink: "新規登録"
      },
      errors: {
        connectionError: "接続エラー。もう一度お試しください。",
        accountCreationFailed: "アカウントの作成に失敗しました",
        loginFailed: "ログインに失敗しました"
      }
    }
  },
  ko: {
    modal: {
      signup: {
        title: "이메일을 입력하세요",
        subtitle: "계정 비밀번호를 이 이메일 주소로 보내드립니다.",
        emailPlaceholder: "your@email.com",
        agreeText: "Tracify의 프로모션 이메일 및 업데이트 수신에 동의합니다",
        agreeRequired: "*",
        continueBtn: "계속",
        termsText: "계속하시면 당사의",
        termsLink: "서비스 약관",
        and: "및",
        privacyLink: "개인정보 보호정책",
        or: "또는",
        hasAccount: "이미 계정이 있으신가요?",
        loginLink: "로그인",
        creatingAccount: "계정 생성 중...",
        accountCreated: "계정이 생성되었습니다!",
        yourPassword: "비밀번호:",
        savePassword: "이 비밀번호를 저장하세요! 결제 페이지로 이동합니다..."
      },
      login: {
        title: "다시 오신 것을 환영합니다",
        subtitle: "Tracify 계정에 로그인",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "비밀번호",
        loginBtn: "로그인",
        loggingIn: "로그인 중...",
        loginSuccess: "로그인 성공! 리디렉션 중...",
        or: "또는",
        noAccount: "계정이 없으신가요?",
        signupLink: "가입하기"
      },
      errors: {
        connectionError: "연결 오류. 다시 시도해주세요.",
        accountCreationFailed: "계정 생성 실패",
        loginFailed: "로그인 실패"
      }
    }
  },
  zh: {
    modal: {
      signup: {
        title: "输入您的电子邮件",
        subtitle: "我们将把您的账户密码发送到此电子邮件地址。",
        emailPlaceholder: "your@email.com",
        agreeText: "我同意接收Tracify的促销邮件和更新",
        agreeRequired: "*",
        continueBtn: "继续",
        termsText: "继续即表示您同意我们的",
        termsLink: "服务条款",
        and: "和",
        privacyLink: "隐私政策",
        or: "或",
        hasAccount: "已有账户？",
        loginLink: "登录",
        creatingAccount: "正在创建账户...",
        accountCreated: "账户已创建！",
        yourPassword: "您的密码：",
        savePassword: "请保存此密码！正在跳转到支付页面..."
      },
      login: {
        title: "欢迎回来",
        subtitle: "登录您的Tracify账户",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "密码",
        loginBtn: "登录",
        loggingIn: "正在登录...",
        loginSuccess: "登录成功！正在跳转...",
        or: "或",
        noAccount: "没有账户？",
        signupLink: "注册"
      },
      errors: {
        connectionError: "连接错误，请重试。",
        accountCreationFailed: "创建账户失败",
        loginFailed: "登录失败"
      }
    }
  },
  "zh-TW": {
    modal: {
      signup: {
        title: "輸入您的電子郵件",
        subtitle: "我們將把您的帳戶密碼發送到此電子郵件地址。",
        emailPlaceholder: "your@email.com",
        agreeText: "我同意接收Tracify的促銷郵件和更新",
        agreeRequired: "*",
        continueBtn: "繼續",
        termsText: "繼續即表示您同意我們的",
        termsLink: "服務條款",
        and: "和",
        privacyLink: "隱私政策",
        or: "或",
        hasAccount: "已有帳戶？",
        loginLink: "登入",
        creatingAccount: "正在創建帳戶...",
        accountCreated: "帳戶已創建！",
        yourPassword: "您的密碼：",
        savePassword: "請保存此密碼！正在跳轉到付款頁面..."
      },
      login: {
        title: "歡迎回來",
        subtitle: "登入您的Tracify帳戶",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "密碼",
        loginBtn: "登入",
        loggingIn: "正在登入...",
        loginSuccess: "登入成功！正在跳轉...",
        or: "或",
        noAccount: "沒有帳戶？",
        signupLink: "註冊"
      },
      errors: {
        connectionError: "連接錯誤，請重試。",
        accountCreationFailed: "創建帳戶失敗",
        loginFailed: "登入失敗"
      }
    }
  },
  zh_HK: {
    modal: {
      signup: {
        title: "輸入您的電郵",
        subtitle: "我們會將帳戶密碼發送到此電郵地址。",
        emailPlaceholder: "your@email.com",
        agreeText: "我同意接收Tracify的推廣電郵及更新",
        agreeRequired: "*",
        continueBtn: "繼續",
        termsText: "繼續即表示您同意我們的",
        termsLink: "服務條款",
        and: "及",
        privacyLink: "私隱政策",
        or: "或",
        hasAccount: "已有帳戶？",
        loginLink: "登入",
        creatingAccount: "正在建立帳戶...",
        accountCreated: "帳戶已建立！",
        yourPassword: "您的密碼：",
        savePassword: "請保存此密碼！正在跳轉到付款頁面..."
      },
      login: {
        title: "歡迎返嚟",
        subtitle: "登入您的Tracify帳戶",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "密碼",
        loginBtn: "登入",
        loggingIn: "正在登入...",
        loginSuccess: "登入成功！正在跳轉...",
        or: "或",
        noAccount: "冇帳戶？",
        signupLink: "註冊"
      },
      errors: {
        connectionError: "連接錯誤，請重試。",
        accountCreationFailed: "建立帳戶失敗",
        loginFailed: "登入失敗"
      }
    }
  },
  ar: {
    modal: {
      signup: {
        title: "أدخل بريدك الإلكتروني",
        subtitle: "سنرسل كلمة مرور حسابك إلى هذا البريد الإلكتروني.",
        emailPlaceholder: "your@email.com",
        agreeText: "أوافق على تلقي رسائل البريد الإلكتروني الترويجية والتحديثات من Tracify",
        agreeRequired: "*",
        continueBtn: "متابعة",
        termsText: "بالمتابعة، أنت توافق على",
        termsLink: "شروط الخدمة",
        and: "و",
        privacyLink: "سياسة الخصوصية",
        or: "أو",
        hasAccount: "لديك حساب بالفعل؟",
        loginLink: "تسجيل الدخول",
        creatingAccount: "جاري إنشاء الحساب...",
        accountCreated: "تم إنشاء الحساب!",
        yourPassword: "كلمة المرور الخاصة بك:",
        savePassword: "احفظ كلمة المرور هذه! جاري التحويل إلى الدفع..."
      },
      login: {
        title: "مرحباً بعودتك",
        subtitle: "سجل الدخول إلى حسابك في Tracify",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "كلمة المرور",
        loginBtn: "تسجيل الدخول",
        loggingIn: "جاري تسجيل الدخول...",
        loginSuccess: "تم تسجيل الدخول بنجاح! جاري التحويل...",
        or: "أو",
        noAccount: "ليس لديك حساب؟",
        signupLink: "إنشاء حساب"
      },
      errors: {
        connectionError: "خطأ في الاتصال. يرجى المحاولة مرة أخرى.",
        accountCreationFailed: "فشل إنشاء الحساب",
        loginFailed: "فشل تسجيل الدخول"
      }
    }
  },
  he: {
    modal: {
      signup: {
        title: "הזן את האימייל שלך",
        subtitle: "נשלח את סיסמת החשבון שלך לכתובת אימייל זו.",
        emailPlaceholder: "your@email.com",
        agreeText: "אני מסכים לקבל אימיילים שיווקיים ועדכונים מ-Tracify",
        agreeRequired: "*",
        continueBtn: "המשך",
        termsText: "בהמשך, אתה מסכים ל",
        termsLink: "תנאי השירות",
        and: "ו",
        privacyLink: "מדיניות הפרטיות",
        or: "או",
        hasAccount: "כבר יש לך חשבון?",
        loginLink: "התחבר",
        creatingAccount: "יוצר חשבון...",
        accountCreated: "החשבון נוצר!",
        yourPassword: "הסיסמה שלך:",
        savePassword: "שמור את הסיסמה הזו! מעביר לתשלום..."
      },
      login: {
        title: "ברוך שובך",
        subtitle: "התחבר לחשבון Tracify שלך",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "סיסמה",
        loginBtn: "התחבר",
        loggingIn: "מתחבר...",
        loginSuccess: "ההתחברות הצליחה! מעביר...",
        or: "או",
        noAccount: "אין לך חשבון?",
        signupLink: "הרשם"
      },
      errors: {
        connectionError: "שגיאת חיבור. אנא נסה שוב.",
        accountCreationFailed: "יצירת חשבון נכשלה",
        loginFailed: "ההתחברות נכשלה"
      }
    }
  },
  tr: {
    modal: {
      signup: {
        title: "E-postanızı girin",
        subtitle: "Hesap şifrenizi bu e-posta adresine göndereceğiz.",
        emailPlaceholder: "your@email.com",
        agreeText: "Tracify'dan promosyon e-postaları ve güncellemeler almayı kabul ediyorum",
        agreeRequired: "*",
        continueBtn: "Devam",
        termsText: "Devam ederek,",
        termsLink: "Hizmet Şartları",
        and: "ve",
        privacyLink: "Gizlilik Politikası",
        or: "veya",
        hasAccount: "Zaten hesabınız var mı?",
        loginLink: "Giriş yap",
        creatingAccount: "Hesap oluşturuluyor...",
        accountCreated: "Hesap oluşturuldu!",
        yourPassword: "Şifreniz:",
        savePassword: "Bu şifreyi kaydedin! Ödeme sayfasına yönlendiriliyorsunuz..."
      },
      login: {
        title: "Tekrar hoş geldiniz",
        subtitle: "Tracify hesabınıza giriş yapın",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "Şifre",
        loginBtn: "Giriş Yap",
        loggingIn: "Giriş yapılıyor...",
        loginSuccess: "Giriş başarılı! Yönlendiriliyorsunuz...",
        or: "veya",
        noAccount: "Hesabınız yok mu?",
        signupLink: "Kaydol"
      },
      errors: {
        connectionError: "Bağlantı hatası. Lütfen tekrar deneyin.",
        accountCreationFailed: "Hesap oluşturulamadı",
        loginFailed: "Giriş başarısız"
      }
    }
  },
  hi: {
    modal: {
      signup: {
        title: "अपना ईमेल दर्ज करें",
        subtitle: "हम आपके खाते का पासवर्ड इस ईमेल पते पर भेजेंगे।",
        emailPlaceholder: "your@email.com",
        agreeText: "मैं Tracify से प्रचार ईमेल और अपडेट प्राप्त करने के लिए सहमत हूं",
        agreeRequired: "*",
        continueBtn: "जारी रखें",
        termsText: "जारी रखकर, आप हमारी",
        termsLink: "सेवा की शर्तें",
        and: "और",
        privacyLink: "गोपनीयता नीति",
        or: "या",
        hasAccount: "पहले से खाता है?",
        loginLink: "लॉग इन करें",
        creatingAccount: "खाता बनाया जा रहा है...",
        accountCreated: "खाता बन गया!",
        yourPassword: "आपका पासवर्ड:",
        savePassword: "इस पासवर्ड को सहेजें! भुगतान पर रीडायरेक्ट हो रहा है..."
      },
      login: {
        title: "वापस स्वागत है",
        subtitle: "अपने Tracify खाते में लॉग इन करें",
        emailPlaceholder: "your@email.com",
        passwordPlaceholder: "पासवर्ड",
        loginBtn: "लॉग इन करें",
        loggingIn: "लॉग इन हो रहा है...",
        loginSuccess: "लॉगिन सफल! रीडायरेक्ट हो रहा है...",
        or: "या",
        noAccount: "खाता नहीं है?",
        signupLink: "साइन अप करें"
      },
      errors: {
        connectionError: "कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।",
        accountCreationFailed: "खाता बनाने में विफल",
        loginFailed: "लॉगिन विफल"
      }
    }
  },
  pl: {
    modal: {
      signup: {
        title: "Wprowadź swój e-mail",
        subtitle: "Wyślemy hasło do Twojego konta na ten adres e-mail.",
        emailPlaceholder: "twoj@email.com",
        agreeText: "Zgadzam się na otrzymywanie e-maili promocyjnych i aktualizacji od Tracify",
        agreeRequired: "*",
        continueBtn: "Kontynuuj",
        termsText: "Kontynuując, zgadzasz się z naszymi",
        termsLink: "Warunkami korzystania",
        and: "i",
        privacyLink: "Polityką prywatności",
        or: "lub",
        hasAccount: "Masz już konto?",
        loginLink: "Zaloguj się",
        creatingAccount: "Tworzenie konta...",
        accountCreated: "Konto utworzone!",
        yourPassword: "Twoje hasło:",
        savePassword: "Zapisz to hasło! Przekierowanie do płatności..."
      },
      login: {
        title: "Witaj ponownie",
        subtitle: "Zaloguj się do swojego konta Tracify",
        emailPlaceholder: "twoj@email.com",
        passwordPlaceholder: "Hasło",
        loginBtn: "Zaloguj się",
        loggingIn: "Logowanie...",
        loginSuccess: "Logowanie pomyślne! Przekierowanie...",
        or: "lub",
        noAccount: "Nie masz konta?",
        signupLink: "Zarejestruj się"
      },
      errors: {
        connectionError: "Błąd połączenia. Spróbuj ponownie.",
        accountCreationFailed: "Nie udało się utworzyć konta",
        loginFailed: "Logowanie nie powiodło się"
      }
    }
  },
  sv: {
    modal: {
      signup: {
        title: "Ange din e-post",
        subtitle: "Vi skickar ditt kontolösenord till denna e-postadress.",
        emailPlaceholder: "din@email.com",
        agreeText: "Jag godkänner att ta emot kampanjmejl och uppdateringar från Tracify",
        agreeRequired: "*",
        continueBtn: "Fortsätt",
        termsText: "Genom att fortsätta godkänner du våra",
        termsLink: "Användarvillkor",
        and: "och",
        privacyLink: "Integritetspolicy",
        or: "eller",
        hasAccount: "Har du redan ett konto?",
        loginLink: "Logga in",
        creatingAccount: "Skapar konto...",
        accountCreated: "Konto skapat!",
        yourPassword: "Ditt lösenord:",
        savePassword: "Spara detta lösenord! Omdirigerar till betalning..."
      },
      login: {
        title: "Välkommen tillbaka",
        subtitle: "Logga in på ditt Tracify-konto",
        emailPlaceholder: "din@email.com",
        passwordPlaceholder: "Lösenord",
        loginBtn: "Logga in",
        loggingIn: "Loggar in...",
        loginSuccess: "Inloggning lyckades! Omdirigerar...",
        or: "eller",
        noAccount: "Inget konto?",
        signupLink: "Registrera dig"
      },
      errors: {
        connectionError: "Anslutningsfel. Försök igen.",
        accountCreationFailed: "Det gick inte att skapa kontot",
        loginFailed: "Inloggningen misslyckades"
      }
    }
  },
  no: {
    modal: {
      signup: {
        title: "Skriv inn e-posten din",
        subtitle: "Vi sender kontopassordet ditt til denne e-postadressen.",
        emailPlaceholder: "din@email.com",
        agreeText: "Jeg godtar å motta kampanje-e-poster og oppdateringer fra Tracify",
        agreeRequired: "*",
        continueBtn: "Fortsett",
        termsText: "Ved å fortsette godtar du våre",
        termsLink: "Tjenestevilkår",
        and: "og",
        privacyLink: "Personvernregler",
        or: "eller",
        hasAccount: "Har du allerede en konto?",
        loginLink: "Logg inn",
        creatingAccount: "Oppretter konto...",
        accountCreated: "Konto opprettet!",
        yourPassword: "Ditt passord:",
        savePassword: "Lagre dette passordet! Omdirigerer til betaling..."
      },
      login: {
        title: "Velkommen tilbake",
        subtitle: "Logg inn på Tracify-kontoen din",
        emailPlaceholder: "din@email.com",
        passwordPlaceholder: "Passord",
        loginBtn: "Logg inn",
        loggingIn: "Logger inn...",
        loginSuccess: "Innlogging vellykket! Omdirigerer...",
        or: "eller",
        noAccount: "Ingen konto?",
        signupLink: "Registrer deg"
      },
      errors: {
        connectionError: "Tilkoblingsfeil. Prøv igjen.",
        accountCreationFailed: "Kunne ikke opprette konto",
        loginFailed: "Innlogging mislyktes"
      }
    }
  },
  da: {
    modal: {
      signup: {
        title: "Indtast din e-mail",
        subtitle: "Vi sender din kontoadgangskode til denne e-mailadresse.",
        emailPlaceholder: "din@email.com",
        agreeText: "Jeg accepterer at modtage kampagne-e-mails og opdateringer fra Tracify",
        agreeRequired: "*",
        continueBtn: "Fortsæt",
        termsText: "Ved at fortsætte accepterer du vores",
        termsLink: "Servicevilkår",
        and: "og",
        privacyLink: "Privatlivspolitik",
        or: "eller",
        hasAccount: "Har du allerede en konto?",
        loginLink: "Log ind",
        creatingAccount: "Opretter konto...",
        accountCreated: "Konto oprettet!",
        yourPassword: "Din adgangskode:",
        savePassword: "Gem denne adgangskode! Omdirigerer til betaling..."
      },
      login: {
        title: "Velkommen tilbage",
        subtitle: "Log ind på din Tracify-konto",
        emailPlaceholder: "din@email.com",
        passwordPlaceholder: "Adgangskode",
        loginBtn: "Log ind",
        loggingIn: "Logger ind...",
        loginSuccess: "Login lykkedes! Omdirigerer...",
        or: "eller",
        noAccount: "Ingen konto?",
        signupLink: "Tilmeld dig"
      },
      errors: {
        connectionError: "Forbindelsesfejl. Prøv igen.",
        accountCreationFailed: "Kunne ikke oprette konto",
        loginFailed: "Login mislykkedes"
      }
    }
  },
  fi: {
    modal: {
      signup: {
        title: "Syötä sähköpostiosoitteesi",
        subtitle: "Lähetämme tilisi salasanan tähän sähköpostiosoitteeseen.",
        emailPlaceholder: "sinun@email.com",
        agreeText: "Hyväksyn vastaanottavani Tracifyn mainosviestejä ja päivityksiä",
        agreeRequired: "*",
        continueBtn: "Jatka",
        termsText: "Jatkamalla hyväksyt",
        termsLink: "Käyttöehdot",
        and: "ja",
        privacyLink: "Tietosuojakäytännön",
        or: "tai",
        hasAccount: "Onko sinulla jo tili?",
        loginLink: "Kirjaudu sisään",
        creatingAccount: "Luodaan tiliä...",
        accountCreated: "Tili luotu!",
        yourPassword: "Salasanasi:",
        savePassword: "Tallenna tämä salasana! Ohjataan maksuun..."
      },
      login: {
        title: "Tervetuloa takaisin",
        subtitle: "Kirjaudu Tracify-tilillesi",
        emailPlaceholder: "sinun@email.com",
        passwordPlaceholder: "Salasana",
        loginBtn: "Kirjaudu",
        loggingIn: "Kirjaudutaan...",
        loginSuccess: "Kirjautuminen onnistui! Ohjataan...",
        or: "tai",
        noAccount: "Ei tiliä?",
        signupLink: "Rekisteröidy"
      },
      errors: {
        connectionError: "Yhteysvirhe. Yritä uudelleen.",
        accountCreationFailed: "Tilin luominen epäonnistui",
        loginFailed: "Kirjautuminen epäonnistui"
      }
    }
  }
};

// Default fallback for languages without specific translations (uses English)
const defaultModal = modalTranslations.en.modal;

// Process each translation file
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const filePath = path.join(translationsDir, file);
  const langCode = file.replace('.json', '');

  try {
    // Read existing translations
    const content = fs.readFileSync(filePath, 'utf8');
    const translations = JSON.parse(content);

    // Skip if modal already exists
    if (translations.modal) {
      console.log(`Skipping ${file} - modal translations already exist`);
      return;
    }

    // Get language-specific modal translations or use default
    const modalContent = modalTranslations[langCode]?.modal || defaultModal;

    // Add modal translations
    translations.modal = modalContent;

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(translations, null, 2) + '\n', 'utf8');
    console.log(`Updated ${file} with modal translations`);

  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('\nDone! Modal translations added to all language files.');
