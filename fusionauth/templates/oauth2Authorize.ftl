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

      /* Hide the FusionAuth "or" divider and default container spacing */
      #login-button-container .relative { display: none !important; }
      #login-button-container { margin-top: 0 !important; }

      /* Style the injected identity provider buttons */
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
      .login-button:hover { border-color: rgba(249,115,22,0.5) !important; background: #2d2d30 !important; }
      .login-button:active { transform: scale(0.98) !important; }
      .login-button .icon { width: 20px !important; height: 20px !important; flex-shrink: 0 !important; margin-right: 0 !important; }
      .login-button .icon svg { width: 20px !important; height: 20px !important; }
      .login-button .text-normal { font-size: 15px !important; font-family: 'Inter', sans-serif !important; font-weight: 500 !important; }
    </style>
  [/@helpers.head]

  [@helpers.body]
    <div class="flex flex-col md:flex-row min-h-screen w-full" style="background:#09090b;">

      <!-- LEFT PANEL: brand (hidden on mobile, shown on md+) -->
      <section class="relative hidden md:flex md:w-[52%] flex-col justify-between p-12 lg:p-16 overflow-hidden" style="background:#09090b;">
        <!-- Enormous background word -->
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span class="text-[#121214] font-black tracking-tighter" style="font-size:18rem;line-height:1;transform:rotate(-3deg);" aria-hidden="true">
            DRINK
          </span>
        </div>

        <!-- Top: wordmark -->
        <div class="relative z-10">
          <h1 class="text-white text-2xl font-black tracking-tight uppercase flex items-center gap-1">
            DRUNKGRAPH<span class="inline-block w-2 h-2 rounded-full" style="background:#f97316;"></span>
          </h1>
        </div>

        <!-- Center: tagline -->
        <div class="relative z-10">
          <h2 class="text-white text-4xl lg:text-5xl font-bold italic tracking-tight leading-tight">
            Every drink<br>has a reason.
          </h2>
          <div class="mt-4 h-0.5 w-12" style="background:#f97316;"></div>
        </div>

        <!-- Bottom: quote -->
        <div class="relative z-10">
          <blockquote class="text-sm italic" style="color:#71717a;">
            "Recommendations that actually make sense — powered by the connections between things, not just what's popular."
          </blockquote>
        </div>

        <!-- Right edge accent line -->
        <div class="absolute right-0 top-0 h-full w-0.5" style="background:#f97316;"></div>
      </section>

      <!-- RIGHT PANEL: auth -->
      <section class="panel flex flex-1 flex-col" style="background:#18181b;">

        <!-- Mobile-only top brand bar -->
        <div class="md:hidden relative flex flex-col justify-between p-8 overflow-hidden" style="height:45vh;background:#09090b;">
          <!-- Big background letters -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            <span class="font-black tracking-tighter" style="color:#121214;font-size:20rem;line-height:1;transform:rotate(-12deg) translate(25%,-25%);" aria-hidden="true">DG</span>
          </div>
          <!-- Brand -->
          <div class="relative z-10">
            <h1 class="text-white text-xl font-black tracking-tight flex items-center">
              DRUNKGRAPH<span class="inline-block w-2 h-2 rounded-full ml-1" style="background:#f97316;"></span>
            </h1>
          </div>
          <!-- Tagline -->
          <div class="relative z-10 mb-8">
            <h2 class="text-white text-4xl font-bold leading-tight tracking-tight uppercase">
              Find your<br>drink.
            </h2>
            <p class="text-sm italic mt-2" style="color:#71717a;">Powered by the graph.</p>
          </div>
          <!-- Bottom accent -->
          <div class="absolute bottom-0 left-0 w-full h-0.5" style="background:#f97316;"></div>
        </div>

        <!-- Auth content -->
        <div class="flex flex-1 flex-col items-center justify-center p-8 md:p-12 lg:p-16">
          <div class="w-full max-w-sm space-y-8 text-center">
            <div class="space-y-2">
              <h2 class="text-white text-4xl md:text-5xl font-black uppercase tracking-tight">SIGN IN</h2>
              <p class="text-sm font-medium uppercase tracking-widest" style="color:#71717a;">Choose your provider.</p>
            </div>

            <div class="mx-auto h-px w-48" style="background:rgba(249,115,22,0.3);"></div>

            <!-- FusionAuth injects Google + GitHub buttons here -->
            <form style="display:none">[@helpers.oauthHiddenFields/]</form>
            <div class="flex flex-col items-stretch">
              [@helpers.alternativeLogins clientId=client_id identityProviders=identityProviders passwordlessEnabled=passwordlessEnabled bootstrapWebauthnEnabled=bootstrapWebauthnEnabled idpRedirectState=idpRedirectState federatedCSRFToken=federatedCSRFToken/]
            </div>

            <p class="text-xs uppercase tracking-widest" style="color:#52525b;">
              By signing in you agree to our terms of service.
            </p>
          </div>

          <div class="mt-16 text-center">
            <p class="text-xs font-bold uppercase tracking-widest" style="color:#3f3f46;">
              Bar staff? <a href="/admin" style="color:#3f3f46;transition:color 0.2s;" onmouseover="this.style.color='rgba(249,115,22,0.8)'" onmouseout="this.style.color='#3f3f46'">admin.drunkgraph.com →</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  [/@helpers.body]
[/@helpers.html]
