const ko = {
  // Settings - Header
  'settings.title': '설정',
  'settings.subtitle': 'Claude Code 환경설정',
  'settings.save': '설정 저장',
  'settings.saving': '저장 중...',
  'settings.saved': '설정이 저장되었습니다!',
  'settings.saveFailed': '설정 저장에 실패했습니다',

  // Settings - Tabs
  'settings.tab.account': '계정',
  'settings.tab.general': '일반',
  'settings.tab.permissions': '권한',
  'settings.tab.environment': '환경변수',
  'settings.tab.advanced': '고급',
  'settings.tab.hooks': '훅',
  'settings.tab.commands': '명령어',
  'settings.tab.storage': '저장소',
  'settings.tab.proxy': '프록시',

  // Settings - Account Tab
  'settings.account.title': '계정 정보',
  'settings.account.name': '이름',
  'settings.account.email': '이메일',
  'settings.account.subscription': '구독 정보',
  'settings.account.currentPlan': '현재 플랜',
  'settings.account.comingSoon': '출시 예정',
  'settings.account.proDescription': 'Pro 플랜이 곧 출시될 예정입니다. 프로젝트 무제한, 우선 지원 등 다양한 혜택을 누리실 수 있습니다.',
  'settings.account.logout': '로그아웃',
  'settings.account.logoutDescription': '계정에서 로그아웃합니다',

  // Settings - General Tab
  'settings.general.title': '일반 설정',
  'settings.general.darkMode': '다크 모드',
  'settings.general.darkModeDesc': '다크/라이트 테마 전환',
  'settings.general.coauthored': '"Claude와 공동 작성" 표시',
  'settings.general.coauthoredDesc': 'git 커밋 및 PR에 Claude 표시 추가',
  'settings.general.verbose': '상세 출력',
  'settings.general.verboseDesc': 'bash 및 명령어 출력 전체 표시',
  'settings.general.retention': '채팅 기록 보관 기간 (일)',
  'settings.general.retentionDesc': '로컬에 채팅 기록을 보관하는 기간 (기본: 30일)',
  'settings.general.analytics': '분석 활성화',
  'settings.general.analyticsDesc': '익명 사용 데이터를 공유하여 ANYON 개선에 도움',
  'settings.general.analyticsEnabled': '분석이 활성화되었습니다',
  'settings.general.analyticsDisabled': '분석이 비활성화되었습니다',
  'settings.general.privacyTitle': '개인정보가 보호됩니다',
  'settings.general.privacyItem1': '개인정보나 파일 내용은 수집되지 않습니다',
  'settings.general.privacyItem2': '모든 데이터는 무작위 ID로 익명화됩니다',
  'settings.general.privacyItem3': '언제든지 분석을 비활성화할 수 있습니다',
  'settings.general.tabPersistence': '열린 탭 기억하기',
  'settings.general.tabPersistenceDesc': '앱 재시작 시 탭 복원',
  'settings.general.tabPersistenceEnabled': '탭 복원이 활성화되었습니다 - 재시작 시 탭이 복원됩니다',
  'settings.general.tabPersistenceDisabled': '탭 복원이 비활성화되었습니다 - 탭이 저장되지 않습니다',
  'settings.general.startupIntro': '시작 시 환영 인트로 표시',
  'settings.general.startupIntroDesc': '앱 실행 시 간단한 환영 애니메이션 표시',
  'settings.general.startupIntroEnabled': '환영 인트로가 활성화되었습니다',
  'settings.general.startupIntroDisabled': '환영 인트로가 비활성화되었습니다',
  'settings.general.language': '언어',
  'settings.general.languageDesc': '원하는 언어를 선택하세요',
  'settings.general.updateFailed': '환경설정 업데이트에 실패했습니다',

  // Settings - Permissions Tab
  'settings.permissions.title': '권한 규칙',
  'settings.permissions.description': 'Claude Code가 수동 승인 없이 사용할 수 있는 도구 제어',
  'settings.permissions.allowRules': '허용 규칙',
  'settings.permissions.denyRules': '거부 규칙',
  'settings.permissions.addRule': '규칙 추가',
  'settings.permissions.noAllowRules': '허용 규칙이 없습니다. Claude는 모든 도구에 대해 승인을 요청합니다.',
  'settings.permissions.noDenyRules': '거부 규칙이 없습니다.',
  'settings.permissions.examples': '예시:',
  'settings.permissions.exampleBash': '모든 bash 명령어 허용',
  'settings.permissions.exampleBashExact': '정확한 명령어 허용',
  'settings.permissions.exampleBashPrefix': '접두사로 시작하는 명령어 허용',
  'settings.permissions.exampleRead': '특정 파일 읽기 허용',
  'settings.permissions.exampleEdit': 'docs 디렉토리 파일 편집 허용',

  // Settings - Environment Tab
  'settings.environment.title': '환경 변수',
  'settings.environment.description': '모든 Claude Code 세션에 적용되는 환경 변수',
  'settings.environment.addVariable': '변수 추가',
  'settings.environment.noVariables': '환경 변수가 없습니다.',
  'settings.environment.commonVariables': '자주 사용하는 변수:',

  // Settings - Advanced Tab
  'settings.advanced.title': '고급 설정',
  'settings.advanced.description': '고급 사용자를 위한 추가 설정 옵션',
  'settings.advanced.apiKeyHelper': 'API 키 헬퍼 스크립트',
  'settings.advanced.apiKeyHelperDesc': 'API 요청에 대한 인증 값을 생성하는 커스텀 스크립트',
  'settings.advanced.rawJson': '원본 설정 (JSON)',
  'settings.advanced.rawJsonDesc': '~/.claude/settings.json에 저장될 원본 JSON입니다',

  // Settings - Hooks Tab
  'settings.hooks.title': '사용자 훅',
  'settings.hooks.description': '사용자 계정의 모든 Claude Code 세션에 적용되는 훅을 설정합니다. 저장 위치:',

  // Settings - Error messages
  'settings.error.loadFailed': '설정을 불러오지 못했습니다. ~/.claude 디렉토리가 있는지 확인하세요.',
  'settings.error.saveFailed': '설정 저장에 실패했습니다.',

  // Settings - General Tab (additional)
  'settings.general.binaryPathChanged': '설정을 저장하면 변경사항이 적용됩니다.',
  'settings.general.claudeVersion': 'Claude 버전',

  // Settings - Environment Tab (additional)
  'settings.environment.keyPlaceholder': '키',
  'settings.environment.valuePlaceholder': '값',
  'settings.environment.telemetryDesc': '텔레메트리 활성화/비활성화 (0 또는 1)',
  'settings.environment.modelDesc': '커스텀 모델 이름',
  'settings.environment.costWarningsDesc': '비용 경고 비활성화 (1)',

  // Settings - Permissions Tab (additional)
  'settings.permissions.allowPlaceholder': '예: Bash(npm run test:*)',
  'settings.permissions.denyPlaceholder': '예: Bash(curl:*)',

  // Settings - Storage Tab
  'settings.storage.title': '데이터베이스 저장소',
  'settings.storage.description': '로컬 SQLite 데이터베이스 조회 및 관리',
  'settings.storage.selectTable': '테이블 선택',
  'settings.storage.search': '검색...',
  'settings.storage.addRow': '행 추가',
  'settings.storage.sqlEditor': 'SQL 편집기',
  'settings.storage.resetDb': '데이터베이스 초기화',
  'settings.storage.noTables': '테이블을 찾을 수 없습니다',
  'settings.storage.loading': '로딩 중...',
  'settings.storage.rows': '행',
  'settings.storage.page': '페이지',
  'settings.storage.of': '/',
  'settings.storage.edit': '편집',
  'settings.storage.delete': '삭제',
  'settings.storage.save': '저장',
  'settings.storage.cancel': '취소',
  'settings.storage.confirmDelete': '이 행을 삭제하시겠습니까?',
  'settings.storage.confirmReset': '데이터베이스를 초기화하시겠습니까? 모든 데이터가 삭제됩니다.',
  'settings.storage.executeSql': 'SQL 실행',
  'settings.storage.sqlPlaceholder': 'SQL 쿼리를 입력하세요...',

  // Settings - Proxy Tab
  'settings.proxy.title': '프록시 설정',
  'settings.proxy.description': 'Claude API 요청에 대한 프록시 설정 구성',
  'settings.proxy.enable': '프록시 활성화',
  'settings.proxy.enableDesc': '모든 Claude API 요청에 프록시 사용',
  'settings.proxy.httpProxy': 'HTTP 프록시',
  'settings.proxy.httpProxyPlaceholder': 'http://proxy.example.com:8080',
  'settings.proxy.httpsProxy': 'HTTPS 프록시',
  'settings.proxy.httpsProxyPlaceholder': 'http://proxy.example.com:8080',
  'settings.proxy.noProxy': '프록시 제외',
  'settings.proxy.noProxyPlaceholder': 'localhost,127.0.0.1,.example.com',
  'settings.proxy.noProxyDesc': '프록시를 우회할 호스트 목록 (쉼표로 구분)',
  'settings.proxy.allProxy': '전체 프록시 (선택사항)',
  'settings.proxy.allProxyPlaceholder': 'socks5://proxy.example.com:1080',
  'settings.proxy.allProxyDesc': '프로토콜별 프록시가 설정되지 않은 경우 사용할 프록시 URL',
  'settings.proxy.saved': '프록시 설정이 저장되고 적용되었습니다.',
  'settings.proxy.saveFailed': '프록시 설정 저장에 실패했습니다',
  'settings.proxy.loadFailed': '프록시 설정 불러오기에 실패했습니다',

  // Language names
  'language.en': 'English',
  'language.ko': '한국어',
} as const;

export default ko;
