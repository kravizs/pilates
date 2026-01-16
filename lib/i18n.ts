export type Language = "en" | "fr" | "es"

export interface Translations {
  nav: {
    home: string
    method: string
    schedule: string
    pricing: string
    shop: string
    contact: string
    becomeCoach: string
    book: string
    information: string
    planning: string
    account: string
  }
  hero: {
    title: string
    subtitle: string
    cta: string
  }
  about: {
    title: string
    description: string
  }
  classes: {
    title: string
    yoga: string
    pilates: string
    meditation: string
    fitness: string
  }
  booking: {
    title: string
    selectClass: string
    selectTime: string
    confirm: string
  }
  information: {
    title: string
    subtitle: string
    disciplines: string
    coaches: string
  }
  disciplines: {
    pilates: string
    yoga: string
    barre: string
  }
  levels: {
    all: string
    beginner: string
    intermediate: string
  }
  coaches: {
    sarah: string
    emma: string
    lucas: string
  }
  pricing: {
    title: string
    subtitle: string
    single: string
    singleDesc: string
    pack: string
    packDesc: string
    unlimited: string
    unlimitedDesc: string
    popular: string
    choose: string
    features: {
      access: string
      booking: string
      cancel: string
      validity: string
      unlimited: string
      priority: string
      guest: string
      workshops: string
    }
    info: {
      title: string
      firstTime: string
      student: string
      corporate: string
      freeze: string
    }
  }
  planning: {
    title: string
    subtitle: string
    thisWeek: string
    selectDate: string
    book: string
    full: string
    featured: string
    featuredDesc: string
    info: string
    policies: string
    policy1: string
    policy2: string
    policy3: string
  }
  account: {
    welcome: string
    subtitle: string
    overview: string
    classes: string
    membership: string
    settings: string
    nextClass: string
    viewDetails: string
    upcoming: string
    history: string
    cancel: string
    currentPlan: string
    upgrade: string
    invoice: string
    profile: string
    firstName: string
    lastName: string
    email: string
    save: string
    edit: string
    loginRequired: string
    loginMessage: string
  }
  auth: {
    login: string
    register: string
    logout: string
    email: string
    password: string
    confirmPassword: string
    name: string
    phone: string
    loginDescription: string
    registerDescription: string
    emailPlaceholder: string
    passwordPlaceholder: string
    confirmPasswordPlaceholder: string
    namePlaceholder: string
    phonePlaceholder: string
    loggingIn: string
    registering: string
    noAccount: string
    hasAccount: string
    passwordMismatch: string
  }
  newsletter: {
    title: string
    description: string
    placeholder: string
    subscribe: string
    subscribing: string
    success: string
    successMessage: string
  }
  footer: {
    address: string
    phone: string
    email: string
    hours: string
    followUs: string
    quickLinks: string
    rights: string
  }
}

export const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: "Home",
      method: "The Method",
      schedule: "Schedule",
      pricing: "Pricing",
      shop: "Shop",
      contact: "Contact",
      becomeCoach: "Become a Coach",
      book: "Book Now",
      information: "Information",
      planning: "Planning",
      account: "My Account",
    },
    hero: {
      title: "Transform Your Body & Mind",
      subtitle:
        "Discover our unique wellness method combining movement, mindfulness, and community in the heart of the city.",
      cta: "Start Your Journey",
    },
    about: {
      title: "Our Method",
      description: "Your wellness journey starts here. Join our community of mindful movement and holistic health.",
    },
    classes: {
      title: "Our Classes",
      yoga: "Yoga",
      pilates: "Pilates",
      meditation: "Meditation",
      fitness: "Fitness",
    },
    booking: {
      title: "Book Your Session",
      selectClass: "Select Class",
      selectTime: "Select Time",
      confirm: "Confirm Booking",
    },
    information: {
      title: "About Hi Studio",
      subtitle: "Discover our disciplines, meet our expert coaches, and learn about our wellness philosophy",
      disciplines: "Our Disciplines",
      coaches: "Meet Our Coaches",
    },
    disciplines: {
      pilates: "Strengthen your core and improve flexibility",
      yoga: "Find balance and inner peace",
      barre: "Ballet-inspired fitness workout",
    },
    levels: {
      all: "All levels",
      beginner: "Beginner to Advanced",
      intermediate: "Intermediate",
    },
    coaches: {
      sarah: "Certified instructor with expertise in rehabilitation",
      emma: "Former professional dancer and fitness enthusiast",
      lucas: "Mindfulness expert and certified yoga instructor",
    },
    pricing: {
      title: "Pricing & Memberships",
      subtitle: "Choose the perfect plan for your wellness journey",
      single: "Single Class",
      singleDesc: "Perfect for trying out our classes",
      pack: "5-Class Pack",
      packDesc: "Great value for regular practice",
      unlimited: "Unlimited Monthly",
      unlimitedDesc: "Unlimited access to all classes",
      popular: "Most Popular",
      choose: "Choose Plan",
      features: {
        access: "Access to all disciplines",
        booking: "Online booking",
        cancel: "Free cancellation 2h before",
        validity: "Valid for 2 months",
        unlimited: "Unlimited classes",
        priority: "Priority booking",
        guest: "Bring a friend once/month",
        workshops: "Access to workshops",
      },
      info: {
        title: "Additional Information",
        firstTime: "First-time visitors get 20% off their first class",
        student: "Student discount available with valid ID",
        corporate: "Corporate packages available for groups of 5+",
        freeze: "Membership freeze options available",
      },
    },
    planning: {
      title: "Class Schedule",
      subtitle: "Book your favorite classes and plan your wellness journey",
      thisWeek: "This Week",
      selectDate: "Select Date",
      book: "Book",
      full: "Full",
      featured: "Featured Classes",
      featuredDesc: "Popular classes this week",
      info: "Studio Info",
      policies: "Booking Policies",
      policy1: "Cancel up to 2 hours before class",
      policy2: "Arrive 10 minutes early",
      policy3: "Bring your own mat or rent one",
    },
    account: {
      welcome: "Welcome back",
      subtitle: "Manage your classes, profile, and membership",
      overview: "Overview",
      classes: "Classes",
      membership: "Membership",
      settings: "Settings",
      nextClass: "Next Class",
      viewDetails: "View Details",
      upcoming: "Upcoming Classes",
      history: "Class History",
      cancel: "Cancel",
      currentPlan: "Current Plan",
      upgrade: "Upgrade Plan",
      invoice: "Download Invoice",
      profile: "Profile Settings",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email",
      save: "Save Changes",
      edit: "Edit Profile",
      loginRequired: "Login Required",
      loginMessage: "Please log in to access your account",
    },
    auth: {
      login: "Login",
      register: "Sign Up",
      logout: "Logout",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      name: "Full Name",
      phone: "Phone",
      loginDescription: "Enter your credentials to access your account",
      registerDescription: "Create your account to start booking classes",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      confirmPasswordPlaceholder: "Confirm your password",
      namePlaceholder: "Enter your full name",
      phonePlaceholder: "Enter your phone number",
      loggingIn: "Logging in...",
      registering: "Creating account...",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      passwordMismatch: "Passwords don't match",
    },
    newsletter: {
      title: "Stay Updated",
      description: "Get the latest wellness tips and class updates delivered to your inbox",
      placeholder: "Enter your email",
      subscribe: "Subscribe",
      subscribing: "Subscribing...",
      success: "Thank you for subscribing!",
      successMessage: "You'll receive our latest updates and wellness tips.",
    },
    footer: {
      address: "123 Wellness Street, Paris, France",
      phone: "+33 1 23 45 67 89",
      email: "hello@histudio.com",
      hours: "Mon-Sun: 7:00 - 21:00",
      followUs: "Follow Us",
      quickLinks: "Quick Links",
      rights: "All rights reserved.",
    },
  },
  fr: {
    nav: {
      home: "Accueil",
      method: "La Méthode",
      schedule: "Planning",
      pricing: "Tarifs",
      shop: "Boutique",
      contact: "Contact",
      becomeCoach: "Devenir Coach",
      book: "Réserver",
      information: "Informations",
      planning: "Planning",
      account: "Mon Compte",
    },
    hero: {
      title: "Transformez Votre Corps & Esprit",
      subtitle:
        "Découvrez notre méthode unique de bien-être alliant mouvement, pleine conscience et communauté au cœur de la ville.",
      cta: "Commencer Votre Parcours",
    },
    about: {
      title: "Notre Méthode",
      description:
        "Votre parcours bien-être commence ici. Rejoignez notre communauté de mouvement conscient et de santé holistique.",
    },
    classes: {
      title: "Nos Cours",
      yoga: "Yoga",
      pilates: "Pilates",
      meditation: "Méditation",
      fitness: "Fitness",
    },
    booking: {
      title: "Réservez Votre Séance",
      selectClass: "Choisir le Cours",
      selectTime: "Choisir l'Heure",
      confirm: "Confirmer la Réservation",
    },
    information: {
      title: "À Propos de Hi Studio",
      subtitle: "Découvrez nos disciplines, rencontrez nos coachs experts et apprenez notre philosophie du bien-être",
      disciplines: "Nos Disciplines",
      coaches: "Rencontrez Nos Coachs",
    },
    disciplines: {
      pilates: "Renforcez votre centre et améliorez votre flexibilité",
      yoga: "Trouvez l'équilibre et la paix intérieure",
      barre: "Entraînement fitness inspiré du ballet",
    },
    levels: {
      all: "Tous niveaux",
      beginner: "Débutant à Avancé",
      intermediate: "Intermédiaire",
    },
    coaches: {
      sarah: "Instructrice certifiée avec expertise en rééducation",
      emma: "Ancienne danseuse professionnelle et passionnée de fitness",
      lucas: "Expert en pleine conscience et instructeur de yoga certifié",
    },
    pricing: {
      title: "Tarifs & Abonnements",
      subtitle: "Choisissez le plan parfait pour votre parcours bien-être",
      single: "Cours Unique",
      singleDesc: "Parfait pour essayer nos cours",
      pack: "Pack 5 Cours",
      packDesc: "Excellent rapport qualité-prix pour une pratique régulière",
      unlimited: "Illimité Mensuel",
      unlimitedDesc: "Accès illimité à tous les cours",
      popular: "Le Plus Populaire",
      choose: "Choisir le Plan",
      features: {
        access: "Accès à toutes les disciplines",
        booking: "Réservation en ligne",
        cancel: "Annulation gratuite 2h avant",
        validity: "Valable 2 mois",
        unlimited: "Cours illimités",
        priority: "Réservation prioritaire",
        guest: "Amenez un ami une fois/mois",
        workshops: "Accès aux ateliers",
      },
      info: {
        title: "Informations Supplémentaires",
        firstTime: "Les nouveaux visiteurs bénéficient de 20% de réduction sur leur premier cours",
        student: "Réduction étudiante disponible avec une pièce d'identité valide",
        corporate: "Forfaits entreprise disponibles pour les groupes de 5+",
        freeze: "Options de gel d'abonnement disponibles",
      },
    },
    planning: {
      title: "Planning des Cours",
      subtitle: "Réservez vos cours préférés et planifiez votre parcours bien-être",
      thisWeek: "Cette Semaine",
      selectDate: "Sélectionner la Date",
      book: "Réserver",
      full: "Complet",
      featured: "Cours en Vedette",
      featuredDesc: "Cours populaires cette semaine",
      info: "Infos Studio",
      policies: "Politiques de Réservation",
      policy1: "Annulez jusqu'à 2 heures avant le cours",
      policy2: "Arrivez 10 minutes en avance",
      policy3: "Apportez votre tapis ou louez-en un",
    },
    account: {
      welcome: "Bon retour",
      subtitle: "Gérez vos cours, profil et abonnement",
      overview: "Aperçu",
      classes: "Cours",
      membership: "Abonnement",
      settings: "Paramètres",
      nextClass: "Prochain Cours",
      viewDetails: "Voir les Détails",
      upcoming: "Cours à Venir",
      history: "Historique des Cours",
      cancel: "Annuler",
      currentPlan: "Plan Actuel",
      upgrade: "Améliorer le Plan",
      invoice: "Télécharger la Facture",
      profile: "Paramètres du Profil",
      firstName: "Prénom",
      lastName: "Nom",
      email: "Email",
      save: "Sauvegarder les Modifications",
      edit: "Modifier le Profil",
      loginRequired: "Connexion Requise",
      loginMessage: "Veuillez vous connecter pour accéder à votre compte",
    },
    auth: {
      login: "Connexion",
      register: "S'inscrire",
      logout: "Déconnexion",
      email: "Email",
      password: "Mot de passe",
      confirmPassword: "Confirmer le mot de passe",
      name: "Nom complet",
      phone: "Téléphone",
      loginDescription: "Entrez vos identifiants pour accéder à votre compte",
      registerDescription: "Créez votre compte pour commencer à réserver des cours",
      emailPlaceholder: "Entrez votre email",
      passwordPlaceholder: "Entrez votre mot de passe",
      confirmPasswordPlaceholder: "Confirmez votre mot de passe",
      namePlaceholder: "Entrez votre nom complet",
      phonePlaceholder: "Entrez votre numéro de téléphone",
      loggingIn: "Connexion en cours...",
      registering: "Création du compte...",
      noAccount: "Vous n'avez pas de compte ?",
      hasAccount: "Vous avez déjà un compte ?",
      passwordMismatch: "Les mots de passe ne correspondent pas",
    },
    newsletter: {
      title: "Restez Informé",
      description: "Recevez les derniers conseils bien-être et mises à jour des cours dans votre boîte mail",
      placeholder: "Entrez votre email",
      subscribe: "S'abonner",
      subscribing: "Abonnement en cours...",
      success: "Merci de vous être abonné !",
      successMessage: "Vous recevrez nos dernières mises à jour et conseils bien-être.",
    },
    footer: {
      address: "123 Rue du Bien-être, Paris, France",
      phone: "+33 1 23 45 67 89",
      email: "bonjour@histudio.com",
      hours: "Lun-Dim: 7h00 - 21h00",
      followUs: "Suivez-nous",
      quickLinks: "Liens Rapides",
      rights: "Tous droits réservés.",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      method: "El Método",
      schedule: "Horarios",
      pricing: "Precios",
      shop: "Tienda",
      contact: "Contacto",
      becomeCoach: "Ser Entrenador",
      book: "Reservar",
      information: "Información",
      planning: "Planificación",
      account: "Mi Cuenta",
    },
    hero: {
      title: "Transforma Tu Cuerpo y Mente",
      subtitle:
        "Descubre nuestro método único de bienestar que combina movimiento, atención plena y comunidad en el corazón de la ciudad.",
      cta: "Comienza Tu Viaje",
    },
    about: {
      title: "Nuestro Método",
      description:
        "Tu viaje de bienestar comienza aquí. Únete a nuestra comunidad de movimiento consciente y salud holística.",
    },
    classes: {
      title: "Nuestras Clases",
      yoga: "Yoga",
      pilates: "Pilates",
      meditation: "Meditación",
      fitness: "Fitness",
    },
    booking: {
      title: "Reserva Tu Sesión",
      selectClass: "Seleccionar Clase",
      selectTime: "Seleccionar Hora",
      confirm: "Confirmar Reserva",
    },
    information: {
      title: "Acerca de Hi Studio",
      subtitle:
        "Descubre nuestras disciplinas, conoce a nuestros entrenadores expertos y aprende nuestra filosofía de bienestar",
      disciplines: "Nuestras Disciplinas",
      coaches: "Conoce a Nuestros Entrenadores",
    },
    disciplines: {
      pilates: "Fortalece tu core y mejora la flexibilidad",
      yoga: "Encuentra equilibrio y paz interior",
      barre: "Entrenamiento fitness inspirado en ballet",
    },
    levels: {
      all: "Todos los niveles",
      beginner: "Principiante a Avanzado",
      intermediate: "Intermedio",
    },
    coaches: {
      sarah: "Instructora certificada con experiencia en rehabilitación",
      emma: "Ex bailarina profesional y entusiasta del fitness",
      lucas: "Experto en mindfulness e instructor de yoga certificado",
    },
    pricing: {
      title: "Precios y Membresías",
      subtitle: "Elige el plan perfecto para tu viaje de bienestar",
      single: "Clase Individual",
      singleDesc: "Perfecto para probar nuestras clases",
      pack: "Paquete 5 Clases",
      packDesc: "Gran valor para práctica regular",
      unlimited: "Ilimitado Mensual",
      unlimitedDesc: "Acceso ilimitado a todas las clases",
      popular: "Más Popular",
      choose: "Elegir Plan",
      features: {
        access: "Acceso a todas las disciplinas",
        booking: "Reserva online",
        cancel: "Cancelación gratuita 2h antes",
        validity: "Válido por 2 meses",
        unlimited: "Clases ilimitadas",
        priority: "Reserva prioritaria",
        guest: "Trae un amigo una vez/mes",
        workshops: "Acceso a talleres",
      },
      info: {
        title: "Información Adicional",
        firstTime: "Los visitantes primerizos obtienen 20% de descuento en su primera clase",
        student: "Descuento estudiantil disponible con ID válida",
        corporate: "Paquetes corporativos disponibles para grupos de 5+",
        freeze: "Opciones de congelación de membresía disponibles",
      },
    },
    planning: {
      title: "Horario de Clases",
      subtitle: "Reserva tus clases favoritas y planifica tu viaje de bienestar",
      thisWeek: "Esta Semana",
      selectDate: "Seleccionar Fecha",
      book: "Reservar",
      full: "Lleno",
      featured: "Clases Destacadas",
      featuredDesc: "Clases populares esta semana",
      info: "Info del Studio",
      policies: "Políticas de Reserva",
      policy1: "Cancela hasta 2 horas antes de la clase",
      policy2: "Llega 10 minutos antes",
      policy3: "Trae tu propia esterilla o alquila una",
    },
    account: {
      welcome: "Bienvenido de vuelta",
      subtitle: "Gestiona tus clases, perfil y membresía",
      overview: "Resumen",
      classes: "Clases",
      membership: "Membresía",
      settings: "Configuración",
      nextClass: "Próxima Clase",
      viewDetails: "Ver Detalles",
      upcoming: "Clases Próximas",
      history: "Historial de Clases",
      cancel: "Cancelar",
      currentPlan: "Plan Actual",
      upgrade: "Mejorar Plan",
      invoice: "Descargar Factura",
      profile: "Configuración del Perfil",
      firstName: "Nombre",
      lastName: "Apellido",
      email: "Email",
      save: "Guardar Cambios",
      edit: "Editar Perfil",
      loginRequired: "Inicio de Sesión Requerido",
      loginMessage: "Por favor inicia sesión para acceder a tu cuenta",
    },
    auth: {
      login: "Iniciar Sesión",
      register: "Registrarse",
      logout: "Cerrar Sesión",
      email: "Email",
      password: "Contraseña",
      confirmPassword: "Confirmar Contraseña",
      name: "Nombre Completo",
      phone: "Teléfono",
      loginDescription: "Ingresa tus credenciales para acceder a tu cuenta",
      registerDescription: "Crea tu cuenta para comenzar a reservar clases",
      emailPlaceholder: "Ingresa tu email",
      passwordPlaceholder: "Ingresa tu contraseña",
      confirmPasswordPlaceholder: "Confirma tu contraseña",
      namePlaceholder: "Ingresa tu nombre completo",
      phonePlaceholder: "Ingresa tu número de teléfono",
      loggingIn: "Iniciando sesión...",
      registering: "Creando cuenta...",
      noAccount: "¿No tienes una cuenta?",
      hasAccount: "¿Ya tienes una cuenta?",
      passwordMismatch: "Las contraseñas no coinciden",
    },
    newsletter: {
      title: "Mantente Actualizado",
      description: "Recibe los últimos consejos de bienestar y actualizaciones de clases en tu bandeja de entrada",
      placeholder: "Ingresa tu email",
      subscribe: "Suscribirse",
      subscribing: "Suscribiendo...",
      success: "¡Gracias por suscribirte!",
      successMessage: "Recibirás nuestras últimas actualizaciones y consejos de bienestar.",
    },
    footer: {
      address: "123 Calle Bienestar, París, Francia",
      phone: "+33 1 23 45 67 89",
      email: "hola@histudio.com",
      hours: "Lun-Dom: 7:00 - 21:00",
      followUs: "Síguenos",
      quickLinks: "Enlaces Rápidos",
      rights: "Todos los derechos reservados.",
    },
  },
}

export const getTranslations = (lang: Language): Translations => {
  return translations[lang] || translations.en
}
