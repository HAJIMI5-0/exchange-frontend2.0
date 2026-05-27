function Settings({ text, user, lang, setLang, theme, setTheme }) {
  return (
    <section className="settings-page">
      <div className="settings-card">
        <h1>{text.settingsPage || "设置页面"}</h1>

        <div className="settings-section">
          <h2>{text.accountSettings || "账号设置"}</h2>

          {user ? (
            <>
              <div className="settings-row">
                <span>{text.username || "用户名"}</span>
                <strong>{user?.name || user?.username || "-"}</strong>
              </div>

              <div className="settings-row">
                <span>{text.email || "邮箱"}</span>
                <strong>{user?.email || "-"}</strong>
              </div>
            </>
          ) : (
            <div className="settings-row">
              <span>{text.loginStatus || "登录状态"}</span>
              <strong>{text.notLoggedIn || "未登录"}</strong>
            </div>
          )}
        </div>

        <div className="settings-section">
          <h2>{text.appSettings || "应用设置"}</h2>

          <div className="settings-row">
            <span>{text.language || "语言"}</span>

            <select
              className="lang-select"
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="zh">中文</option>
              <option value="en">English</option>
              <option value="ko">한국어</option>
              <option value="ja">日本語</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className="settings-row theme-row">
            <span>{text.theme || "主题"}</span>

            <div className="theme-card-group">
              <button
                type="button"
                className={`theme-card ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                <div className="theme-preview theme-preview-dark">
                  <div className="theme-preview-nav"></div>
                  <div className="theme-preview-card"></div>
                </div>

                <p>{text.darkMode || "深色模式"}</p>

                <div className="theme-check">
                  {theme === "dark" ? "✓" : ""}
                </div>
              </button>

              <button
                type="button"
                className={`theme-card ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                <div className="theme-preview theme-preview-light">
                  <div className="theme-preview-nav"></div>
                  <div className="theme-preview-card"></div>
                </div>

                <p>{text.lightMode || "浅色模式"}</p>

                <div className="theme-check">
                  {theme === "light" ? "✓" : ""}
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="settings-section">
          <h2>{text.about || "关于"}</h2>

          <div className="settings-row">
            <span>{text.projectName || "项目名称"}</span>
            <strong>SOUL</strong>
          </div>

          <div className="settings-row">
            <span>{text.version || "版本"}</span>
            <strong>1.0.0</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Settings