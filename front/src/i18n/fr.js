const translations = {
  actions: 'Actions',
  delete: 'Supprimer',
  add: 'Ajouter',
  validate: 'Valider',
  cancel: 'Annuler',
  menu_overview: "Vue d'ensemble",
  menu_users: 'Utilisateurs',
  menu_settings: 'Paramètres',
  loading: 'Chargement des données...',
  user_email: 'Email',
  user_data: 'Données',
  user_nb_devices: "Nb d'appareils",
  user_nb_devices_value: '$nb appareils',
  user_nb_codes_and_accounts: 'Nb de comptes et codes',
  user_nb_codes_value: '$nb codes',
  user_nb_accounts_value: '$nb comptes',
  user_nb_shared_items_value: 'dont $nb partagés',
  user_passwords_stats: 'Stats des mots de passe (partagés ou non)',
  user_passwords_weak: '$nb faibles',
  user_passwords_medium: '$nb moyens',
  user_passwords_strong: '$nb forts',
  user_passwords_reused: 'dont $nb réutilisés',
  user_delete_warning:
    'Attention, vous allez supprimer $email et toutes ses données. Cette action est irréversible.',
  devices_for_user: 'Appareils de $email',
  device_name: "Nom de l'appareil",
  device_app_version: "Version de l'app",
  device_type: 'Type',
  device_status: 'Statut',
  device_last_session: 'Dernière session',
  device_deactivate: 'Désactiver',
  device_authorize: 'Autoriser',
  device_delete_warning:
    "Ceci supprimera définitivement cet appareil et son historique.\n\nVous pouvez utiliser l'option Désactiver pour ne plus autoriser les connexions à partir de cet appareil tout en gardant son historique.\n\nContinuer la suppression ?",
  device_deactivate_warning:
    'Cet appareil ne sera plus autorisé mais restera dans la liste.\n\nDésactiver ?',
  device_authorize_warning:
    "Cet appareil sera autorisé sans que l'utilisateur n'ait besoin de valider son adresse email.\n\nAssurez-vous que la demande provienne bien d'un utilisateur légitime !\n\nAutoriser l'appareil ?",
  password_reset_requests: 'Demandes de réinitialisation de mot de passe',
  password_reset_request_status: 'Statut',
  password_reset_request_expired: 'Token expiré',
  password_reset_request_valid_until: "Email envoyé. Jeton valide jusqu'au $date.",
  password_reset_request_grant: 'Accorder',
  password_reset_request_delete_warning:
    'Voulez-vous supprimer cette demande de réinitialisation de mot de passe ?',
  password_reset_request_grant_warning:
    "Assurez-vous que la requête a bien été faite par l'utilisateur lui-même.\n\nAccorder ?",
  settings_security: 'Paramètres de sécurité',
  settings_reset_pwd_admin_check:
    "Pour réinitialiser son mot de passe, un utilisateur doit obtenir une validation d'un administrateur :",
  settings_change: 'Changer',
  yes: 'OUI',
  no: 'NON',
  settings_allowed_emails: 'Adresses email autorisées',
  settings_allowed_emails_pattern:
    "Vous pouvez saisir des adresses email entières ou utiliser la syntaxe *@domaine.fr pour autoriser toutes les adresses d'un domaine.",
  settings_allowed_emails_email_pattern: 'Email',
  settings_allowed_emails_new: "Nouveau modèle d'adresse email",
  settings_allowed_emails_delete_warning:
    "Ceci ne supprimera pas les coffres-forts pour les utilisateurs correspondant à ce modèle d'adresse email.\n\nSupprimer ?",
};

export default translations;
