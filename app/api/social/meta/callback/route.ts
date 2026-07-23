import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-server";
import {
  debugToken,
  discoverPageById,
  discoverPages,
  exchangeCodeForToken,
  getInstagramBusiness,
  getLongLivedToken,
  getMetaBusinessLoginEnv,
  getMetaOAuthPlan,
  getSelectedMetaPageIds,
  tokenExpiryInfo,
} from "@/services/meta/oauth";
import { connectMetaAccount } from "@/services/social/accounts";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

const CONNECTED_ACCOUNTS_PATH = "/dashboard/social/accounts";

function redirectToConnectedAccounts(req: NextRequest, params: Record<string, string>) {
  const target = new URL(CONNECTED_ACCOUNTS_PATH, req.url);
  for (const [key, value] of Object.entries(params)) {
    target.searchParams.set(key, value);
  }
  logger.info("auth", "Meta OAuth final redirect target", {
    finalRedirectTarget: `${target.pathname}${target.search}`,
    routeExists: true,
  });
  return NextResponse.redirect(target);
}

/**
 * Meta OAuth callback. Tokens and authorization codes never enter logs or
 * client responses.
 */
export async function GET(req: NextRequest) {
  const perm = await requirePermission("SOCIAL_CONNECT", req);
  if (!perm.ok) {
    return redirectToConnectedAccounts(req, { meta: "unauthorized" });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  const errorReason = url.searchParams.get("error_reason");
  const errorDescription = url.searchParams.get("error_description");
  const errorCode = url.searchParams.get("error_code");
  const storedState = req.cookies.get("meta_oauth_state")?.value;

  logger.info("auth", "Meta Business OAuth callback received", {
    callbackReceived: true,
    authorizationCodePresent: Boolean(code),
    statePresent: Boolean(state),
    storedStatePresent: Boolean(storedState),
    providerErrorPresent: Boolean(error),
    selectedPageIdPresent: ["page_id", "selected_page_id", "target_id"].some((key) =>
      Boolean(url.searchParams.get(key)),
    ),
  });

  const fail = (reason: string) =>
    redirectToConnectedAccounts(req, { meta: "error", reason });

  if (error) {
    logger.warn("auth", "Meta Business OAuth callback rejected", {
      error,
      errorReason,
      errorDescription,
      errorCode,
      configurationIdLast4: process.env.META_LOGIN_CONFIG_ID?.slice(-4) ?? "not-configured",
    });
    const message =
      errorReason === "user_denied"
        ? "Authorization cancelled by user"
        : errorDescription || error;
    return fail(message);
  }
  if (!code) return fail("Missing authorization code");
  if (!state || !storedState || state !== storedState) {
    return fail("Invalid OAuth state (possible CSRF)");
  }

  try {
    const user = perm.user!;
    const plan = getMetaOAuthPlan();
    const { configurationId } = getMetaBusinessLoginEnv();

    const short = await exchangeCodeForToken(code);
    const longLived = await getLongLivedToken(short.access_token);
    logger.info("auth", "Meta OAuth code exchange completed", {
      codeExchangeSuccess: true,
      userAccessTokenReceived: Boolean(longLived.access_token),
    });
    const { expiresAt } = tokenExpiryInfo(longLived.expires_in);

    const tokenDebug = await debugToken(longLived.access_token);
    const scopes = tokenDebug.granted_scopes ?? tokenDebug.scopes ?? [];
    const missingScopes = plan.requestedScopes.filter((scope) => !scopes.includes(scope));
    const selectedPageIds = getSelectedMetaPageIds(url.searchParams, tokenDebug);
    logger.info("auth", "Meta Business OAuth callback scopes", {
      configurationIdLast4: configurationId.slice(-4),
      requestedScopes: plan.requestedScopes,
      grantedScopes: scopes,
      missingScopes,
      granularScopeCount: tokenDebug.granular_scopes?.length ?? 0,
      selectedPageIds,
    });

    const discovery = await discoverPages(longLived.access_token);
    let pages = discovery.pages;
    logger.info("auth", "Meta GET /me/accounts response", {
      responseStatus: discovery.status,
      ok: discovery.ok,
      pageCount: pages.length,
      pageIds: pages.map((page) => page.id),
      pageNames: pages.map((page) => page.name),
      pageTasks: pages.map((page) => ({ pageId: page.id, tasks: page.tasks ?? [] })),
      errorCode: discovery.error?.code,
      errorType: discovery.error?.type,
      errorKind: discovery.error?.kind,
    });

    // Business Login may identify the selected Page through callback
    // parameters or granular scope target IDs even when /me/accounts is empty.
    if (!pages.length && selectedPageIds.length) {
      for (const selectedPageId of selectedPageIds) {
        const selected = await discoverPageById(longLived.access_token, selectedPageId);
        logger.info("auth", "Meta selected Page fallback response", {
          selectedPageId,
          responseStatus: selected.status,
          ok: selected.ok,
          pageCount: selected.pages.length,
          pageIds: selected.pages.map((page) => page.id),
          pageNames: selected.pages.map((page) => page.name),
          pageTasks: selected.pages.map((page) => ({
            pageId: page.id,
            tasks: page.tasks ?? [],
          })),
          errorCode: selected.error?.code,
          errorType: selected.error?.type,
          errorKind: selected.error?.kind,
        });
        pages = [...pages, ...selected.pages];
      }
    }

    if (!pages.length) {
      logger.warn("auth", "Meta Page discovery returned no accessible Pages", {
        responseStatus: discovery.status,
        grantedScopes: scopes,
        missingScopes,
        selectedPageIds,
      });
      return fail(
        missingScopes.length
          ? `Facebook Page access is missing required permissions: ${missingScopes.join(", ")}`
          : "No accessible Facebook Page was returned. Reconnect and select a Page you manage.",
      );
    }

    const page =
      pages.find((candidate) => selectedPageIds.includes(candidate.id)) ??
      pages.find((candidate) =>
        candidate.tasks?.some((task) => task === "MANAGE" || task === "CREATE_CONTENT"),
      );
    if (!page) {
      return fail("The Facebook user must have Page management or content-creation access");
    }

    const instagramEnabled =
      plan.features.includes("instagram_publish") ||
      plan.features.includes("instagram_insights");
    const instagram = instagramEnabled
      ? await getInstagramBusiness(page.id, page.access_token)
      : null;

    await connectMetaAccount({
      page: { id: page.id, name: page.name, accessToken: page.access_token },
      ig: instagram ? { id: instagram.id, username: instagram.username } : null,
      userToken: longLived.access_token,
      permissions: scopes,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      connectedBy: user.name ?? user.email,
      connectedById: user.id,
    });

    logger.info("auth", "Meta OAuth Page saved", {
      pageSaved: true,
      pageId: page.id,
      pageName: page.name,
      instagramAccountSaved: Boolean(instagram),
    });

    const response = redirectToConnectedAccounts(req, { meta: "success" });
    response.cookies.set("meta_oauth_state", "", { path: "/", maxAge: 0 });
    return response;
  } catch (error: any) {
    logger.error("auth", "Meta Business OAuth callback failed", {
      message: error?.message ?? "Meta connection failed",
      configurationIdLast4: process.env.META_LOGIN_CONFIG_ID?.slice(-4) ?? "not-configured",
    });
    return fail(error?.message ?? "Meta connection failed");
  }
}
