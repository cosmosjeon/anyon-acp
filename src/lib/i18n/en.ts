const en = {
  // Settings - Header
  'settings.title': 'Settings',
  'settings.subtitle': 'Configure Claude Code preferences',
  'settings.save': 'Save Settings',
  'settings.saving': 'Saving...',
  'settings.saved': 'Settings saved successfully!',
  'settings.saveFailed': 'Failed to save settings',

  // Settings - Tabs
  'settings.tab.account': 'Account',
  'settings.tab.general': 'General',
  'settings.tab.permissions': 'Permissions',
  'settings.tab.environment': 'Environment',
  'settings.tab.advanced': 'Advanced',
  'settings.tab.hooks': 'Hooks',
  'settings.tab.commands': 'Commands',
  'settings.tab.storage': 'Storage',
  'settings.tab.proxy': 'Proxy',

  // Settings - Account Tab
  'settings.account.title': 'Account Information',
  'settings.account.name': 'Name',
  'settings.account.email': 'Email',
  'settings.account.subscription': 'Subscription',
  'settings.account.currentPlan': 'Current Plan',
  'settings.account.comingSoon': 'Coming Soon',
  'settings.account.proDescription': 'Pro plan will be available soon. Unlimited projects, priority support, and more benefits.',
  'settings.account.logout': 'Logout',
  'settings.account.logoutDescription': 'Sign out of your account',

  // Settings - General Tab
  'settings.general.title': 'General Settings',
  'settings.general.darkMode': 'Dark Mode',
  'settings.general.darkModeDesc': 'Toggle between dark and light theme',
  'settings.general.coauthored': 'Include "Co-authored by Claude"',
  'settings.general.coauthoredDesc': 'Add Claude attribution to git commits and pull requests',
  'settings.general.verbose': 'Verbose Output',
  'settings.general.verboseDesc': 'Show full bash and command outputs',
  'settings.general.retention': 'Chat Transcript Retention (days)',
  'settings.general.retentionDesc': 'How long to retain chat transcripts locally (default: 30 days)',
  'settings.general.analytics': 'Enable Analytics',
  'settings.general.analyticsDesc': 'Help improve ANYON by sharing anonymous usage data',
  'settings.general.analyticsEnabled': 'Analytics enabled',
  'settings.general.analyticsDisabled': 'Analytics disabled',
  'settings.general.privacyTitle': 'Your privacy is protected',
  'settings.general.privacyItem1': 'No personal information or file contents collected',
  'settings.general.privacyItem2': 'All data is anonymous with random IDs',
  'settings.general.privacyItem3': 'You can disable analytics at any time',
  'settings.general.tabPersistence': 'Remember Open Tabs',
  'settings.general.tabPersistenceDesc': 'Restore your tabs when you restart the app',
  'settings.general.tabPersistenceEnabled': 'Tab persistence enabled - your tabs will be restored on restart',
  'settings.general.tabPersistenceDisabled': 'Tab persistence disabled - tabs will not be saved',
  'settings.general.startupIntro': 'Show Welcome Intro on Startup',
  'settings.general.startupIntroDesc': 'Display a brief welcome animation when the app launches',
  'settings.general.startupIntroEnabled': 'Welcome intro enabled',
  'settings.general.startupIntroDisabled': 'Welcome intro disabled',
  'settings.general.language': 'Language',
  'settings.general.languageDesc': 'Select your preferred language',
  'settings.general.updateFailed': 'Failed to update preference',

  // Settings - Permissions Tab
  'settings.permissions.title': 'Permission Rules',
  'settings.permissions.description': 'Control which tools Claude Code can use without manual approval',
  'settings.permissions.allowRules': 'Allow Rules',
  'settings.permissions.denyRules': 'Deny Rules',
  'settings.permissions.addRule': 'Add Rule',
  'settings.permissions.noAllowRules': 'No allow rules configured. Claude will ask for approval for all tools.',
  'settings.permissions.noDenyRules': 'No deny rules configured.',
  'settings.permissions.examples': 'Examples:',
  'settings.permissions.exampleBash': 'Allow all bash commands',
  'settings.permissions.exampleBashExact': 'Allow exact command',
  'settings.permissions.exampleBashPrefix': 'Allow commands with prefix',
  'settings.permissions.exampleRead': 'Allow reading specific file',
  'settings.permissions.exampleEdit': 'Allow editing files in docs directory',

  // Settings - Environment Tab
  'settings.environment.title': 'Environment Variables',
  'settings.environment.description': 'Environment variables applied to every Claude Code session',
  'settings.environment.addVariable': 'Add Variable',
  'settings.environment.noVariables': 'No environment variables configured.',
  'settings.environment.commonVariables': 'Common variables:',

  // Settings - Advanced Tab
  'settings.advanced.title': 'Advanced Settings',
  'settings.advanced.description': 'Additional configuration options for advanced users',
  'settings.advanced.apiKeyHelper': 'API Key Helper Script',
  'settings.advanced.apiKeyHelperDesc': 'Custom script to generate auth values for API requests',
  'settings.advanced.rawJson': 'Raw Settings (JSON)',
  'settings.advanced.rawJsonDesc': 'This shows the raw JSON that will be saved to ~/.claude/settings.json',

  // Settings - Hooks Tab
  'settings.hooks.title': 'User Hooks',
  'settings.hooks.description': 'Configure hooks that apply to all Claude Code sessions for your user account. These are stored in',

  // Settings - Error messages
  'settings.error.loadFailed': 'Failed to load settings. Please ensure ~/.claude directory exists.',
  'settings.error.saveFailed': 'Failed to save settings.',

  // Settings - General Tab (additional)
  'settings.general.binaryPathChanged': 'Changes will be applied when you save settings.',
  'settings.general.claudeVersion': 'Claude Version',

  // Settings - Environment Tab (additional)
  'settings.environment.keyPlaceholder': 'KEY',
  'settings.environment.valuePlaceholder': 'value',
  'settings.environment.telemetryDesc': 'Enable/disable telemetry (0 or 1)',
  'settings.environment.modelDesc': 'Custom model name',
  'settings.environment.costWarningsDesc': 'Disable cost warnings (1)',

  // Settings - Permissions Tab (additional)
  'settings.permissions.allowPlaceholder': 'e.g., Bash(npm run test:*)',
  'settings.permissions.denyPlaceholder': 'e.g., Bash(curl:*)',

  // Settings - Storage Tab
  'settings.storage.title': 'Database Storage',
  'settings.storage.description': 'View and manage the local SQLite database',
  'settings.storage.selectTable': 'Select a table',
  'settings.storage.search': 'Search...',
  'settings.storage.addRow': 'Add Row',
  'settings.storage.sqlEditor': 'SQL Editor',
  'settings.storage.resetDb': 'Reset Database',
  'settings.storage.noTables': 'No tables found',
  'settings.storage.loading': 'Loading...',
  'settings.storage.rows': 'rows',
  'settings.storage.page': 'Page',
  'settings.storage.of': 'of',
  'settings.storage.edit': 'Edit',
  'settings.storage.delete': 'Delete',
  'settings.storage.save': 'Save',
  'settings.storage.cancel': 'Cancel',
  'settings.storage.confirmDelete': 'Are you sure you want to delete this row?',
  'settings.storage.confirmReset': 'Are you sure you want to reset the database? This will delete all data.',
  'settings.storage.executeSql': 'Execute SQL',
  'settings.storage.sqlPlaceholder': 'Enter SQL query...',

  // Settings - Proxy Tab
  'settings.proxy.title': 'Proxy Settings',
  'settings.proxy.description': 'Configure proxy settings for Claude API requests',
  'settings.proxy.enable': 'Enable Proxy',
  'settings.proxy.enableDesc': 'Use proxy for all Claude API requests',
  'settings.proxy.httpProxy': 'HTTP Proxy',
  'settings.proxy.httpProxyPlaceholder': 'http://proxy.example.com:8080',
  'settings.proxy.httpsProxy': 'HTTPS Proxy',
  'settings.proxy.httpsProxyPlaceholder': 'http://proxy.example.com:8080',
  'settings.proxy.noProxy': 'No Proxy',
  'settings.proxy.noProxyPlaceholder': 'localhost,127.0.0.1,.example.com',
  'settings.proxy.noProxyDesc': 'Comma-separated list of hosts that should bypass the proxy',
  'settings.proxy.allProxy': 'All Proxy (Optional)',
  'settings.proxy.allProxyPlaceholder': 'socks5://proxy.example.com:1080',
  'settings.proxy.allProxyDesc': 'Proxy URL to use for all protocols if protocol-specific proxies are not set',
  'settings.proxy.saved': 'Proxy settings saved and applied successfully.',
  'settings.proxy.saveFailed': 'Failed to save proxy settings',
  'settings.proxy.loadFailed': 'Failed to load proxy settings',

  // Language names
  'language.en': 'English',
  'language.ko': '한국어',
} as const;

export default en;
