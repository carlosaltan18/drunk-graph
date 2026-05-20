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
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap">
    <style>
      html, body { margin: 0; padding: 0; height: 100%; }
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

      body {
        font-family: 'Inter', sans-serif;
        display: flex;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }

      .panel-left {
        display: none;
        width: 50%;
        background: #09090b;
        flex-direction: column;
        justify-content: space-between;
        padding: 48px;
      }

      @media (min-width: 1024px) {
        .panel-left { display: flex; }
      }

      .panel-left .brand {
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
        letter-spacing: -0.01em;
      }

      .panel-left .quote {
        font-size: 13px;
        line-height: 1.7;
        color: #71717a;
      }

      .panel-right {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
        padding: 32px;
      }

      .card {
        width: 100%;
        max-width: 340px;
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .card-header { display: flex; flex-direction: column; gap: 4px; }

      .card-header h1 {
        font-size: 22px;
        font-weight: 600;
        color: #09090b;
        letter-spacing: -0.02em;
      }

      .card-header p {
        font-size: 13px;
        color: #71717a;
      }

      .footer {
        font-size: 11px;
        color: #a1a1aa;
        text-align: center;
        line-height: 1.6;
      }

      .footer a { color: #71717a; text-decoration: underline; text-underline-offset: 2px; }

      /* Hide the "or" divider and FusionAuth's container spacing */
      #login-button-container .relative { display: none; }
      #login-button-container { margin-top: 0 !important; }

      .login-button {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 10px !important;
        width: 100% !important;
        padding: 10px 16px !important;
        border: 1px solid #e4e4e7 !important;
        border-radius: 8px !important;
        background: #ffffff !important;
        font-size: 13px !important;
        font-family: 'Inter', sans-serif !important;
        font-weight: 500 !important;
        color: #18181b !important;
        cursor: pointer !important;
        transition: background 0.15s !important;
        height: auto !important;
        box-shadow: none !important;
      }

      .login-button:hover { background: #f4f4f5 !important; }
      .login-button:active { transform: scale(0.99); }

      .login-button .icon { width: 16px !important; height: 16px !important; flex-shrink: 0 !important; margin-right: 8px !important; }
      .login-button .icon svg { width: 16px !important; height: 16px !important; }
      .login-button .text-normal { font-size: 13px !important; font-family: 'Inter', sans-serif !important; }
    </style>
  [/@helpers.head]

  [@helpers.body]
    <div class="panel-left">
      <span class="brand">DrunkGraph</span>
      <p class="quote">"Recommendations that actually make sense — powered by the connections between things, not just what's popular."</p>
    </div>

    <div class="panel-right">
      <div class="card">
        <div class="card-header">
          <h1>Welcome back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        <form style="display:none">[@helpers.oauthHiddenFields/]</form>

        [@helpers.alternativeLogins clientId=client_id identityProviders=identityProviders passwordlessEnabled=passwordlessEnabled bootstrapWebauthnEnabled=bootstrapWebauthnEnabled idpRedirectState=idpRedirectState federatedCSRFToken=federatedCSRFToken/]

        <p class="footer">
          By signing in you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
        </p>
      </div>
    </div>
  [/@helpers.body]
[/@helpers.html]
