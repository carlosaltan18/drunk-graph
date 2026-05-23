[#ftl/]
[#setting url_escaping_charset="UTF-8"]
[#-- @ftlvariable name="identityProviders" type="java.util.Map<java.lang.String, java.util.List<io.fusionauth.domain.provider.BaseIdentityProvider<?>>>" --]
[#-- @ftlvariable name="idpRedirectState" type="java.lang.String" --]
[#-- @ftlvariable name="federatedCSRFToken" type="java.lang.String" --]
[#-- @ftlvariable name="passwordlessEnabled" type="boolean" --]
[#-- @ftlvariable name="bootstrapWebauthnEnabled" type="boolean" --]
[#-- @ftlvariable name="client_id" type="java.lang.String" --]
[#-- @ftlvariable name="tenant" type="io.fusionauth.domain.Tenant" --]
[#-- @ftlvariable name="version" type="java.lang.String" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    <script src="${request.contextPath}/js/identityProvider/InProgress.js?version=${version}"></script>
    [@helpers.alternativeLoginsScript clientId=client_id identityProviders=identityProviders/]
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&display=swap">
    <style>
      html, body { margin: 0; padding: 0; height: 100%; font-family: 'Inter', sans-serif; }
      *, *::before, *::after { box-sizing: border-box; }

      #login-button-container .relative { display: none !important; }
      #login-button-container { margin-top: 0 !important; }

      .login-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        width: 100% !important;
        padding: 16px 24px !important;
        border: 1px solid #3f3f46 !important;
        border-radius: 12px !important;
        background: #27272a !important;
        font-size: 15px !important;
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        color: #ffffff !important;
        cursor: pointer !important;
        transition: border-color 0.2s, background 0.2s !important;
        height: auto !important;
        box-shadow: none !important;
        margin-bottom: 10px !important;
      }
      .login-button:hover { border-color: rgba(251,191,36,0.5) !important; background: #2d2d30 !important; }
      .login-button:active { transform: scale(0.98) !important; }
      .login-button .icon { width: 20px !important; height: 20px !important; flex-shrink: 0 !important; margin-right: 0 !important; }
      .login-button .icon svg { width: 20px !important; height: 20px !important; }
      .login-button .text-normal { font-size: 15px !important; font-family: 'Inter', sans-serif !important; font-weight: 500 !important; }
    </style>
  [/@helpers.head]

  [@helpers.body]
    <div class="flex flex-col lg:flex-row min-h-screen w-full" style="background:#09090b;">

      <!-- LEFT PANEL: brand (hidden on mobile) -->
      <section class="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-12 overflow-hidden" style="background:#09090b;">
        <!-- Background text -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span class="font-black tracking-tighter opacity-[0.03]" style="font-size:16rem;line-height:1;transform:rotate(-6deg);color:#fbbf24;white-space:nowrap;" aria-hidden="true">
            STAFF ONLY
          </span>
        </div>

        <!-- Top: wordmark -->
        <div class="relative z-10">
          <h1 class="text-white text-2xl font-black tracking-tight uppercase">DRUNKGRAPH</h1>
          <span class="inline-block mt-1 bg-amber-400 text-zinc-950 text-[10px] font-black tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase">BACKOFFICE</span>
        </div>

        <!-- Center: tagline -->
        <div class="relative z-10">
          <h2 class="text-white text-4xl font-bold leading-tight">
            Venue management<br>console.
          </h2>
          <div class="mt-4 h-0.5 w-12" style="background:#fbbf24;"></div>
          <p class="mt-4 text-zinc-500 text-base leading-relaxed">
            Manage your bar catalog, upload drinks, and monitor venue activity.
          </p>
        </div>

        <!-- Bottom: badge -->
        <div class="relative z-10">
          <p class="text-zinc-600 text-xs font-bold uppercase tracking-widest">Authorized personnel only.</p>
        </div>

        <!-- Right edge accent -->
        <div class="absolute right-0 top-0 h-full w-0.5" style="background:#fbbf24;"></div>
      </section>

      <!-- RIGHT PANEL: auth -->
      <section class="panel flex flex-1 flex-col items-center justify-center p-8 lg:p-12" style="background:#18181b;">
        <div class="w-full max-w-sm space-y-8">

          <!-- Header -->
          <div class="space-y-2">
            <div class="flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <h2 class="text-white text-3xl font-black uppercase tracking-tight">STAFF LOGIN</h2>
            </div>
            <p class="text-zinc-500 text-sm font-medium">Restricted access. Authorized personnel only.</p>
          </div>

          <div class="h-px w-full" style="background:rgba(251,191,36,0.2);"></div>

          <!-- FusionAuth injects IdP buttons here -->
          <form style="display:none">[@helpers.oauthHiddenFields/]</form>
          <div class="flex flex-col items-stretch">
            [@helpers.alternativeLogins clientId=client_id identityProviders=identityProviders passwordlessEnabled=passwordlessEnabled bootstrapWebauthnEnabled=bootstrapWebauthnEnabled idpRedirectState=idpRedirectState federatedCSRFToken=federatedCSRFToken/]
          </div>

          <p class="text-center text-xs uppercase tracking-widest" style="color:#52525b;">
            Staff access only. Unauthorized use is prohibited.
          </p>
        </div>
      </section>
    </div>
  [/@helpers.body]
[/@helpers.html]
