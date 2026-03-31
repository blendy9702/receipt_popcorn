const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const authBase = stripTrailingSlash(
  process.env.EXTERNAL_AUTH_BASE ?? "http://127.0.0.1:8000",
);
const internalBase = stripTrailingSlash(
  process.env.INTERNAL_API_BASE ?? "http://127.0.0.1:8000",
);

export const EXTERNAL_API = {
  authBase,
  internalBase,
  account:
    process.env.EXTERNAL_ACCOUNT_API ?? `${internalBase}/api/account`,
  login:
    process.env.EXTERNAL_LOGIN_URL ?? `${authBase}/api/external/login`,
  ssoIssue:
    process.env.EXTERNAL_SSO_ISSUE_URL ?? `${authBase}/api/external/sso/issue`,
  ssoExchange:
    process.env.EXTERNAL_SSO_EXCHANGE_URL ?? `${authBase}/api/external/sso/exchange`,
  ssoSessionLogin:
    process.env.EXTERNAL_SSO_SESSION_LOGIN_URL ??
    `${authBase}/api/external/sso/session-login`,
  usersExists:
    process.env.EXTERNAL_USERS_EXISTS_URL ??
    `${authBase}/api/external/users/exists`,
  ticketsBalance:
    process.env.EXTERNAL_TICKETS_BALANCE_URL ??
    `${internalBase}/api/tickets/balance`,
  ticketsLedger:
    process.env.EXTERNAL_TICKETS_LEDGER_URL ??
    `${internalBase}/api/tickets/ledger`,
  ticketsTransfer:
    process.env.EXTERNAL_TICKETS_TRANSFER_URL ??
    `${internalBase}/api/tickets/transfer`,
  parentMyChildrenTree:
    process.env.EXTERNAL_PARENT_MY_CHILDREN_TREE_URL ??
    `${internalBase}/api/parent/my-children-tree`,
  parentCreateChild:
    process.env.EXTERNAL_PARENT_CREATE_CHILD_URL ??
    `${internalBase}/api/parent/create-child`,
  parentToggleChildStatus:
    process.env.EXTERNAL_PARENT_TOGGLE_CHILD_STATUS_URL ??
    `${internalBase}/api/parent/toggle-child-status`,
  parentDeleteChild:
    process.env.EXTERNAL_PARENT_DELETE_CHILD_URL ??
    `${internalBase}/api/parent/delete-child`,
  parentMyChildren:
    process.env.EXTERNAL_PARENT_MY_CHILDREN_URL ??
    `${internalBase}/api/parent/my-children`,
  parentAllowedPlaces:
    process.env.EXTERNAL_PARENT_ALLOWED_PLACES_URL ??
    `${internalBase}/api/parent/allowed-places`,
  parentChildAssignedPlaces:
    process.env.EXTERNAL_PARENT_CHILD_ASSIGNED_PLACES_URL ??
    `${internalBase}/api/parent/child-assigned-places`,
  parentSaveChildAssignedPlaces:
    process.env.EXTERNAL_PARENT_SAVE_CHILD_ASSIGNED_PLACES_URL ??
    `${internalBase}/api/parent/save-child-assigned-places`,
  adminPasswordResetLink:
    process.env.EXTERNAL_ADMIN_PASSWORD_RESET_LINK_URL ??
    `${internalBase}/api/admin/password-reset-link`,
  notificationsMe:
    process.env.EXTERNAL_NOTIFICATIONS_ME_URL ??
    `${internalBase}/api/notifications/me`,
  managementPlaces:
    process.env.EXTERNAL_MANAGEMENT_PLACES_URL ??
    `${internalBase}/api/management/places`,
  reviewsByPlace:
    process.env.EXTERNAL_REVIEWS_BY_PLACE_URL ??
    `${internalBase}/api/reviews/by-place`,
  placesBase:
    process.env.EXTERNAL_PLACES_BASE_URL ?? `${internalBase}/api/places`,
  reviewScriptsBase:
    process.env.EXTERNAL_REVIEW_SCRIPTS_BASE_URL ??
    `${internalBase}/api/review-scripts`,
  reviewAudience:
    process.env.REVIEW_SSO_AUDIENCE ?? "review.popcorn1.me",
  reviewSsoEntry:
    process.env.REVIEW_SSO_ENTRY_URL ??
    "https://review.popcorn1.me/sso/callback",
  reviewSessionCookieName:
    process.env.REVIEW_SESSION_COOKIE_NAME ?? "review_session",
  reviewPublicOrigin:
    process.env.REVIEW_PUBLIC_ORIGIN ?? "https://review.popcorn1.me",
  popcornReviewSsoStartUrl:
    process.env.POPCORN_REVIEW_SSO_START_URL ??
    "https://popcorn1.me/api/review-sso/start",
  popcornLogoutUrl:
    process.env.POPCORN_LOGOUT_URL ??
    "https://popcorn1.me/api/logout/start",
} as const;
