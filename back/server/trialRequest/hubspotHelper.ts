// import * as hubspot from '@hubspot/api-client';
// import { FilterOperatorEnum } from '@hubspot/api-client/lib/codegen/crm/contacts/models/Filter.js';
// import { PublicUpdateSubscriptionStatusRequestLegalBasisEnum } from '@hubspot/api-client/lib/codegen/communication_preferences/models/all';
import env from '../helpers/env';

export const DIRECT_ACTIVITY_HUBSPOT_MAPPING = {
  industry: 'Industrie',
  retail_distribution: 'Commerce / Distribution',
  construction_real_estate_civil_engineering: 'Bâtiment / Immobilier / Travaux publics',
  transport_logistics: 'Transport / Logistique',
  arts_medias_communication: 'Arts / Médias / Communication',
  it_telecom: 'IT/Telecom',
  public_sector: 'Secteur Public',
  education: 'Education',
  health: 'Santé',
  bank: 'Banque et Finance',
  managed_service_provider: 'MSP Infogérance',
  non_profit_organization: 'Association',
  student: 'Etudiant',
  individual: 'Particulier',
};

export const COMPANY_SIZE_HUBSPOT_MAPPING = {
  '1-49': '1 à 49',
  '50-99': '50 à 99',
  '100-249': '100 à 249',
  '250-499': '250 à 499',
  '500-999': '500 à 999',
  '1000-4999': '1000 à 4999',
  '5000-9999': '5000 à 9999',
  '10000+': '10 000 et plus',
};

export type DirectActivity = keyof typeof DIRECT_ACTIVITY_HUBSPOT_MAPPING;
export type CompanySize = keyof typeof COMPANY_SIZE_HUBSPOT_MAPPING;

export type TrialRequestBodyCommon = {
  language: 'fr' | 'en';
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  company: string;
  zip: string;
  marketingConsent: boolean;
  privacyConsent: boolean;
  hutk?: string;
  ipAddress?: string;
};
export type TrialRequestBody = TrialRequestBodyCommon &
  (
    | {
        activityType: 'enterprise';
        businessSector: DirectActivity;
        employeeCount: CompanySize;
      }
    | {
        activityType: 'msp';
      }
  );

export type SignedTrialPayload = TrialRequestBody & {
  issuedAt: number;
  expiresAt: number;
};

const assertHubspotEnvConfig = (): void => {
  const requiredHubspotEnvVars = [
    env.HUBSPOT_RG_API_TOKEN,
    env.HUBSPOT_RG_PORTAL_ID,
    env.HUBSPOT_RG_FORM_ID,
    env.HUBSPOT_RG_NEWSLETTER_SUBSCRIPTION_ID,
    env.HUBSPOT_ZAZA_API_TOKEN,
    env.HUBSPOT_ZAZA_PORTAL_ID,
    env.HUBSPOT_ZAZA_FORM_ID,
    env.HUBSPOT_ZAZA_NEWSLETTER_SUBSCRIPTION_ID,
  ];

  if (requiredHubspotEnvVars.some((value) => !value)) {
    throw new Error('Missing HubSpot environment configuration');
  }
};

const buildHubspotFormFields = (
  payload: SignedTrialPayload,
): Array<{ name: string; value: string }> => {
  const fields: Array<{ name: string; value: string }> = [
    { name: 'email', value: payload.email },
    { name: 'firstname', value: payload.firstname },
    { name: 'lastname', value: payload.lastname },
    { name: 'phone', value: payload.phone },
    { name: 'company', value: payload.company },
    { name: 'zip', value: payload.zip },
    { name: 'marketing_assignment_picklist', value: 'SIT - UpSignOn' },
    { name: 'langue_principale', value: payload.language === 'fr' ? 'Francais' : 'Anglais' },
  ];

  if (payload.activityType === 'enterprise') {
    fields.push({
      name: 'secteur_d_activite__it_solutions_',
      value: DIRECT_ACTIVITY_HUBSPOT_MAPPING[payload.businessSector],
    });
    fields.push({
      name: 'nombre_de_salaries__hr_solutions_',
      value: COMPANY_SIZE_HUBSPOT_MAPPING[payload.employeeCount],
    });
  }

  return fields.map((field) => ({
    objectTypeId: '0-1',
    name: field.name,
    value: field.value,
  }));
};

export const submitHubspotTrialForm = async (payload: SignedTrialPayload): Promise<void> => {
  assertHubspotEnvConfig();

  const hubspotConfig =
    payload.activityType === 'enterprise'
      ? {
          subscriptionId: env.HUBSPOT_ZAZA_NEWSLETTER_SUBSCRIPTION_ID!,
          portalId: env.HUBSPOT_ZAZA_PORTAL_ID!,
          formId: env.HUBSPOT_ZAZA_FORM_ID!,
          apiToken: env.HUBSPOT_ZAZA_API_TOKEN!,
        }
      : {
          subscriptionId: env.HUBSPOT_RG_NEWSLETTER_SUBSCRIPTION_ID!,
          portalId: env.HUBSPOT_RG_PORTAL_ID!,
          formId: env.HUBSPOT_RG_FORM_ID!,
          apiToken: env.HUBSPOT_RG_API_TOKEN!,
        };

  const getLegalConsentText = (language: 'fr' | 'en') => {
    if (language === 'en') {
      return 'By clicking "Submit" below, I agree that Septeo IT Solutions may store and process my personal data. For more information, please see our "privacy policy".';
    }
    return "En cliquant sur « Envoyer » ci-dessous, j'accepte que Septeo IT Solutions stocke et traite mes données personnelles. Pour plus d'informations veuillez consulter notre page « politique de confidentialité ».";
  };

  const getMarketingConsentText = (language: 'fr' | 'en') => {
    if (language === 'en') {
      return 'I would like to receive news, webinar invitations, information and events from Septeo IT Solutions.';
    }
    return 'Je souhaite recevoir les actualités, invitations à des webinaires, informations et événements de Septeo IT Solutions.';
  };

  const formPayload = {
    fields: buildHubspotFormFields(payload),
    submittedAt: payload.issuedAt,
    context: {
      hutk: payload.hutk || undefined,
      ipAddress: payload.ipAddress || undefined,
      pageName: 'UpSignOn Trial Request',
      pageUri: `${env.FRONTEND_URL}/trial-request`,
    },
    legalConsentOptions: {
      consent: {
        consentToProcess: true,
        text: getLegalConsentText(payload.language),
        communications: payload.marketingConsent
          ? [
              {
                value: true,
                subscriptionTypeId: hubspotConfig.subscriptionId,
                text: getMarketingConsentText(payload.language),
              },
            ]
          : [],
      },
    },
  };

  const submitWithRetry = async (retries = 2): Promise<void> => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // https://developers.hubspot.com/docs/api-reference/legacy/marketing/forms/v3-legacy/submit-data-authenticated
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const response = await fetch(
          `https://api.hsforms.com/submissions/v3/integration/secure/submit/${encodeURIComponent(
            hubspotConfig.portalId,
          )}/${encodeURIComponent(hubspotConfig.formId)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${hubspotConfig.apiToken}`,
            },
            body: JSON.stringify(formPayload),
            signal: controller.signal,
          },
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Retry on 5xx errors or 429 (rate limit), but not on 4xx client errors
          if ((response.status >= 500 || response.status === 429) && attempt < retries) {
            const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
            await new Promise((resolve) => setTimeout(resolve, delayMs));
            continue;
          }

          throw new Error(`HubSpot forms submission failed with status ${response.status}`);
        }

        const responseData = await response.json();
        console.log(
          'HubSpot form submitted successfully. Redirect provided:',
          !!responseData.redirectUri,
        );
        return; // Success, exit retry loop
      } catch (error) {
        // If it's the last attempt, throw the error
        if (attempt === retries) {
          throw error;
        }

        // For network errors or timeouts on non-final attempts, wait and retry
        if (
          error instanceof Error &&
          (error.name === 'AbortError' || error.message.includes('fetch'))
        ) {
          const delayMs = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // For other errors, don't retry
        throw error;
      }
    }
  };

  await submitWithRetry();
};

// export const createHubspotProspect = async (payload: SignedTrialPayload): Promise<void> => {
//   assertHubspotEnvConfig();

//   try {
//     await submitHubspotTrialForm(payload);
//   } catch (error) {
//     console.error('Failed to submit HubSpot trial form:', error);
//   }

//   const hubspotClient = new hubspot.Client({
//     accessToken: env.HUBSPOT_RG_API_TOKEN,
//   });

//   const contactProperties: Record<string, string> = {
//     email: payload.email,
//     firstname: payload.firstname,
//     lastname: payload.lastname,
//     phone: payload.phone,
//     company: payload.company,
//     zip: payload.zip,
//     marketing_assignment_picklist: 'SIT - UpSignOn',
//     langue_principale: payload.language === 'fr' ? 'Francais' : 'Anglais',
//   };
//   if (payload.activityType === 'enterprise') {
//     contactProperties['secteur_d_activite__it_solutions_'] =
//       DIRECT_ACTIVITY_HUBSPOT_MAPPING[payload.businessSector];
//     contactProperties['nombre_de_salaries__hr_solutions_'] =
//       COMPANY_SIZE_HUBSPOT_MAPPING[payload.employeeCount];
//   }

//   const searchResult = await hubspotClient.crm.contacts.searchApi.doSearch({
//     filterGroups: [
//       {
//         filters: [
//           {
//             propertyName: 'email',
//             operator: FilterOperatorEnum.Eq,
//             value: payload.email,
//           },
//         ],
//       },
//     ],
//     limit: 1,
//     properties: ['email'],
//   });

//   if (searchResult.total > 0 && searchResult.results[0]?.id) {
//     await hubspotClient.crm.contacts.basicApi.update(searchResult.results[0].id, {
//       properties: contactProperties,
//     });
//     return;
//   }

//   await hubspotClient.crm.contacts.basicApi.create({
//     properties: contactProperties,
//   });

//   if (payload.marketingConsent) {
//     try {
//       await hubspotClient.communicationPreferences.statusApi.subscribe({
//         subscriptionId: env.HUBSPOT_RG_NEWSLETTER_SUBSCRIPTION_ID!,
//         emailAddress: payload.email,
//         legalBasis: PublicUpdateSubscriptionStatusRequestLegalBasisEnum.ConsentWithNotice,
//         legalBasisExplanation:
//           'The user voluntarily subscribed to the newsletter when signing up for a trial on the UpSignOn website.',
//       });
//     } catch (error) {
//       console.error('Failed to subscribe contact to newsletter:', error);
//     }
//   }
// };
