export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export type Dict = {
  'brand.name': string;
  'brand.tagline': string;
  'nav.label': string;
  'nav.features': string;
  'nav.how': string;
  'nav.signIn': string;
  'nav.start': string;
  'nav.langLabel': string;
  'nav.skip': string;
  'nav.dashboard': string;
  'nav.profile': string;
  'nav.explore': string;
  'nav.myEvents': string;
  'nav.events': string;
  'nav.sessions': string;
  'nav.search': string;
  'nav.settings': string;
  'nav.openMenu': string;
  'nav.closeMenu': string;
  'dashboard.eyebrow': string;
  'dashboard.quick': string;
  'dashboard.quick.events': string;
  'dashboard.quick.sessions': string;
  'dashboard.quick.explore': string;
  'dashboard.quick.search': string;
  'dashboard.quick.myEvents': string;
  'dashboard.quick.profile': string;
  'dashboard.stats.events': string;
  'dashboard.stats.sessions': string;
  'dashboard.stats.active': string;
  'dashboard.stats.public': string;
  'dashboard.yourEvents': string;
  'dashboard.viewAll': string;
  'provider.events.title': string;
  'provider.events.lead': string;
  'provider.events.search': string;
  'provider.events.noResults': string;
  'provider.sessions.title': string;
  'provider.sessions.lead': string;
  'participant.explore.title': string;
  'participant.explore.lead': string;
  'participant.explore.empty': string;
  'participant.explore.view': string;
  'participant.myEvents.title': string;
  'participant.myEvents.lead': string;
  'participant.myEvents.search': string;
  'participant.myEvents.empty': string;
  'participant.myEvents.browse': string;
  'participant.event.notFound': string;
  'participant.event.about': string;
  'participant.event.when': string;
  'participant.event.where': string;
  'participant.event.capacity': string;
  'participant.event.registeredHint': string;
  'participant.event.openMyEvents': string;
  'participant.event.upcoming': string;
  'participant.event.finished': string;
  'participant.sessions.title': string;
  'participant.sessions.lead': string;
  'participant.sessions.empty': string;
  'participant.join.title': string;
  'participant.join.lead': string;
  'participant.join.label': string;
  'participant.join.placeholder': string;
  'participant.join.submit': string;
  'participant.join.submitting': string;
  'participant.join.joined': string;
  'participant.join.already': string;
  'participant.join.invalid': string;
  'participant.join.notActive': string;
  'participant.join.ended': string;
  'participant.join.failed': string;
  'participant.register': string;
  'participant.registering': string;
  'participant.registered': string;
  'participant.registerFailed': string;
  'participant.notCheckedIn': string;
  'search.title': string;
  'search.lead': string;
  'search.placeholder': string;
  'search.hint': string;
  'search.results': string;
  'search.noResults': string;
  'profile.title': string;
  'profile.lead': string;
  'profile.name': string;
  'profile.email': string;
  'profile.role': string;
  'profile.memberSince': string;
  'profile.summary': string;
  'profile.unknown': string;
  'profile.editName': string;
  'profile.nameHint': string;
  'profile.save': string;
  'profile.saving': string;
  'profile.saved': string;
  'profile.saveFailed': string;
  'settings.title': string;
  'settings.lead': string;
  'settings.language': string;
  'settings.languageHint': string;
  'settings.preferences': string;
  'settings.preferencesHint': string;
  'settings.emailNotifications': string;
  'settings.emailNotificationsHint': string;
  'settings.weeklySummary': string;
  'settings.weeklySummaryHint': string;
  'settings.account': string;
  'common.all': string;
  'common.resultsUnit': string;
  'hero.eyebrow': string;
  'hero.title': string;
  'hero.subtitle': string;
  'hero.ctaPrimary': string;
  'hero.ctaSecondary': string;
  'hero.note': string;
  'hero.sampleLabel': string;
  'hero.sampleTitle': string;
  'hero.sampleMeta': string;
  'hero.sampleStatus': string;
  'how.title': string;
  'how.lead': string;
  'how.step1.title': string;
  'how.step1.body': string;
  'how.step2.title': string;
  'how.step2.body': string;
  'how.step3.title': string;
  'how.step3.body': string;
  'features.title': string;
  'features.lead': string;
  'features.scan.title': string;
  'features.scan.body': string;
  'features.clock.title': string;
  'features.clock.body': string;
  'features.analytics.title': string;
  'features.analytics.body': string;
  'features.export.title': string;
  'features.export.body': string;
  'roles.title': string;
  'roles.lead': string;
  'roles.provider.title': string;
  'roles.provider.body': string;
  'roles.participant.title': string;
  'roles.participant.body': string;
  'cta.title': string;
  'cta.body': string;
  'cta.button': string;
  'footer.note': string;
  'footer.rights': string;
  'auth.title': string;
  'auth.subtitle': string;
  'auth.email': string;
  'auth.password': string;
  'auth.submit': string;
  'auth.submitting': string;
  'auth.back': string;
  'auth.errorInvalid': string;
  'auth.errorGeneric': string;
  'auth.roleMissing': string;
  'auth.signOut': string;
  'auth.noAccount': string;
  'auth.createAccount': string;
  'auth.haveAccount': string;
  'auth.signInLink': string;
  'auth.demoTitle': string;
  'auth.demoProvider': string;
  'auth.demoParticipant': string;
  'auth.demoFailed': string;
  'auth.demoHint': string;
  'signup.title': string;
  'signup.subtitle': string;
  'signup.roleLegend': string;
  'signup.roleHint': string;
  'signup.firstName': string;
  'signup.lastName': string;
  'signup.email': string;
  'signup.password': string;
  'signup.passwordHint': string;
  'signup.confirm': string;
  'signup.submit': string;
  'signup.submitting': string;
  'signup.errorRole': string;
  'signup.errorFirstName': string;
  'signup.errorLastName': string;
  'signup.errorEmail': string;
  'signup.errorPassword': string;
  'signup.errorMismatch': string;
  'signup.errorEmailTaken': string;
  'signup.errorGeneric': string;
  'signup.checkEmailTitle': string;
  'signup.checkEmailBody': string;
  'signup.backToSignIn': string;
  'provider.title': string;
  'provider.lead': string;
  'participant.title': string;
  'participant.lead': string;
  'home.nextStep': string;
  'loading.page': string;
  'common.loading': string;
  'common.retry': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.deleteConfirm': string;
  'session.errorTitle': string;
  'common.sessionsUnit': string;
  'common.minutesUnit': string;
  'common.loadFailed': string;
  'common.saveFailed': string;
  'event.title': string;
  'event.category': string;
  'event.startsAt': string;
  'event.endsAt': string;
  'event.visibility': string;
  'event.private': string;
  'event.public': string;
  'event.create': string;
  'event.creating': string;
  'event.code': string;
  'event.sessions': string;
  'event.details': string;
  'event.deleteConfirm': string;
  'event.errorTitle': string;
  'event.errorDates': string;
  'event.errorCapacity': string;
  'event.notFound': string;
  'event.back': string;
  'event.empty': string;
  'event.emptyHint': string;
  'event.new': string;
  'event.info': string;
  'event.edit': string;
  'event.description': string;
  'event.location': string;
  'event.capacity': string;
  'event.registrationDeadline': string;
  'event.createdAt': string;
  'event.noDeadline': string;
  'event.save': string;
  'event.saving': string;
  'event.errorDeadline': string;
  'session.errorLateness': string;
  'session.errorStartsAt': string;
  'event.stats.registrants': string;
  'event.stats.attendance': string;
  'event.stats.rate': string;
  'event.registrants': string;
  'event.emptyRegistrants': string;
  'event.registeredAt': string;
  'event.exportRegistrants': string;
  'event.exportRegistrantsAria': string;
  'event.csvName': string;
  'event.csvRegisteredAt': string;
  'session.new': string;
  'session.event': string;
  'session.eventPlaceholder': string;
  'session.errorEvent': string;
  'session.needEvent': string;
  'session.createEvent': string;
  'session.title': string;
  'session.startsAt': string;
  'session.duration': string;
  'session.lateness': string;
  'session.create': string;
  'session.creating': string;
  'session.empty': string;
  'session.emptyHint': string;
  'session.status.scheduled': string;
  'session.status.active': string;
  'session.status.closed': string;
  'session.open': string;
  'session.activate': string;
  'session.close': string;
  'session.qr': string;
  'session.qrHint': string;
  'session.checkInCode': string;
  'session.checkInHint': string;
  'session.qrLabel': string;
  'session.attendance': string;
  'session.emptyAttendance': string;
  'session.export': string;
  'session.edit': string;
  'session.save': string;
  'session.saving': string;
  'session.method': string;
  'session.method.face_to_face': string;
  'session.method.online': string;
  'session.emptySessionAttendance': string;
  'session.errorDuration': string;
  'attendance.present': string;
  'attendance.late': string;
  'attendance.absent': string;
  'participant.summary': string;
  'participant.totalSessions': string;
  'participant.attended': string;
  'participant.lateCount': string;
  'participant.rate': string;
  'participant.attendance': string;
  'participant.emptyAttendance': string;
  'participant.registrations': string;
  'participant.emptyRegistrations': string;
  'participant.deadline': string;
  'participant.noDeadline': string;
};

export const ar: Dict = {
  'brand.name': 'حاضر',
  'brand.tagline': 'إدارة حضور بلا ورق',
  'nav.label': 'التنقل الرئيسي',
  'nav.features': 'المزايا',
  'nav.how': 'كيف يعمل',
  'nav.signIn': 'تسجيل دخول',
  'nav.start': 'ابدأ الآن',
  'nav.langLabel': 'تغيير اللغة',
  'nav.skip': 'تجاوز إلى المحتوى',
  'nav.dashboard': 'لوحة التحكم',
  'nav.profile': 'الملف التعريفي',
  'nav.explore': 'استكشف الفعاليات',
  'nav.myEvents': 'فعالياتي',
  'nav.events': 'الفعاليات',
  'nav.sessions': 'الجلسات',
  'nav.search': 'البحث عن جلسة',
  'nav.settings': 'الإعدادات',
  'nav.openMenu': 'فتح القائمة',
  'nav.closeMenu': 'إغلاق القائمة',
  'dashboard.eyebrow': 'مساحة العمل',
  'dashboard.quick': 'اختصارات سريعة',
  'dashboard.quick.events': 'إدارة الفعاليات',
  'dashboard.quick.sessions': 'كل الجلسات',
  'dashboard.quick.search': 'البحث عن جلسة',
  'dashboard.quick.explore': 'استكشف الفعاليات',
  'dashboard.quick.myEvents': 'فعالياتي',
  'dashboard.quick.profile': 'الملف التعريفي',
  'dashboard.stats.events': 'الفعاليات',
  'dashboard.stats.sessions': 'الجلسات',
  'dashboard.stats.active': 'جلسات نشطة',
  'dashboard.stats.public': 'فعاليات عامة',
  'dashboard.yourEvents': 'فعالياتك',
  'dashboard.viewAll': 'عرض الكل',
  'provider.events.title': 'الفعاليات',
  'provider.events.lead': 'أنشئ الفعاليات وتابع جلساتها من مكان واحد.',
  'provider.events.search': 'ابحث باسم الفعالية أو رمزها…',
  'provider.events.noResults': 'لا توجد فعاليات مطابقة لبحثك.',
  'provider.sessions.title': 'الجلسات',
  'provider.sessions.lead': 'كل الجلسات عبر فعالياتك، مع حالتها وموعدها.',
  'participant.sessions.title': 'جلساتي',
  'participant.sessions.lead': 'الجلسات ضمن الفعاليات التي سجّلت فيها.',
  'participant.explore.title': 'استكشف الفعاليات',
  'participant.explore.lead': 'الفعاليات المنشورة للجميع. افتح أي فعالية لعرض تفاصيلها والتسجيل فيها.',
  'participant.explore.empty': 'لا توجد فعاليات منشورة الآن.',
  'participant.explore.view': 'عرض التفاصيل',
  'participant.myEvents.title': 'فعالياتي',
  'participant.myEvents.lead': 'الفعاليات التي سجّلت فيها ومواعيدها.',
  'participant.myEvents.search': 'ابحث في فعالياتي…',
  'participant.myEvents.empty': 'لم تسجّل في أي فعالية بعد.',
  'participant.myEvents.browse': 'استكشف الفعاليات',
  'participant.event.notFound': 'الفعالية غير موجودة أو غير متاحة.',
  'participant.event.about': 'عن الفعالية',
  'participant.event.when': 'الموعد',
  'participant.event.where': 'المكان',
  'participant.event.capacity': 'المقاعد',
  'participant.event.registeredHint': 'أنت مسجّل في هذه الفعالية.',
  'participant.event.openMyEvents': 'الذهاب إلى فعالياتي',
  'participant.event.upcoming': 'قادمة',
  'participant.event.finished': 'انتهت',
  'participant.sessions.empty': 'لا توجد جلسات ضمن فعالياتك المسجّلة بعد.',
  'participant.join.title': 'تسجيل الحضور برمز الجلسة',
  'participant.join.lead': 'أدخل الرمز المكوّن من أربعة أرقام الذي يعرضه المنظّم.',
  'participant.join.label': 'رمز الجلسة',
  'participant.join.placeholder': '0000',
  'participant.join.submit': 'تسجيل الحضور',
  'participant.join.submitting': 'جارٍ تسجيل الحضور…',
  'participant.join.joined': 'تم تسجيل حضورك.',
  'participant.join.already': 'حضورك مسجّل مسبقًا في هذه الجلسة.',
  'participant.join.invalid': 'الرمز غير صحيح. تحقق منه وحاول مرة أخرى.',
  'participant.join.notActive': 'تسجيل الحضور غير مفتوح لهذه الجلسة الآن.',
  'participant.join.ended': 'انتهى وقت تسجيل الحضور لهذه الجلسة.',
  'participant.join.failed': 'تعذّر تسجيل الحضور. حاول مرة أخرى.',
  'participant.register': 'تسجيل',
  'participant.registering': 'جارٍ التسجيل…',
  'participant.registered': 'مسجّل',
  'participant.registerFailed': 'تعذر التسجيل. حاول مرة أخرى.',
  'participant.notCheckedIn': 'لم يُسجَّل الحضور',
  'search.title': 'البحث عن جلسة',
  'search.lead': 'اكتب عنوان الجلسة أو اسم الفعالية للوصول السريع.',
  'search.placeholder': 'ابحث باسم الجلسة أو الفعالية…',
  'search.hint': 'ابدأ بالكتابة لعرض النتائج.',
  'search.results': 'النتائج',
  'search.noResults': 'لا توجد جلسات مطابقة.',
  'profile.title': 'الملف التعريفي',
  'profile.lead': 'بيانات حسابك وملخّص نشاطك.',
  'profile.name': 'الاسم',
  'profile.email': 'البريد الإلكتروني',
  'profile.role': 'الدور',
  'profile.memberSince': 'عضو منذ',
  'profile.summary': 'ملخّص النشاط',
  'profile.unknown': 'غير متاح',
  'profile.editName': 'تعديل الاسم',
  'profile.nameHint': 'يظهر هذا الاسم في لوحة التحكم وفي كشوف الحضور.',
  'profile.save': 'حفظ الاسم',
  'profile.saving': 'جارٍ الحفظ…',
  'profile.saved': 'تم تحديث الاسم.',
  'profile.saveFailed': 'تعذّر حفظ الاسم. حاول مرة أخرى.',
  'settings.title': 'الإعدادات',
  'settings.lead': 'خصّص اللغة والتنبيهات على هذا الجهاز.',
  'settings.language': 'اللغة',
  'settings.languageHint': 'تغيير لغة الواجهة واتجاه الصفحة.',
  'settings.preferences': 'التفضيلات',
  'settings.preferencesHint': 'تُحفظ على هذا الجهاز فقط ولا تُرسل إلى الخادم.',
  'settings.emailNotifications': 'تنبيهات البريد الإلكتروني',
  'settings.emailNotificationsHint': 'تذكير قبل بداية الجلسة.',
  'settings.weeklySummary': 'ملخّص أسبوعي',
  'settings.weeklySummaryHint': 'ملخّص الحضور في نهاية كل أسبوع.',
  'settings.account': 'الحساب',
  'common.all': 'الكل',
  'common.resultsUnit': 'نتيجة',
  'hero.eyebrow': 'منصة إدارة الحضور للفعاليات والبرامج التدريبية',
  'hero.title': 'الحضور يُسجَّل لحظة وصولك',
  'hero.subtitle':
    'أنشئ فعاليتك، اعرض رمز QR على الشاشة، ودع المشاركين يمسحونه. الحضور والتأخير والتحليلات تُحسب تلقائيًا.',
  'hero.ctaPrimary': 'ابدأ الآن',
  'hero.ctaSecondary': 'كيف يعمل حاضر؟',
  'hero.note': 'لا يحتاج المشارك إلى تثبيت تطبيق — المتصفح يكفي.',
  'hero.sampleLabel': 'مثال توضيحي',
  'hero.sampleTitle': 'ورشة تصميم الخدمات',
  'hero.sampleMeta': 'اليوم 9:00 · قاعة 2',
  'hero.sampleStatus': 'تم تسجيل الحضور',
  'how.title': 'ثلاث خطوات من الفعالية إلى الكشف',
  'how.lead': 'لا جداول، ولا أوراق توقيع، ولا عدّ يدوي بعد اليوم.',
  'how.step1.title': 'أنشئ الفعالية',
  'how.step1.body': 'أضف الفعالية وجلساتها، وحدّد مدة الجلسة وهامش التأخير المسموح.',
  'how.step2.title': 'اعرض الرمز',
  'how.step2.body': 'افتح شاشة الجلسة واعرض رمز QR على الشاشة أو على ورقة مطبوعة.',
  'how.step3.title': 'تابع الحضور',
  'how.step3.body': 'كل مسح يظهر مباشرة في القائمة، بحالة حاضر أو متأخر، مع إمكانية التصدير.',
  'features.title': 'ما يفعله حاضر عنك',
  'features.lead': 'أربع وظائف تغطي رحلة الحضور كاملة، من أول مسح إلى آخر تصدير.',
  'features.scan.title': 'مسح فوري',
  'features.scan.body': 'المشارك يفتح الكاميرا ويمسح الرمز — بلا تطبيق وبلا تسجيل يدوي.',
  'features.clock.title': 'حالة دقيقة',
  'features.clock.body': 'حاضر أو متأخر يُحسب على ساعة الخادم، لا على ساعة جهاز المشارك.',
  'features.analytics.title': 'تحليلات جاهزة',
  'features.analytics.body': 'نسبة الحضور لكل جلسة وفعالية، محسوبة دون جداول يدوية.',
  'features.export.title': 'تصدير CSV',
  'features.export.body': 'نزّل كشف الحضور بملف يفتح مباشرة في Excel.',
  'roles.title': 'حسابان، رحلتان',
  'roles.lead': 'اختر دورك عند إنشاء الحساب، ولن ترى إلا ما يخصّك.',
  'roles.provider.title': 'المنظم',
  'roles.provider.body': 'ينشئ الفعاليات والجلسات، يعرض الرمز، يتابع الحضور ويصدّر الكشوف.',
  'roles.participant.title': 'المشارك',
  'roles.participant.body': 'يستعرض الفعاليات العامة، يسجّل فيها، ويمسح الرمز عند الوصول.',
  'cta.title': 'جاهز لأول فعالية؟',
  'cta.body': 'أنشئ حسابك كمنظم أو سجّل كمشارك، وابدأ من أول جلسة.',
  'cta.button': 'إنشاء حساب',
  'footer.note': 'حاضر — إدارة حضور بلا ورق.',
  'footer.rights': 'جميع الحقوق محفوظة',
  'auth.title': 'تسجيل الدخول',
  'auth.subtitle': 'أدخل بريدك وكلمة المرور للمتابعة.',
  'auth.email': 'البريد الإلكتروني',
  'auth.password': 'كلمة المرور',
  'auth.submit': 'دخول',
  'auth.submitting': 'جارٍ الدخول…',
  'auth.back': 'العودة إلى الرئيسية',
  'auth.errorInvalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
  'auth.errorGeneric': 'تعذر تسجيل الدخول. حاول مرة أخرى.',
  'auth.roleMissing': 'لا يوجد دور مرتبط بهذا الحساب. تواصل مع مسؤول المنصة.',
  'auth.signOut': 'تسجيل الخروج',
  'auth.noAccount': 'ليس لديك حساب؟',
  'auth.createAccount': 'أنشئ حسابًا',
  'auth.haveAccount': 'لديك حساب؟',
  'auth.signInLink': 'تسجيل الدخول',
  'auth.demoTitle': 'دخول سريع للتجربة',
  'auth.demoProvider': 'دخول تجريبي كمنظم',
  'auth.demoParticipant': 'دخول تجريبي كمشارك',
  'auth.demoFailed': 'تعذر الدخول التجريبي. تحقّق من إعداد الحساب.',
  'signup.title': 'إنشاء حساب',
  'auth.demoHint': 'يدخل بحساب تجريبي ببيانات جاهزة، دون بريد أو كلمة مرور.',
  'signup.subtitle': 'اختر نوع حسابك، ثم أدخل اسمك وبريدك وكلمة المرور.',
  'signup.roleLegend': 'نوع الحساب',
  'signup.roleHint': 'دور واحد لكل حساب، ولا يتغير بعد الإنشاء.',
  'signup.firstName': 'الاسم الأول',
  'signup.lastName': 'اسم العائلة',
  'signup.email': 'البريد الإلكتروني',
  'signup.password': 'كلمة المرور',
  'signup.passwordHint': '٨ أحرف على الأقل.',
  'signup.confirm': 'تأكيد كلمة المرور',
  'signup.submit': 'إنشاء الحساب',
  'signup.submitting': 'جارٍ الإنشاء…',
  'signup.errorRole': 'اختر نوع الحساب للمتابعة.',
  'signup.errorFirstName': 'أدخل الاسم الأول (حرفان على الأقل).',
  'signup.errorLastName': 'أدخل اسم العائلة (حرفان على الأقل).',
  'signup.errorEmail': 'أدخل بريدًا إلكترونيًا صحيحًا.',
  'signup.errorPassword': 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل.',
  'signup.errorMismatch': 'كلمتا المرور غير متطابقتين.',
  'signup.errorEmailTaken': 'هذا البريد مسجّل بالفعل. سجّل الدخول بدلًا من ذلك.',
  'signup.errorGeneric': 'تعذر إنشاء الحساب. حاول مرة أخرى.',
  'signup.checkEmailTitle': 'تحقق من بريدك',
  'signup.checkEmailBody': 'أرسلنا رابط تأكيد إلى:',
  'signup.backToSignIn': 'العودة لتسجيل الدخول',
  'provider.title': 'لوحة المنظم',
  'provider.lead': 'هنا تُدار الفعاليات والجلسات وكشوف الحضور.',
  'participant.title': 'لوحة المشارك',
  'participant.lead': 'هنا تُستعرض الفعاليات العامة وحضورك.',
  'home.nextStep': 'الخطوة التالية: إضافة الفعاليات والجلسات.',
  'loading.page': 'جارٍ التحميل…',
  'common.loading': 'جارٍ التحميل…',
  'common.retry': 'إعادة المحاولة',
  'common.cancel': 'إلغاء',
  'common.delete': 'حذف',
  'common.edit': 'تعديل',
  'common.deleteConfirm': 'تأكيد الحذف',
  'common.sessionsUnit': 'جلسة',
  'common.minutesUnit': 'دقيقة',
  'common.loadFailed': 'تعذر تحميل البيانات. تحقّق من الاتصال وحاول مرة أخرى.',
  'common.saveFailed': 'تعذر الحفظ. حاول مرة أخرى.',
  'event.title': 'عنوان الفعالية',
  'event.category': 'التصنيف',
  'event.startsAt': 'تاريخ البداية',
  'event.endsAt': 'تاريخ النهاية',
  'event.visibility': 'الظهور',
  'event.private': 'خاص',
  'event.public': 'عام',
  'event.create': 'إنشاء الفعالية',
  'event.creating': 'جارٍ الإنشاء…',
  'event.code': 'الرمز',
  'event.sessions': 'الجلسات',
  'event.details': 'التفاصيل',
  'event.deleteConfirm': 'حذف هذه الفعالية وكل جلساتها؟ لا يمكن التراجع.',
  'event.errorTitle': 'أدخل عنوانًا من ٣ أحرف على الأقل.',
  'event.errorDates': 'تاريخ النهاية يجب أن يكون بعد البداية.',
  'event.errorCapacity': 'أدخل سعة أكبر من صفر.',
  'event.notFound': 'الفعالية غير موجودة أو لا تملك صلاحية عرضها.',
  'event.back': 'العودة إلى الفعاليات',
  'event.empty': 'لا توجد فعاليات بعد',
  'event.emptyHint': 'أنشئ أول فعالية لتظهر هنا مع رمزها وجلساتها.',
  'event.new': 'فعالية جديدة',
  'event.info': 'معلومات الفعالية',
  'event.edit': 'تعديل الفعالية',
  'event.description': 'الوصف',
  'event.location': 'المكان',
  'event.capacity': 'السعة',
  'event.registrationDeadline': 'آخر موعد للتسجيل',
  'event.createdAt': 'تاريخ الإنشاء',
  'event.noDeadline': 'بدون موعد',
  'event.save': 'حفظ التعديلات',
  'event.saving': 'جارٍ الحفظ…',
  'event.errorDeadline': 'آخر موعد للتسجيل يجب أن يسبق تاريخ البداية.',
  'event.stats.registrants': 'المسجلون',
  'event.stats.attendance': 'الحضور',
  'event.stats.rate': 'نسبة الحضور',
  'event.registrants': 'المسجلون في الفعالية',
  'event.emptyRegistrants': 'لا يوجد مسجلون في هذه الفعالية بعد.',
  'event.registeredAt': 'سجّل في',
  'event.exportRegistrants': 'تصدير CSV',
  'event.exportRegistrantsAria': 'تصدير المسجلين إلى ملف CSV',
  'event.csvName': 'الاسم',
  'event.csvRegisteredAt': 'تاريخ التسجيل',
  'session.new': 'جلسة جديدة',
  'session.event': 'الفعالية',
  'session.eventPlaceholder': 'اختر فعالية',
  'session.errorEvent': 'اختر فعالية لهذه الجلسة.',
  'session.needEvent': 'أنشئ فعالية أولًا ثم أضف جلساتها.',
  'session.createEvent': 'إنشاء فعالية',
  'session.title': 'عنوان الجلسة',
  'session.startsAt': 'وقت البداية',
  'session.duration': 'المدة (دقيقة)',
  'session.lateness': 'هامش التأخير (دقيقة)',
  'session.create': 'إنشاء الجلسة',
  'session.creating': 'جارٍ الإنشاء…',
  'session.errorTitle': 'أدخل عنوانًا من ٣ أحرف على الأقل.',
  'session.errorLateness': 'أدخل هامش تأخير بين ٠ و ١٢٠ دقيقة.',
  'session.errorStartsAt': 'اختر وقت بداية للجلسة.',
  'session.empty': 'لا توجد جلسات بعد',
  'session.emptyHint': 'أضف جلسة لتظهر شاشة رمز الدخول وتُسجَّل الحضور.',
  'session.status.scheduled': 'مجدولة',
  'session.status.active': 'نشطة',
  'session.status.closed': 'مغلقة',
  'session.open': 'فتح الجلسة',
  'session.activate': 'تفعيل',
  'session.close': 'إغلاق',
  'session.qr': 'رمز الدخول',
  'session.qrHint': 'اعرض هذا الرمز للمشاركين. يتغيّر حاله الجلسة تلقائيًا عند انتهاء مدتها.',
  'session.checkInCode': 'رمز الحضور',
  'session.checkInHint': 'يدخل المشاركون هذا الرمز أو يمسحون الباركود لتسجيل الحضور.',
  'session.qrLabel': 'باركود تسجيل الحضور',
  'session.attendance': 'الحضور',
  'session.emptyAttendance': 'لا يوجد حضور بعد',
  'session.export': 'تصدير CSV',
  'session.edit': 'تعديل',
  'session.save': 'حفظ التعديلات',
  'session.saving': 'جارٍ الحفظ…',
  'session.method': 'طريقة الحضور',
  'session.method.face_to_face': 'حضوري',
  'session.method.online': 'عن بُعد',
  'session.emptySessionAttendance': 'لم يسجّل أحد حضوره في هذه الجلسة بعد.',
  'session.errorDuration': 'أدخل مدة بين ٥ و ٤٨٠ دقيقة.',
  'attendance.present': 'حاضر',
  'attendance.late': 'متأخر',
  'attendance.absent': 'غائب',
  'participant.summary': 'ملخّص حضوري',
  'participant.totalSessions': 'الجلسات',
  'participant.attended': 'حضرت',
  'participant.lateCount': 'متأخر',
  'participant.rate': 'نسبة الحضور',
  'participant.attendance': 'سجل الحضور',
  'participant.emptyAttendance': 'لم تسجّل حضورك في أي جلسة بعد.',
  'participant.registrations': 'تسجيلاتي',
  'participant.emptyRegistrations': 'لم تسجّل في أي فعالية بعد.',
  'participant.deadline': 'آخر موعد للتسجيل',
  'participant.noDeadline': 'بلا موعد نهائي',
};

export const en: Dict = {
  'brand.name': 'Hadir',
  'brand.tagline': 'Paperless attendance',
  'nav.label': 'Main navigation',
  'nav.features': 'Features',
  'nav.how': 'How it works',
  'nav.signIn': 'Sign in',
  'nav.start': 'Get started',
  'nav.langLabel': 'Change language',
  'nav.skip': 'Skip to content',
  'nav.dashboard': 'Dashboard',
  'nav.profile': 'Profile',
  'nav.events': 'Events',
  'nav.explore': 'Explore events',
  'nav.myEvents': 'My events',
  'nav.sessions': 'Sessions',
  'nav.search': 'Find a session',
  'nav.settings': 'Settings',
  'nav.openMenu': 'Open menu',
  'nav.closeMenu': 'Close menu',
  'dashboard.eyebrow': 'Workspace',
  'dashboard.quick': 'Quick actions',
  'dashboard.quick.events': 'Manage events',
  'dashboard.quick.sessions': 'All sessions',
  'dashboard.quick.search': 'Find a session',
  'dashboard.quick.explore': 'Explore events',
  'dashboard.quick.myEvents': 'My events',
  'dashboard.quick.profile': 'Profile',
  'dashboard.stats.events': 'Events',
  'dashboard.stats.sessions': 'Sessions',
  'dashboard.stats.active': 'Active sessions',
  'dashboard.stats.public': 'Public events',
  'dashboard.yourEvents': 'Your events',
  'dashboard.viewAll': 'View all',
  'provider.events.title': 'Events',
  'provider.events.lead': 'Create events and follow their sessions in one place.',
  'provider.events.search': 'Search by event name or code…',
  'provider.events.noResults': 'No events match your search.',
  'provider.sessions.title': 'Sessions',
  'provider.sessions.lead': 'Every session across your events, with its status and time.',
  'participant.explore.title': 'Explore events',
  'participant.explore.lead': 'Published events open to everyone. Open one to see its details and register.',
  'participant.explore.empty': 'No published events right now.',
  'participant.explore.view': 'View details',
  'participant.myEvents.title': 'My events',
  'participant.myEvents.lead': 'The events you registered for and their dates.',
  'participant.myEvents.search': 'Search my events…',
  'participant.myEvents.empty': 'You have not registered for any event yet.',
  'participant.myEvents.browse': 'Explore events',
  'participant.event.notFound': 'This event does not exist or is not available.',
  'participant.event.about': 'About this event',
  'participant.event.when': 'When',
  'participant.event.where': 'Where',
  'participant.event.capacity': 'Seats',
  'participant.event.registeredHint': 'You are registered for this event.',
  'participant.event.openMyEvents': 'Go to my events',
  'participant.event.upcoming': 'Upcoming',
  'participant.event.finished': 'Finished',
  'participant.sessions.title': 'My sessions',
  'participant.sessions.lead': 'Sessions inside the events you registered for.',
  'participant.sessions.empty': 'No sessions in your registered events yet.',
  'participant.join.title': 'Check in with a session code',
  'participant.join.lead': 'Enter the four digit code shown by the organiser.',
  'participant.join.label': 'Session code',
  'participant.join.placeholder': '0000',
  'participant.join.submit': 'Check in',
  'participant.join.submitting': 'Checking in…',
  'participant.join.joined': 'You are checked in.',
  'participant.join.already': 'You are already checked in to this session.',
  'participant.join.invalid': 'That code is not valid. Check it and try again.',
  'participant.join.notActive': 'Check-in is not open for this session yet.',
  'participant.join.ended': 'Check-in for this session has ended.',
  'participant.join.failed': 'Could not check in. Please try again.',
  'participant.register': 'Register',
  'participant.registering': 'Registering…',
  'participant.registered': 'Registered',
  'participant.registerFailed': 'Could not register. Please try again.',
  'participant.notCheckedIn': 'Not checked in',
  'search.title': 'Find a session',
  'search.lead': 'Type a session or event name to get there quickly.',
  'search.placeholder': 'Search by session or event name…',
  'search.hint': 'Start typing to see results.',
  'search.results': 'Results',
  'search.noResults': 'No sessions match.',
  'profile.title': 'Profile',
  'profile.lead': 'Your account details and activity summary.',
  'profile.name': 'Name',
  'profile.email': 'Email',
  'profile.role': 'Role',
  'profile.memberSince': 'Member since',
  'profile.summary': 'Activity summary',
  'profile.unknown': 'Unavailable',
  'profile.editName': 'Edit name',
  'profile.nameHint': 'This name appears on your dashboard and attendance reports.',
  'profile.save': 'Save name',
  'profile.saving': 'Saving…',
  'profile.saved': 'Name updated.',
  'profile.saveFailed': 'Could not save the name. Please try again.',
  'settings.title': 'Settings',
  'settings.lead': 'Customise language and notifications on this device.',
  'settings.language': 'Language',
  'settings.languageHint': 'Change the interface language and page direction.',
  'settings.preferences': 'Preferences',
  'settings.preferencesHint': 'Stored on this device only; nothing is sent to the server.',
  'settings.emailNotifications': 'Email notifications',
  'settings.emailNotificationsHint': 'A reminder before a session starts.',
  'settings.weeklySummary': 'Weekly summary',
  'settings.weeklySummaryHint': 'An attendance summary at the end of each week.',
  'settings.account': 'Account',
  'common.all': 'All',
  'common.resultsUnit': 'results',
  'hero.eyebrow': 'Attendance for events and training programs',
  'hero.title': 'Attendance is recorded the moment you arrive',
  'hero.subtitle':
    'Create your event, show the QR code on screen, and let participants scan it. Attendance, lateness, and analytics are calculated for you.',
  'hero.ctaPrimary': 'Get started',
  'hero.ctaSecondary': 'How Hadir works',
  'hero.note': 'Participants install nothing — the browser is enough.',
  'hero.sampleLabel': 'Illustrative example',
  'hero.sampleTitle': 'Service design workshop',
  'hero.sampleMeta': 'Today 9:00 · Hall 2',
  'hero.sampleStatus': 'Attendance recorded',
  'how.title': 'Three steps from event to report',
  'how.lead': 'No spreadsheets, no sign-in sheets, no manual counting.',
  'how.step1.title': 'Create the event',
  'how.step1.body': 'Add the event and its sessions, then set the session length and the lateness allowance.',
  'how.step2.title': 'Show the code',
  'how.step2.body': 'Open the session screen and display the QR code on a screen or a printed sheet.',
  'how.step3.title': 'Watch attendance',
  'how.step3.body': 'Every scan appears in the list instantly as present or late, ready to export.',
  'features.title': 'What Hadir does for you',
  'features.lead': 'Four functions covering the whole attendance journey, from the first scan to the last export.',
  'features.scan.title': 'Instant scanning',
  'features.scan.body': 'Participants open the camera and scan — no app, no manual entry.',
  'features.clock.title': 'Accurate status',
  'features.clock.body': 'Present or late is decided by the server clock, not the participant device.',
  'features.analytics.title': 'Ready analytics',
  'features.analytics.body': 'Attendance rate per session and per event, computed without spreadsheets.',
  'features.export.title': 'CSV export',
  'features.export.body': 'Download the attendance sheet as a file that opens directly in Excel.',
  'roles.title': 'Two accounts, two journeys',
  'roles.lead': 'Pick your role when you sign up, and you only see what concerns you.',
  'roles.provider.title': 'Provider',
  'roles.provider.body': 'Creates events and sessions, shows the code, follows attendance, and exports reports.',
  'roles.participant.title': 'Participant',
  'roles.participant.body': 'Browses public events, registers, and scans the code on arrival.',
  'cta.title': 'Ready for your first event?',
  'cta.body': 'Create a provider account or register as a participant, and start with the first session.',
  'cta.button': 'Create an account',
  'footer.note': 'Hadir — paperless attendance management.',
  'footer.rights': 'All rights reserved',
  'auth.title': 'Sign in',
  'auth.subtitle': 'Enter your email and password to continue.',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.submit': 'Sign in',
  'auth.submitting': 'Signing in…',
  'auth.back': 'Back to home',
  'auth.errorInvalid': 'The email or password is incorrect.',
  'auth.errorGeneric': 'Could not sign you in. Please try again.',
  'auth.roleMissing': 'This account has no role. Contact the platform administrator.',
  'auth.signOut': 'Sign out',
  'auth.noAccount': "Don't have an account?",
  'auth.createAccount': 'Create one',
  'auth.haveAccount': 'Already have an account?',
  'auth.signInLink': 'Sign in',
  'auth.demoTitle': 'Quick demo access',
  'auth.demoProvider': 'Demo sign in as provider',
  'auth.demoParticipant': 'Demo sign in as participant',
  'auth.demoFailed': 'Demo sign in failed. Check the demo account setup.',
  'signup.title': 'Create an account',
  'auth.demoHint': 'Opens a demo account with ready sample data, no email or password.',
  'signup.subtitle': 'Choose your account type, then enter your name, email and password.',
  'signup.roleLegend': 'Account type',
  'signup.roleHint': 'One role per account; it cannot be changed later.',
  'signup.firstName': 'First name',
  'signup.lastName': 'Last name',
  'signup.email': 'Email',
  'signup.password': 'Password',
  'signup.passwordHint': 'At least 8 characters.',
  'signup.confirm': 'Confirm password',
  'signup.submit': 'Create account',
  'signup.submitting': 'Creating…',
  'signup.errorRole': 'Choose an account type to continue.',
  'signup.errorFirstName': 'Enter a first name (at least 2 letters).',
  'signup.errorLastName': 'Enter a last name (at least 2 letters).',
  'signup.errorEmail': 'Enter a valid email address.',
  'signup.errorPassword': 'The password must be at least 8 characters.',
  'signup.errorMismatch': 'The two passwords do not match.',
  'signup.errorEmailTaken': 'That email is already registered. Sign in instead.',
  'signup.errorGeneric': 'Could not create the account. Please try again.',
  'signup.checkEmailTitle': 'Check your email',
  'signup.checkEmailBody': 'We sent a confirmation link to:',
  'signup.backToSignIn': 'Back to sign in',
  'provider.title': 'Provider dashboard',
  'provider.lead': 'Events, sessions, and attendance reports are managed here.',
  'participant.title': 'Participant home',
  'participant.lead': 'Public events and your own attendance live here.',
  'home.nextStep': 'Next step: add events and sessions.',
  'loading.page': 'Loading…',
  'common.loading': 'Loading…',
  'common.retry': 'Try again',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.deleteConfirm': 'Confirm delete',
  'common.sessionsUnit': 'sessions',
  'common.minutesUnit': 'min',
  'common.loadFailed': 'Could not load the data. Check your connection and try again.',
  'common.saveFailed': 'Could not save. Please try again.',
  'event.title': 'Event name',
  'event.category': 'Category',
  'event.startsAt': 'Start date',
  'event.endsAt': 'End date',
  'event.visibility': 'Visibility',
  'event.private': 'Private',
  'event.public': 'Public',
  'event.create': 'Create event',
  'event.creating': 'Creating…',
  'event.code': 'Code',
  'event.sessions': 'Sessions',
  'event.details': 'Details',
  'event.deleteConfirm': 'Delete this event and all its sessions? This cannot be undone.',
  'event.errorTitle': 'Enter a name of at least 3 characters.',
  'event.errorDates': 'The end date must be after the start date.',
  'event.errorCapacity': 'Enter a capacity greater than zero.',
  'event.notFound': 'This event does not exist or you cannot view it.',
  'event.back': 'Back to events',
  'event.empty': 'No events yet',
  'event.emptyHint': 'Create your first event to see it here with its code and sessions.',
  'event.new': 'New event',
  'event.info': 'Event details',
  'event.edit': 'Edit event',
  'event.description': 'Description',
  'event.location': 'Location',
  'event.capacity': 'Capacity',
  'event.registrationDeadline': 'Registration deadline',
  'event.createdAt': 'Created',
  'event.noDeadline': 'No deadline',
  'event.save': 'Save changes',
  'event.saving': 'Saving…',
  'event.errorDeadline': 'The registration deadline must be before the start date.',
  'event.stats.registrants': 'Registrants',
  'event.stats.attendance': 'Attendance',
  'event.stats.rate': 'Attendance rate',
  'event.registrants': 'Event registrants',
  'event.emptyRegistrants': 'No one has registered for this event yet.',
  'event.registeredAt': 'Registered',
  'event.exportRegistrants': 'Export CSV',
  'event.exportRegistrantsAria': 'Export registrants to a CSV file',
  'event.csvName': 'Name',
  'event.csvRegisteredAt': 'Registered at',
  'session.new': 'New session',
  'session.event': 'Event',
  'session.eventPlaceholder': 'Choose an event',
  'session.errorEvent': 'Choose an event for this session.',
  'session.needEvent': 'Create an event first, then add its sessions.',
  'session.createEvent': 'Create event',
  'session.title': 'Session title',
  'session.startsAt': 'Start time',
  'session.duration': 'Duration (minutes)',
  'session.lateness': 'Lateness allowance (minutes)',
  'session.create': 'Create session',
  'session.creating': 'Creating…',
  'session.errorTitle': 'Enter a title of at least 3 characters.',
  'session.errorLateness': 'Enter a lateness allowance between 0 and 120 minutes.',
  'session.errorStartsAt': 'Choose a start time for the session.',
  'session.empty': 'No sessions yet',
  'session.emptyHint': 'Add a session to show its check-in code and record attendance.',
  'session.status.scheduled': 'Scheduled',
  'session.status.active': 'Active',
  'session.status.closed': 'Closed',
  'session.open': 'Open session',
  'session.activate': 'Activate',
  'session.close': 'Close',
  'session.qr': 'Check-in code',
  'session.qrHint': 'Show this code to participants. The session closes automatically when its duration ends.',
  'session.checkInCode': 'Check-in code',
  'session.checkInHint': 'Participants enter this code or scan the barcode to check in.',
  'session.qrLabel': 'Check-in barcode',
  'session.attendance': 'Attendance',
  'session.emptyAttendance': 'No attendance yet',
  'session.export': 'Export CSV',
  'session.edit': 'Edit',
  'session.save': 'Save changes',
  'session.saving': 'Saving…',
  'session.method': 'Attendance method',
  'session.method.face_to_face': 'In person',
  'session.method.online': 'Online',
  'session.emptySessionAttendance': 'No one has checked in to this session yet.',
  'session.errorDuration': 'Enter a duration between 5 and 480 minutes.',
  'attendance.present': 'Present',
  'attendance.late': 'Late',
  'attendance.absent': 'Absent',
  'participant.summary': 'My attendance',
  'participant.totalSessions': 'Sessions',
  'participant.attended': 'Attended',
  'participant.lateCount': 'Late',
  'participant.rate': 'Attendance rate',
  'participant.attendance': 'Attendance record',
  'participant.emptyAttendance': 'You have not checked in to any session yet.',
  'participant.registrations': 'My registrations',
  'participant.emptyRegistrations': 'You have not registered for any event yet.',
  'participant.deadline': 'Registration deadline',
  'participant.noDeadline': 'No deadline',
};

export const dictionaries: Record<Locale, Dict> = { ar, en };

export function isLocale(value: string | null): value is Locale {
  return value === 'ar' || value === 'en';
}

export function dirFor(locale: Locale): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
