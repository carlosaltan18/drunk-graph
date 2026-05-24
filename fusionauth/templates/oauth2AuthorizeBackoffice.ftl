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
[#-- @ftlvariable name="loginId" type="java.lang.String" --]
[#-- @ftlvariable name="showPasswordField" type="boolean" --]
[#import "../_helpers.ftl" as helpers/]

[@helpers.html]
  [@helpers.head]
    <script src="${request.contextPath}/js/identityProvider/InProgress.js?version=${version}"></script>
    [@helpers.alternativeLoginsScript clientId=client_id identityProviders=identityProviders/]
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&display=swap">
    <style>
      html, body { font-family: 'Inter', sans-serif; }
      input:-webkit-autofill,
      input:-webkit-autofill:focus { -webkit-box-shadow: 0 0 0 100px #27272a inset; -webkit-text-fill-color: #fff; }
      #login-button-container .relative { display: none; }
      #login-button-container { margin-top: 0; }
      .login-button {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        width: 100%; padding: 14px 20px; margin-bottom: 10px;
        border: 1px solid #3f3f46; border-radius: 10px; background: #27272a;
        font-size: 14px; font-family: 'Inter', sans-serif; font-weight: 500; color: #fff;
        cursor: pointer; transition: border-color 0.2s, background 0.2s;
      }
      .login-button:hover { border-color: rgba(251,191,36,0.4); background: #2d2d30; }
      .login-button .icon { width: 18px; height: 18px; flex-shrink: 0; }
      .login-button .icon svg { width: 18px; height: 18px; }
    </style>
  [/@helpers.head]

  [@helpers.body]
    <div class="flex min-h-screen w-full bg-[#09090b]">

      <!-- LEFT PANEL -->
      <section class="relative hidden lg:flex lg:w-[45%] flex-col justify-between p-12 overflow-hidden bg-[#09090b] border-r border-amber-400">
        <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span class="font-black text-amber-400 opacity-[0.03] whitespace-nowrap" style="font-size:16rem;line-height:1;transform:rotate(-6deg);" aria-hidden="true">STAFF ONLY</span>
        </div>

        <div class="relative z-10">
          <h1 class="text-white text-2xl font-black tracking-tight uppercase">DRUNKGRAPH</h1>
          <span class="inline-block mt-1 bg-amber-400 text-zinc-950 text-[10px] font-black tracking-[0.2em] px-2 py-0.5 rounded-sm uppercase">BACKOFFICE</span>
        </div>

        <div class="relative z-10">
          <h2 class="text-white text-4xl font-bold leading-tight">Venue management<br>console.</h2>
          <div class="mt-4 h-0.5 w-12 bg-amber-400"></div>
          <p class="mt-4 text-zinc-500 text-base leading-relaxed">Manage your bar catalog, upload drinks, and monitor venue activity.</p>
        </div>

        <p class="relative z-10 text-zinc-600 text-xs font-bold uppercase tracking-widest">Authorized personnel only.</p>
      </section>

      <!-- RIGHT PANEL -->
      <section class="panel flex flex-1 flex-col items-center justify-center p-8 lg:p-12 bg-[#18181b]">
        <div class="w-full max-w-sm">

          <!-- Header -->
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
              <h2 class="text-white text-3xl font-black uppercase tracking-tight">STAFF LOGIN</h2>
            </div>
            <p class="text-zinc-500 text-sm font-medium">Restricted access. Authorized personnel only.</p>
          </div>

          <div class="h-px w-full bg-amber-400/20 mb-8"></div>

          <!-- Form card -->
          <div class="bg-[#1c1c1f] border border-[#2e2e32] rounded-2xl p-7">
            <form action="${request.contextPath}/oauth2/authorize" method="POST">
              [@helpers.oauthHiddenFields/]
              [@helpers.hidden name="showPasswordField"/]
              [@helpers.hidden name="userVerifyingPlatformAuthenticatorAvailable"/]

              <!-- Email field -->
              <div class="mb-4">
                <label class="block text-zinc-500 text-[10px] font-extrabold uppercase tracking-[0.15em] mb-2">Email Address</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#52525b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
                  <input
                    type="text"
                    name="loginId"
                    id="loginId"
                    value="${loginId!''}"
                    autocomplete="username"
                    autocapitalize="none"
                    autocorrect="off"
                    spellcheck="false"
                    [#if !loginId?has_content]autofocus[/#if]
                    placeholder="admin@yourbar.com"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 text-sm font-medium py-3.5 pl-10 pr-4 outline-none focus:border-amber-400/50 focus:bg-zinc-800 transition-colors caret-amber-400"
                  />
                </div>
              </div>

              <!-- Password field -->
              [#if showPasswordField]
              <div class="mb-2">
                <label class="block text-zinc-500 text-[10px] font-extrabold uppercase tracking-[0.15em] mb-2">Password</label>
                <div class="relative">
                  <svg class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#52525b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    autocomplete="current-password"
                    [#if loginId?has_content]autofocus[/#if]
                    placeholder="••••••••"
                    class="w-full bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-600 text-sm font-medium py-3.5 pl-10 pr-4 outline-none focus:border-amber-400/50 focus:bg-zinc-800 transition-colors caret-amber-400"
                  />
                </div>
              </div>
              [/#if]

              <!-- Submit -->
              [#if showPasswordField]
                <button type="submit" class="w-full mt-5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-zinc-950 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_4px_24px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2">
                  Sign In
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              [#else]
                <button type="submit" class="w-full mt-5 bg-amber-400 hover:bg-amber-300 active:scale-[0.98] text-zinc-950 font-black text-xs uppercase tracking-widest py-4 rounded-xl transition-all shadow-[0_4px_24px_rgba(251,191,36,0.2)] flex items-center justify-center gap-2">
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              [/#if]
            </form>
          </div>

          <!-- Forgot password -->
          [#if showPasswordField]
            <a href="${request.contextPath}/password/forgot" class="block text-center mt-5 text-zinc-600 text-xs font-semibold underline underline-offset-4 hover:text-zinc-400 transition-colors">Forgot your password?</a>
          [/#if]

          <!-- IdP buttons -->
          <div class="mt-6">
            [@helpers.alternativeLogins clientId=client_id identityProviders=identityProviders passwordlessEnabled=passwordlessEnabled bootstrapWebauthnEnabled=bootstrapWebauthnEnabled idpRedirectState=idpRedirectState federatedCSRFToken=federatedCSRFToken/]
          </div>

          <p class="mt-7 text-center text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-700">Staff access only. Unauthorized use is prohibited.</p>
        </div>
      </section>
    </div>
  [/@helpers.body]
[/@helpers.html]
