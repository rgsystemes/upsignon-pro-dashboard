const translations = {
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
  user_actions: 'Actions',
  user_action_delete: 'Supprimer',
  user_delete_warning:
    'Attention, vous allez supprimer $email et toutes ses données. Cette action est irréversible.',
  devices_for_user: 'Appareils de $email',
  device_name: "Nom de l'appareil",
  device_app_version: "Version de l'app",
  device_type: 'Type',
  device_status: 'Statut',
  device_last_session: 'Dernière session',
  device_actions: 'Actions',
  device_delete: 'Supprimer',
  device_revoke: 'Révoquer',
  device_authorize: 'Autoriser',
  device_delete_warning:
    "Ceci supprimera définitivement cet appareil et son historique.\n\nVous pouvez utiliser l'option Révoquer pour ne plus autoriser les connexions à partir de cet appareil tout en gardant son historique.\n\nContinuer la suppression ?",
  device_revoke_warning:
    'Cet appareil ne sera plus autorisé mais restera dans la liste.\n\nRévoquer ?',
  device_authorize_warning:
    "Cet appareil sera autorisé sans que l'utilisateur n'ait besoin de valider son adresse email.\n\nAssurez-vous que la demande provient bien d'un utilisateur légitime !\n\nAutoriser l'appareil ?",
};

export default translations;
